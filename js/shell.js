/* shell.js · injects sidebar + toast + auth modal on every page */

(function () {
  const SUPABASE_URL = 'https://pyrsqzlvnhhzokzxxolr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnNxemx2bmhoem9renh4b2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk2MzEsImV4cCI6MjA5NTI4NTYzMX0.9jtQ6iLWtQlfJf2_fu5ha609044tK7w1dL4NpLTOuUU';

  /* Supabase client for member auth (lazy-init once) */
  let _authClient = null;
  function getAuthClient() {
    if (_authClient) return _authClient;
    if (!window.supabase) return null;
    _authClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, storageKey: 'club5to7:member:v1' }
    });
    const c = _authClient;
    /* Sync Supabase session into auth.js on state changes */
    c.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        auth.signOut();
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const u = session.user;
        const handle = (u.user_metadata && u.user_metadata.handle) || u.email.split('@')[0];
        auth.signInDemo(handle, 'member');
      }
    });
    /* Sync any existing session on page load */
    c.auth.getUser().then(function (res) {
      const user = res.data && res.data.user;
      if (user && !auth.current()) {
        const handle = (user.user_metadata && user.user_metadata.handle) || user.email.split('@')[0];
        auth.signInDemo(handle, 'member');
      }
    });
    return _authClient;
  }

  const NAV = [
    { page: 'home',          href: 'index.html',           label: 'Now Showing',    num: '01' },
    { page: 'hot-takes',     href: 'hot-takes.html',       label: 'Hot Takes',      num: '02' },
    { page: 'theme-request', href: 'theme-request.html',   label: 'Theme Requests', num: '03' },
    { page: 'digest',        href: 'digest.html',          label: 'The Digest',     num: '04' },
    { page: 'picker',        href: 'picker.html',          label: 'Movie Picker',   num: '05' },
    { page: 'rsvp',          href: 'rsvp.html',            label: 'Gatherings',     num: '06' },
    { page: 'challenges',    href: 'challenges.html',       label: 'Challenges',     num: '07' },
    { page: 'ping-pong',     href: 'ping-pong.html',       label: 'Ping Pong',      num: '08' },
    { page: 'about',         href: 'about.html',           label: 'About',          num: '09' },
  ];

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  async function renderShell() {
    const page    = document.body.dataset.page || 'home';
    const session = window.auth ? auth.current() : null;

    const navHtml = NAV.map(n => `
      <a href="${n.href}" class="${n.page === page ? 'active' : ''}">
        <span class="num">${n.num}</span>
        <span>${n.label}</span>
      </a>
    `).join('');

    const sessionBlock = session
      ? `<div class="session">
            <span class="avatar">${(session.handle || '?')[0].toUpperCase()}</span>
            <div style="flex:1;min-width:0">
              <div class="who" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${session.handle}</div>
              <div class="role">${session.role}</div>
            </div>
            <button class="icon-btn" data-act="signout" title="Sign out"
              style="margin-left:auto;width:28px;height:28px;border-color:var(--rule-soft);color:var(--ink-mute);flex-shrink:0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
         </div>`
      : `<button class="btn sm" data-act="signin"
           style="border-color:var(--rule-soft);color:var(--ink);align-self:flex-start;width:100%">
           Sign in / Join →
         </button>`;

    const sidebar = el(`
      <aside class="sidebar">
        <a class="brand" href="index.html">
          <div class="mark">Club<em>5to7</em></div>
          <div class="tag">ADDIS · EST. 2023</div>
        </a>

        <nav class="nav" aria-label="Primary">
          <div class="group-label">Reel A</div>
          ${navHtml}
        </nav>

        <div class="sidebar-foot">
          ${sessionBlock}
          <div class="reel-info">
            <span>REEL · 35MM</span>
            <span>v0.1</span>
          </div>
        </div>
      </aside>
    `);

    document.body.prepend(sidebar);
    document.body.classList.add('app');

    /* Initialise auth client — defer if Supabase CDN isn't loaded yet */
    function tryInitAuth() {
      if (window.supabase) { getAuthClient(); }
      else { setTimeout(tryInitAuth, 100); }
    }
    tryInitAuth();

    /* Sign in / out */
    sidebar.querySelectorAll('[data-act="signin"]').forEach(b =>
      b.addEventListener('click', openSignIn));
    sidebar.querySelectorAll('[data-act="signout"]').forEach(b =>
      b.addEventListener('click', async () => {
        const c = getAuthClient();
        if (c) await c.auth.signOut();
        auth.signOut();
        toast('Signed out');
        setTimeout(() => location.reload(), 400);
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

  /* ── Auth modal ─────────────────────────────────────────────── */
  function openSignIn() {
    const existing = document.querySelector('.auth-modal-back');
    if (existing) return;

    const modal = el(`
      <div class="modal-back auth-modal-back">
        <div class="modal" style="max-width:400px">
          <div class="auth-tabs" style="display:flex;gap:0;margin-bottom:var(--s-5);border-bottom:1px solid var(--rule-soft)">
            <button class="auth-tab active" data-tab="signin"
              style="flex:1;padding:8px 0;font-family:var(--f-mono);font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink);border-bottom:2px solid var(--accent);margin-bottom:-1px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">
              Sign In
            </button>
            <button class="auth-tab" data-tab="signup"
              style="flex:1;padding:8px 0;font-family:var(--f-mono);font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute);background:none;border:none;cursor:pointer">
              Join
            </button>
          </div>

          <div data-panel="signin">
            <h3 class="display" style="font-size:28px;margin-bottom:4px">Welcome back</h3>
            <p style="font-size:13px;color:var(--ink-mute);margin-bottom:var(--s-5)">Sign in to track films, post takes, log challenges.</p>
            <div class="field" style="margin-bottom:var(--s-3)">
              <label style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">Email</label>
              <input name="email" type="email" class="input" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="field" style="margin-bottom:var(--s-5)">
              <label style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">Password</label>
              <input name="password" type="password" class="input" placeholder="••••••••" autocomplete="current-password">
            </div>
            <p class="auth-error" style="color:var(--accent);font-size:13px;margin-bottom:var(--s-3);display:none"></p>
            <button class="btn primary auth-submit" style="width:100%;justify-content:center" data-mode="signin">Sign in →</button>
          </div>

          <div data-panel="signup" style="display:none">
            <h3 class="display" style="font-size:28px;margin-bottom:4px">Join the club</h3>
            <p style="font-size:13px;color:var(--ink-mute);margin-bottom:var(--s-5)">Create an account to RSVP, post hot takes, and log your challenges.</p>
            <div class="field" style="margin-bottom:var(--s-3)">
              <label style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">Email</label>
              <input name="email" type="email" class="input" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="field" style="margin-bottom:var(--s-3)">
              <label style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">Password</label>
              <input name="password" type="password" class="input" placeholder="min. 8 characters" autocomplete="new-password">
            </div>
            <div class="field" style="margin-bottom:var(--s-5)">
              <label style="font-family:var(--f-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute)">Display name</label>
              <input name="handle" type="text" class="input" placeholder="how the club knows you" autocomplete="nickname">
            </div>
            <p class="auth-error" style="color:var(--accent);font-size:13px;margin-bottom:var(--s-3);display:none"></p>
            <button class="btn primary auth-submit" style="width:100%;justify-content:center" data-mode="signup">Create account →</button>
          </div>

          <button class="auth-close" style="position:absolute;top:var(--s-4);right:var(--s-4);background:none;border:none;cursor:pointer;color:var(--ink-mute);font-size:20px;line-height:1;padding:4px">×</button>
        </div>
      </div>
    `);

    modal.style.position = 'fixed';
    document.body.appendChild(modal);

    const panels  = { signin: modal.querySelector('[data-panel="signin"]'), signup: modal.querySelector('[data-panel="signup"]') };
    const tabs    = modal.querySelectorAll('.auth-tab');
    const errors  = modal.querySelectorAll('.auth-error');

    function switchTab(tab) {
      tabs.forEach(t => {
        const active = t.dataset.tab === tab;
        t.classList.toggle('active', active);
        t.style.color = active ? 'var(--ink)' : 'var(--ink-mute)';
        t.style.borderBottom = active ? '2px solid var(--accent)' : '2px solid transparent';
      });
      Object.entries(panels).forEach(([k, p]) => { p.style.display = k === tab ? 'block' : 'none'; });
    }

    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

    /* Auth submit handler */
    modal.querySelectorAll('.auth-submit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mode   = btn.dataset.mode;
        const panel  = panels[mode];
        const email  = panel.querySelector('[name="email"]').value.trim();
        const pass   = panel.querySelector('[name="password"]').value;
        const err    = panel.querySelector('.auth-error');
        const handle = mode === 'signup' ? (panel.querySelector('[name="handle"]').value.trim() || email.split('@')[0]) : null;

        if (!email || !pass) { err.textContent = 'Email and password are required.'; err.style.display = 'block'; return; }

        const c = getAuthClient();
        if (!c) { err.textContent = 'Auth not initialised — refresh and try again.'; err.style.display = 'block'; return; }

        btn.disabled = true;
        btn.textContent = mode === 'signup' ? 'Creating…' : 'Signing in…';
        err.style.display = 'none';

        try {
          if (mode === 'signup') {
            const { data, error } = await c.auth.signUp({
              email, password: pass,
              options: { data: { handle: handle || email.split('@')[0] } }
            });
            if (error) throw error;
            if (data.user && !data.session) {
              /* Email confirmation required */
              panel.innerHTML = `
                <div style="text-align:center;padding:var(--s-5) 0">
                  <div style="font-family:var(--f-display);font-size:32px;margin-bottom:8px">Check your email</div>
                  <p style="color:var(--ink-mute);font-size:14px;line-height:1.55">We sent a confirmation link to <strong style="color:var(--ink)">${email}</strong>. Click it to activate your account, then come back to sign in.</p>
                </div>`;
              return;
            }
            if (data.user) {
              auth.signInDemo(handle || email.split('@')[0], 'member');
              modal.remove();
              toast(`Welcome to the club, ${handle || email.split('@')[0]}`);
              setTimeout(() => location.reload(), 400);
            }
          } else {
            const { data, error } = await c.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            const u = data.user;
            const uHandle = (u.user_metadata?.handle) || email.split('@')[0];
            auth.signInDemo(uHandle, 'member');
            modal.remove();
            toast(`Signed in as ${uHandle}`);
            setTimeout(() => location.reload(), 400);
          }
        } catch (e) {
          err.textContent = e.message || 'Something went wrong. Try again.';
          err.style.display = 'block';
          btn.disabled = false;
          btn.textContent = mode === 'signup' ? 'Create account →' : 'Sign in →';
        }
      });
    });

    /* Enter key submits */
    modal.querySelectorAll('.input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const panel = input.closest('[data-panel]');
          if (panel) panel.querySelector('.auth-submit')?.click();
        }
      });
    });

    /* Close */
    const closeModal = () => modal.remove();
    modal.querySelector('.auth-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  window.openSignIn = openSignIn;

  /* boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderShell);
  } else {
    renderShell();
  }
})();
