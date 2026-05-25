/* shell.js · injects sidebar + footer chrome on every page.
   Pages mark themselves with <body data-page="hot-takes"> etc.    */

(function () {
  const NAV = [
    { page: 'home',          href: 'index.html',           label: 'Now Showing',   num: '01' },
    { page: 'hot-takes',     href: 'hot-takes.html',       label: 'Hot Takes',     num: '02' },
    { page: 'theme-request', href: 'theme-request.html',   label: 'Theme Requests',num: '03' },
    { page: 'digest',        href: 'digest.html',          label: 'The Digest',    num: '04' },
    { page: 'picker',        href: 'picker.html',          label: 'Movie Picker',  num: '05' },
    { page: 'rsvp',          href: 'rsvp.html',            label: 'Gatherings',    num: '06' },
    { page: 'challenges',    href: 'challenges.html',      label: 'Challenges',    num: '07' },
    { page: 'ping-pong',     href: 'ping-pong.html',       label: 'Ping Pong',     num: '08' },
    { page: 'about',         href: 'about.html',           label: 'About',         num: '09' },
  ];

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  async function renderShell() {
    const page = document.body.dataset.page || 'home';
    const settings = await (window.db ? db.get('site_settings', {}) : {}) || {};
    const session = window.auth ? auth.current() : null;

    const navHtml = NAV.map(n => `
      <a href="${n.href}" class="${n.page === page ? 'active' : ''}">
        <span class="num">${n.num}</span>
        <span>${n.label}</span>
      </a>
    `).join('');

    const themeNow = (window.theme && theme.get()) || 'light';

    const sessionBlock = session
      ? `<div class="session">
            <span class="avatar">${(session.handle || '?')[0].toUpperCase()}</span>
            <div>
              <div class="who">${session.handle}</div>
              <div class="role">${session.role}</div>
            </div>
            <button class="icon-btn" data-act="signout" title="Sign out" style="margin-left:auto;width:28px;height:28px;border-color:rgba(255,255,255,0.2);color:#fff">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
         </div>`
      : `<button class="btn sm" data-act="signin" style="border-color:rgba(255,255,255,0.25);color:#fff;align-self:flex-start">
            Sign in (demo)
         </button>`;

    const sidebar = el(`
      <aside class="sidebar">
        <a class="brand" href="index.html">
          <div class="mark">Club<em>5to7</em></div>
          <div class="tag">${settings.tagline ? 'ADDIS · EST. 2023' : 'ADDIS · EST. 2023'}</div>
        </a>

        <nav class="nav" aria-label="Primary">
          <div class="group-label">Reel A</div>
          ${navHtml}
          <div class="group-label">Studio</div>
          <a href="my-admin.html" class="${page==='admin'?'active':''}">
            <span class="num">10</span><span>Admin / CMS</span>
          </a>
        </nav>

        <div class="sidebar-foot">
          ${sessionBlock}
          <div class="theme-toggle" role="group" aria-label="Theme">
            <button data-theme="light" class="${themeNow==='light'?'on':''}">Day</button>
            <button data-theme="dark"  class="${themeNow==='dark'?'on':''}">Night</button>
          </div>
          <div class="reel-info">
            <span>REEL · 35MM</span>
            <span>v0.1</span>
          </div>
        </div>
      </aside>
    `);

    document.body.prepend(sidebar);
    document.body.classList.add('app');

    // Theme toggle
    sidebar.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.theme.set(btn.dataset.theme);
        sidebar.querySelectorAll('[data-theme]').forEach(b =>
          b.classList.toggle('on', b.dataset.theme === btn.dataset.theme));
      });
    });

    // Sign in / out
    sidebar.querySelectorAll('[data-act="signin"]').forEach(b => b.addEventListener('click', openSignIn));
    sidebar.querySelectorAll('[data-act="signout"]').forEach(b => b.addEventListener('click', () => {
      auth.signOut();
      location.reload();
    }));
  }

  /* ── Toast ───────────────────────────────────────────────────── */
  function ensureToastHost() {
    let h = document.querySelector('.toast-host');
    if (!h) { h = el('<div class="toast-host"></div>'); document.body.appendChild(h); }
    return h;
  }
  function toast(msg) {
    const h = ensureToastHost();
    const t = el(`<div class="toast">${msg}</div>`);
    h.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
  window.toast = toast;

  /* ── Sign-in modal (demo) ────────────────────────────────────── */
  function openSignIn() {
    const handles = ['rahel.k','mikael.t','sara.b','dawit.g','newcomer'];
    const modal = el(`
      <div class="modal-back">
        <div class="modal">
          <div class="eyebrow" style="margin-bottom:8px">Sign in · demo</div>
          <h3 class="display" style="font-size:32px;margin-bottom:8px">Pick a handle</h3>
          <p class="muted" style="font-size:14px;margin-bottom:20px">
            This is a prototype. Real auth comes from Supabase later — for now,
            picking a handle lets you post hot takes, RSVP, log challenge progress
            and submit themes.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${handles.map(h => `<button class="btn ghost pick" data-handle="${h}">@${h}</button>`).join('')}
          </div>
          <div class="hr"></div>
          <div class="row between">
            <span class="muted" style="font-size:12px">Or close and browse.</span>
            <button class="btn sm" data-close>Close</button>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
    modal.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => {
      auth.signInDemo(b.dataset.handle, 'member');
      modal.remove();
      toast(`Signed in as @${b.dataset.handle}`);
      setTimeout(() => location.reload(), 400);
    }));
    modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }
  window.openSignIn = openSignIn;

  /* boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderShell);
  } else {
    renderShell();
  }
})();
