/* hot-takes.js */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const grid = document.querySelector('#takes-grid');
  const composeRoot = document.querySelector('#compose-root');
  const filters = document.querySelectorAll('.filter-row button');
  let sort = 'hot';
  const votedKey = 'club5to7:voted';
  const voted = new Set(JSON.parse(localStorage.getItem(votedKey) || '[]'));

  function saveVoted() { localStorage.setItem(votedKey, JSON.stringify([...voted])); }

  async function render() {
    const all = await db.list('hot_takes', { sortBy: 'created_at', desc: true });
    const approved = all.filter(t => t.approved);
    let list = approved.slice();
    if (sort === 'hot') list.sort((a, b) => (b.votes||0) - (a.votes||0));
    if (sort === 'new') list.sort((a, b) => (b.created_at||0) - (a.created_at||0));
    if (sort === 'pinned') list = list.filter(t => t.pinned);

    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--ink-mute)">No takes match that filter.</div>`;
      return;
    }

    for (const t of list) {
      const cardEl = document.createElement('div');
      cardEl.className = 'take' + (t.pinned ? ' pinned' : '');
      cardEl.innerHTML = `
        <span class="quote-mark">“</span>
        <div class="meta">
          <span class="author">@${t.author}</span>
          <span>·</span>
          <span>${timeAgo(t.created_at)}</span>
        </div>
        <h3>${escapeHtml(t.title)}</h3>
        <p class="body">${escapeHtml(t.body)}</p>
        <div class="foot">
          <button class="vote-btn ${voted.has(t.id) ? 'voted' : ''}" data-id="${t.id}">
            ▲ <span>${t.votes || 0}</span>
          </button>
          <span class="mono" style="color:var(--ink-mute);margin-left:auto;font-size:11px">
            HT-${t.id.toUpperCase().slice(0,5)}
          </span>
        </div>
      `;
      cardEl.querySelector('.vote-btn').addEventListener('click', async () => {
        if (voted.has(t.id)) {
          voted.delete(t.id);
          await db.update('hot_takes', t.id, { votes: Math.max(0, (t.votes||0) - 1) });
        } else {
          voted.add(t.id);
          await db.update('hot_takes', t.id, { votes: (t.votes||0) + 1 });
        }
        saveVoted();
        render();
      });
      grid.appendChild(cardEl);
    }
  }

  function renderCompose() {
    const session = auth.current();
    if (!session) {
      composeRoot.innerHTML = `
        <div class="locked">
          <h3>Got a hot take?</h3>
          <p>Sign in to submit. Admin reviews everything before it goes public — usually within a day.</p>
          <button class="btn primary" onclick="window.openSignIn()">Sign in (demo)</button>
        </div>
      `;
    } else {
      composeRoot.innerHTML = `
        <div class="compose">
          <h3>Got a hot take?</h3>
          <div class="field" style="margin-bottom:12px">
            <label for="ht-title">A short, confident headline</label>
            <input id="ht-title" class="input" maxlength="80" placeholder="The 90-minute film is the only good film">
          </div>
          <div class="field">
            <label for="ht-body">Defend it (or don't)</label>
            <textarea id="ht-body" class="textarea" maxlength="400" placeholder="Two or three sentences. Conviction encouraged."></textarea>
            <span class="help help-mono">400 char max · queued for admin review before going public</span>
          </div>
          <div class="row" style="justify-content:space-between;margin-top:12px">
            <span class="footnote">Posting as <strong>@${session.handle}</strong></span>
            <button class="btn primary" id="ht-submit">Submit take →</button>
          </div>
        </div>
      `;
      document.querySelector('#ht-submit').addEventListener('click', async () => {
        const title = document.querySelector('#ht-title').value.trim();
        const body = document.querySelector('#ht-body').value.trim();
        if (!title || !body) { toast('Headline and body required'); return; }
        await db.insert('hot_takes', { author: session.handle, title, body, approved: false, pinned: false, votes: 0 });
        toast('Submitted · pending review');
        renderCompose();
      });
    }
  }

  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(o => o.classList.remove('on'));
    b.classList.add('on');
    sort = b.dataset.sort;
    render();
  }));

  renderCompose();
  render();

  window.addEventListener('auth:change', renderCompose);
  window.addEventListener('db:change', e => { if (e.detail.table === 'hot_takes') render(); });
})();

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function timeAgo(ts) {
  if (!ts) return 'just now';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
