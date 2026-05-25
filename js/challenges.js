/* challenges.js — auto-generated monthly challenges, no curation needed */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const grid = document.querySelector('#challenges-grid');
  const lb   = document.querySelector('#leaderboard');

  /* ── Challenge templates ───────────────────────────────────
     10 templates; 4 are picked each month via a date-seeded
     shuffle so they rotate but are consistent within a month. */
  const TEMPLATES = [
    {
      slug: 'both-picks',
      title: 'Both picks, one weekend',
      description: "Watch this month's two films before the gathering. It changes the conversation when everyone's seen both.",
      target: 2, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Watched them back-to-back without leaving the room'
    },
    {
      slug: 'solo-dark',
      title: 'Solo screening',
      description: 'Watch a film alone. Lights off, phone face-down, no pausing. Just you and the screen.',
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Did not pause once'
    },
    {
      slug: 'old-film',
      title: 'From before you were born',
      description: 'Watch a film made at least 20 years before your birth year. Let something truly old surprise you.',
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Made before 1970'
    },
    {
      slug: 'new-country',
      title: 'New territory',
      description: "Watch a film from a country you've never seen a film from before. The map should grow.",
      target: 2, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Both films from different continents'
    },
    {
      slug: 'short-sprint',
      title: 'Short film sprint',
      description: 'Watch three short films — anything under 30 minutes counts. Shorts are a different discipline entirely.',
      target: 3, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'All three in a single sitting'
    },
    {
      slug: 'director-deep',
      title: 'Director deep-dive',
      description: 'Pick any director and watch two of their films. See if your reading of the first one changes.',
      target: 2, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Same director, different decades'
    },
    {
      slug: 'language-stretch',
      title: 'Language stretch',
      description: "Watch a film in a language you don't speak a single word of. No subtitles for the first five minutes.",
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Watched the whole thing without subtitles'
    },
    {
      slug: 'silent-era',
      title: 'Before sound',
      description: 'Watch a silent film — anything made before 1930. The grammar of cinema is different there.',
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Watched with live music or score only'
    },
    {
      slug: 'wheel-pick',
      title: 'Surrender to the wheel',
      description: 'Use the Movie Picker to pick your next film and watch whatever it lands on. No override.',
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Watched it the same day the wheel spun'
    },
    {
      slug: 'revisit',
      title: 'The revisit',
      description: "Rewatch a film you last saw more than five years ago. See what's changed — in it, or in you.",
      target: 1, per_film: 10, base_points: 160, bonus: 30,
      bonus_label: 'Changed your opinion completely'
    },
  ];

  /* Seeded shuffle — consistent within a calendar month */
  function monthlyPick(arr, count) {
    const seed = new Date().getFullYear() * 12 + new Date().getMonth();
    const out  = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.abs(((seed * 1664525 + 1013904223) ^ (i * 6364136223846793005)) % (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.slice(0, count);
  }

  const active = monthlyPick(TEMPLATES, 4);

  function scoreFor(ch, log) {
    const films    = log ? (log.films_watched || 0) : 0;
    const bonusHit = !!(log && log.bonus_hit);
    const base     = films >= ch.target ? ch.base_points : 0;
    const per      = films * ch.per_film;
    const bonus    = bonusHit ? ch.bonus : 0;
    return { films, base, per, bonus, total: base + per + bonus };
  }

  async function render() {
    const logs    = await db.list('challenge_log');
    const session = auth.current();

    grid.innerHTML = '';
    for (const ch of active) {
      const myLog = session
        ? logs.find(l => l.challenge_id === ch.slug && l.member === session.handle)
        : null;
      const sc = scoreFor(ch, myLog);

      const ticks = Array.from({ length: ch.target }, (_, i) =>
        `<button class="tick ${i < sc.films ? 'on' : ''}" data-idx="${i}" data-slug="${ch.slug}">${i + 1}</button>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'challenge';
      card.innerHTML = `
        <div class="head">
          <h3>${escapeHtml(ch.title)}</h3>
          <span class="deadline">This month</span>
        </div>
        <p class="desc">${escapeHtml(ch.description)}</p>
        <div class="progress">
          <div class="row between">
            <span class="mono muted" style="font-size:11px;letter-spacing:0.08em">PROGRESS · ${sc.films}/${ch.target}</span>
            <span class="mono muted" style="font-size:11px;letter-spacing:0.08em">+${ch.per_film} per · +${ch.base_points} on finish</span>
          </div>
          <div class="ticks">${ticks}</div>
        </div>
        <label class="bonus-toggle ${session ? '' : 'locked'}" data-slug="${ch.slug}">
          <input type="checkbox" ${myLog && myLog.bonus_hit ? 'checked' : ''} ${session ? '' : 'disabled'}>
          <span>Bonus: <em>${escapeHtml(ch.bonus_label)}</em></span>
          <span class="pts">+${ch.bonus}</span>
        </label>
        <div class="score-line">
          <div><strong>${sc.base}</strong>base</div>
          <div><strong>${sc.per}</strong>films</div>
          <div><strong>${sc.bonus}</strong>bonus</div>
          <div class="total"><strong>${sc.total}</strong>total</div>
        </div>
        ${!session ? `<button class="btn primary" onclick="window.openSignIn()">Sign in to track →</button>` : ''}
      `;

      card.querySelectorAll('.tick').forEach(btn => btn.addEventListener('click', async () => {
        if (!session) { window.openSignIn(); return; }
        const idx      = parseInt(btn.dataset.idx, 10);
        const newCount = (idx + 1 === sc.films) ? idx : idx + 1;
        if (myLog) await db.update('challenge_log', myLog.id, { films_watched: newCount });
        else       await db.insert('challenge_log', { challenge_id: ch.slug, member: session.handle, films_watched: newCount, bonus_hit: false });
        render();
      }));

      const bonusEl = card.querySelector('.bonus-toggle input');
      if (bonusEl) bonusEl.addEventListener('change', async () => {
        if (!session) return;
        if (myLog) await db.update('challenge_log', myLog.id, { bonus_hit: bonusEl.checked });
        else       await db.insert('challenge_log', { challenge_id: ch.slug, member: session.handle, films_watched: 0, bonus_hit: bonusEl.checked });
        render();
      });

      grid.appendChild(card);
    }

    /* Leaderboard across all challenge_log entries */
    const byMember = {};
    for (const l of logs) {
      const ch = TEMPLATES.find(t => t.slug === l.challenge_id);
      if (!ch) continue;
      const sc = scoreFor(ch, l);
      if (!byMember[l.member]) byMember[l.member] = { handle: l.member, total: 0, base: 0, per: 0, bonus: 0 };
      const m = byMember[l.member];
      m.total += sc.total; m.base += sc.base; m.per += sc.per; m.bonus += sc.bonus;
    }
    const ranked = Object.values(byMember).sort((a, b) => b.total - a.total);

    lb.innerHTML = `
      <div class="head-row" style="display:contents">
        <div class="rk">#</div><div>MEMBER</div><div>BREAKDOWN</div><div style="justify-content:flex-end">PTS</div>
      </div>
      ${ranked.map((m, i) => `
        <div class="rk">${String(i + 1).padStart(2, '0')}</div>
        <div class="who ${session && m.handle === session.handle ? 'you' : ''}">@${escapeHtml(m.handle)}</div>
        <div class="breakdown">${m.base}b · ${m.per}f · ${m.bonus}x</div>
        <div class="pts">${m.total}</div>
      `).join('') || '<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--ink-mute)">No entries yet — log your first film.</div>'}
    `;
  }

  render();
  window.addEventListener('auth:change', render);
})();
