/* challenges.js */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const grid = document.querySelector('#challenges-grid');
  const lb = document.querySelector('#leaderboard');

  function scoreFor(challenge, log) {
    const films = log ? log.films_watched || 0 : 0;
    const bonusHit = !!(log && log.bonus_hit);
    const base = films >= challenge.target ? (challenge.base_points || 160) : 0;
    const per = films * (challenge.per_film || 10);
    const bonus = bonusHit ? (challenge.bonus || 30) : 0;
    return { films, base, per, bonus, total: base + per + bonus };
  }

  async function render() {
    const challenges = (await db.list('challenges', { sortBy: 'created_at' })).filter(c => c.active);
    const logs = await db.list('challenge_log');
    const session = auth.current();

    // Cards
    grid.innerHTML = '';
    for (const c of challenges) {
      const myLog = session ? logs.find(l => l.challenge_id === c.id && l.member === session.handle) : null;
      const sc = scoreFor(c, myLog);
      const ticksHtml = Array.from({ length: c.target }).map((_, i) =>
        `<button class="tick ${i < sc.films ? 'on' : ''}" data-idx="${i}" data-id="${c.id}">${i+1}</button>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'challenge';
      card.innerHTML = `
        <div class="head">
          <h3>${escapeHtml(c.title)}</h3>
          <span class="deadline">${escapeHtml(c.ends_label || '')}</span>
        </div>
        <p class="desc">${escapeHtml(c.description)}</p>

        <div class="progress">
          <div class="row between">
            <span class="mono muted" style="font-size:11px;letter-spacing:0.08em">PROGRESS · ${sc.films}/${c.target}</span>
            <span class="mono muted" style="font-size:11px;letter-spacing:0.08em">+${c.per_film||10} per film · +${c.base_points||160} on completion</span>
          </div>
          <div class="ticks">${ticksHtml}</div>
        </div>

        <label class="bonus-toggle ${session ? '' : 'locked'}" data-c="${c.id}">
          <input type="checkbox" ${myLog && myLog.bonus_hit ? 'checked' : ''} ${session ? '' : 'disabled'}>
          <span>Bonus: watched <em>${escapeHtml(c.bonus_film || '—')}</em></span>
          <span class="pts">+${c.bonus || 30}</span>
        </label>

        <div class="score-line">
          <div><strong>${sc.base}</strong>base</div>
          <div><strong>${sc.per}</strong>films</div>
          <div><strong>${sc.bonus}</strong>bonus</div>
          <div class="total"><strong>${sc.total}</strong>total</div>
        </div>

        ${!session ? `<button class="btn primary" onclick="window.openSignIn()">Sign in to track →</button>` : ''}
      `;

      // Tick handlers
      card.querySelectorAll('.tick').forEach(btn => btn.addEventListener('click', async () => {
        if (!session) { window.openSignIn(); return; }
        const idx = parseInt(btn.dataset.idx, 10);
        const newCount = (idx + 1 === sc.films) ? idx : idx + 1;  // toggle-down if already at
        if (myLog) await db.update('challenge_log', myLog.id, { films_watched: newCount });
        else await db.insert('challenge_log', { challenge_id: c.id, member: session.handle, films_watched: newCount, bonus_hit: false });
      }));

      const bonusEl = card.querySelector('.bonus-toggle input');
      if (bonusEl) {
        bonusEl.addEventListener('change', async () => {
          if (!session) return;
          if (myLog) await db.update('challenge_log', myLog.id, { bonus_hit: bonusEl.checked });
          else await db.insert('challenge_log', { challenge_id: c.id, member: session.handle, films_watched: 0, bonus_hit: bonusEl.checked });
        });
      }

      grid.appendChild(card);
    }

    // Leaderboard — aggregate by member across all challenges
    const byMember = {};
    for (const l of logs) {
      const c = challenges.find(x => x.id === l.challenge_id);
      if (!c) continue;
      const sc = scoreFor(c, l);
      if (!byMember[l.member]) byMember[l.member] = { handle: l.member, total: 0, base: 0, per: 0, bonus: 0 };
      const m = byMember[l.member];
      m.total += sc.total; m.base += sc.base; m.per += sc.per; m.bonus += sc.bonus;
    }
    const ranked = Object.values(byMember).sort((a, b) => b.total - a.total);

    lb.innerHTML = `
      <div class="head-row" style="display:contents">
        <div class="rk">#</div>
        <div>MEMBER</div>
        <div>BREAKDOWN</div>
        <div style="justify-content:flex-end">PTS</div>
      </div>
      ${ranked.map((m, i) => `
        <div class="rk">${String(i+1).padStart(2,'0')}</div>
        <div class="who ${session && m.handle === session.handle ? 'you' : ''}">@${escapeHtml(m.handle)}</div>
        <div class="breakdown">${m.base}b · ${m.per}f · ${m.bonus}x</div>
        <div class="pts">${m.total}</div>
      `).join('') || '<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--ink-mute)">No entries yet.</div>'}
    `;
  }

  render();
  window.addEventListener('db:change', e => {
    if (['challenges', 'challenge_log'].includes(e.detail.table)) render();
  });
  window.addEventListener('auth:change', render);
})();
