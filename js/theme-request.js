/* theme-request.js */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const list = document.querySelector('#theme-list');
  const form = document.querySelector('#theme-form-root');
  const voteKey = 'club5to7:theme-votes';
  const voted = new Set(JSON.parse(localStorage.getItem(voteKey) || '[]'));
  const counts = JSON.parse(localStorage.getItem('club5to7:theme-vote-counts') || '{}');
  function saveVoted() { localStorage.setItem(voteKey, JSON.stringify([...voted])); localStorage.setItem('club5to7:theme-vote-counts', JSON.stringify(counts)); }

  const examples = [
    'Films set in trains',
    'East African new wave: 2010-now',
    'One-room movies',
    'Black & white after 1980',
    'Movies with no dialogue in the first 10 min',
    'Films your mom would hate'
  ];

  function renderForm() {
    const session = auth.current();
    if (!session) {
      form.innerHTML = `
        <div class="theme-form">
          <h3>Nominate a theme</h3>
          <p class="muted" style="font-size:14px">
            Sign in to nominate. We pick one each month based on votes and gut feeling.
          </p>
          <div><button class="btn primary" onclick="window.openSignIn()">Sign in (demo)</button></div>
        </div>
      `;
      return;
    }
    form.innerHTML = `
      <div class="theme-form">
        <h3>Nominate a theme</h3>
        <p class="muted" style="font-size:14px;margin-top:-8px">
          Posting as <strong>@${session.handle}</strong>. Curator reviews before listing.
        </p>
        <div class="field">
          <label for="theme-name">Theme</label>
          <input id="theme-name" class="input" maxlength="80" placeholder="Films of return">
        </div>
        <div class="field">
          <label for="theme-why">Why this theme?</label>
          <textarea id="theme-why" class="textarea" maxlength="280" placeholder="A sentence. Maybe two."></textarea>
          <span class="help help-mono">A short pitch. 280 char max.</span>
        </div>
        <div>
          <span class="help" style="display:block;margin-bottom:6px">Examples (click to fill)</span>
          <div class="examples">
            ${examples.map(e => `<button data-eg="${e}">${e}</button>`).join('')}
          </div>
        </div>
        <button class="btn primary" id="theme-submit" style="margin-top:8px">Submit nomination →</button>
      </div>
    `;
    form.querySelectorAll('[data-eg]').forEach(b => b.addEventListener('click', () => {
      form.querySelector('#theme-name').value = b.dataset.eg;
    }));
    form.querySelector('#theme-submit').addEventListener('click', async () => {
      const theme = form.querySelector('#theme-name').value.trim();
      const why = form.querySelector('#theme-why').value.trim();
      if (!theme) { toast('Theme name required'); return; }
      await db.insert('theme_requests', { theme, why, by: session.handle, status: 'pending' });
      toast('Nomination submitted');
      renderForm();
    });
  }

  async function renderList() {
    const all = await db.list('theme_requests', { sortBy: 'created_at', desc: true });
    const sorted = all.slice().sort((a, b) => (counts[b.id]||0) - (counts[a.id]||0));
    list.innerHTML = '';
    if (!sorted.length) {
      list.innerHTML = `<p class="muted" style="padding:24px 0">No nominations yet. Be the first.</p>`;
      return;
    }
    for (const t of sorted) {
      const n = counts[t.id] || 0;
      const isVoted = voted.has(t.id);
      const el = document.createElement('div');
      el.className = 'theme-item' + (t.status === 'queued' ? ' queued' : '');
      el.innerHTML = `
        <div class="vote"><div class="n">${n}</div><div class="l">VOTES</div></div>
        <div class="body">
          <h4>${escapeHtml(t.theme)}</h4>
          <p>${escapeHtml(t.why || '')}</p>
          <span class="by">— @${t.by || 'anon'} · ${timeAgo(t.created_at)}</span>
        </div>
        <div class="actions">
          <button class="theme-vote-btn ${isVoted ? 'on' : ''}" data-id="${t.id}" title="Vote">▲</button>
        </div>
      `;
      el.querySelector('.theme-vote-btn').addEventListener('click', () => {
        if (!auth.current()) { window.openSignIn(); return; }
        if (voted.has(t.id)) { voted.delete(t.id); counts[t.id] = Math.max(0, (counts[t.id]||0) - 1); }
        else { voted.add(t.id); counts[t.id] = (counts[t.id]||0) + 1; }
        saveVoted();
        renderList();
      });
      list.appendChild(el);
    }
  }

  renderForm();
  renderList();
  window.addEventListener('auth:change', renderForm);
  window.addEventListener('db:change', e => { if (e.detail.table === 'theme_requests') renderList(); });
})();
