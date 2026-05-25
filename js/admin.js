/* admin.js · CMS router, login gate, section renderers */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const gate = document.querySelector('#admin-gate');
  const app = document.querySelector('#admin-app');
  const pane = document.querySelector('#admin-pane');
  const navWrap = document.querySelector('#admin-nav');

  const SECTIONS = [
    { id: 'dash',      label: 'Dashboard',       num: '00', group: 'OVERVIEW' },
    { id: 'now',       label: 'Now Showing',     num: '01', group: 'PUBLISH' },
    { id: 'digest',    label: 'Digest editor',   num: '02', group: 'PUBLISH' },
    { id: 'takes',     label: 'Hot Takes',       num: '03', group: 'MODERATE' },
    { id: 'requests',  label: 'Theme requests',  num: '04', group: 'MODERATE' },
    { id: 'events',    label: 'Events',          num: '05', group: 'MANAGE' },
    { id: 'pool',      label: 'Movie pool',      num: '06', group: 'MANAGE' },
    { id: 'challenges',label: 'Challenges',      num: '07', group: 'MANAGE' },
    { id: 'members',   label: 'Members',         num: '08', group: 'MANAGE' },
    { id: 'settings',  label: 'Site settings',   num: '09', group: 'CLUB' },
  ];

  // ── Gate · demo password (admin.html) ─────────────────
  function renderGate() {
    app.classList.add('hide');
    gate.classList.remove('hide');
    gate.innerHTML = `
      <div class="admin-gate">
        <span class="eyebrow">Curator only</span>
        <h2 style="margin-top:6px">The Studio</h2>
        <p class="muted" style="font-size:14px;margin-bottom:20px">
          Sign in to publish picks, moderate hot takes, manage events,
          and write the next digest.
        </p>
        <div class="field" style="margin-bottom:12px">
          <label>Admin password</label>
          <input id="pass" class="input" type="password" placeholder="••••••••">
        </div>
        <button class="btn primary" id="enter" style="width:100%;justify-content:center">Enter studio →</button>
        <p class="hint">
          Demo password is <code>cinema</code> (change it in Settings).
          For the real admin panel, use <a href="my-admin.html" style="text-decoration:underline;color:inherit">/my-admin</a>.
        </p>
      </div>
    `;
    document.querySelector('#enter').addEventListener('click', () => {
      const pw = document.querySelector('#pass').value;
      if (auth.signInAdmin(pw)) {
        toast('Welcome back, curator');
        boot();
      } else {
        toast('Wrong password');
      }
    });
    document.querySelector('#pass').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.querySelector('#enter').click();
    });
  }

  // ── Gate · Supabase Auth (my-admin.html) ───────────────
  function renderSupabaseGate(view = 'login', opts = {}) {
    app.classList.add('hide');
    gate.classList.remove('hide');

    if (view === 'login') {
      gate.innerHTML = `
        <div class="supabase-gate">
          <div class="gate-card">
            <div class="gate-top">
              <div class="mark">Club<em>5to7</em></div>
              <div class="tag">Curator access</div>
            </div>
            <div class="gate-body">
              <h2>The Studio</h2>
              <p class="sub">Sign in to manage picks, digest, events, and members.</p>
              <div class="col">
                ${opts.error ? `<div class="gate-error">${opts.error}</div>` : ''}
                <button class="btn primary gh-btn" id="sa-github" style="justify-content:center;gap:10px;width:100%">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
                  <span>Sign in with GitHub</span>
                </button>
                <div class="gate-divider"><span>or</span></div>
                <div id="sa-email-form" class="${opts.showEmail ? '' : 'hide'}">
                  <div class="col">
                    <div class="field">
                      <label>Email</label>
                      <input id="sa-email" class="input" type="email" placeholder="you@example.com" autocomplete="email" value="${opts.email||''}">
                    </div>
                    <div class="field">
                      <label>Password</label>
                      <input id="sa-pass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
                    </div>
                    <button class="btn" id="sa-enter" style="justify-content:center;gap:10px">
                      <span>Sign in with email</span><span>→</span>
                    </button>
                  </div>
                </div>
                <button class="gate-link" id="sa-toggle-email">${opts.showEmail ? '← Back' : 'Sign in with email instead'}</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.querySelector('#sa-github').addEventListener('click', async () => {
        const btn = document.querySelector('#sa-github');
        btn.innerHTML = '<span class="spinner"></span><span>Redirecting to GitHub…</span>';
        btn.disabled = true;
        const { error } = await supabaseAuth.signInWithGitHub();
        if (error) renderSupabaseGate('login', { error: error.message });
      });

      document.querySelector('#sa-toggle-email').addEventListener('click', () => {
        renderSupabaseGate('login', { showEmail: !opts.showEmail });
      });

      if (opts.showEmail) {
        const emailEl = document.querySelector('#sa-email');
        const passEl  = document.querySelector('#sa-pass');
        const btn     = document.querySelector('#sa-enter');

        async function trySignIn() {
          const email = emailEl.value.trim();
          const pw    = passEl.value;
          if (!email || !pw) { renderSupabaseGate('login', { error: 'Email and password are required.', email, showEmail: true }); return; }
          btn.innerHTML = '<span class="spinner"></span><span>Signing in…</span>';
          btn.disabled = true;
          const { error } = await supabaseAuth.signIn(email, pw);
          if (error) {
            renderSupabaseGate('login', { error: error.message, email, showEmail: true });
          } else {
            toast('Welcome back, curator');
            bootWithUser();
          }
        }

        btn.addEventListener('click', trySignIn);
        passEl.addEventListener('keydown', e => { if (e.key === 'Enter') trySignIn(); });
        document.querySelector('#sa-forgot')?.addEventListener('click', () => {
          renderSupabaseGate('reset', { email: emailEl.value.trim() });
        });
        setTimeout(() => emailEl.focus(), 60);
      }

    } else if (view === 'reset') {
      gate.innerHTML = `
        <div class="supabase-gate">
          <div class="gate-card">
            <div class="gate-top">
              <div class="mark">Club<em>5to7</em></div>
              <div class="tag">Password reset</div>
            </div>
            <div class="gate-body">
              <h2>Reset password</h2>
              <p class="sub">We'll email you a reset link. Check your inbox.</p>
              <div class="col">
                ${opts.error ? `<div class="gate-error">${opts.error}</div>` : ''}
                <div class="field">
                  <label>Your email</label>
                  <input id="sa-reset-email" class="input" type="email" value="${opts.email||''}" placeholder="you@example.com">
                </div>
                <button class="btn primary" id="sa-send-reset" style="justify-content:center">Send reset link →</button>
              </div>
            </div>
            <div class="gate-foot">
              <button class="gate-link" id="sa-back-login">← Back to sign in</button>
            </div>
          </div>
        </div>
      `;
      document.querySelector('#sa-send-reset').addEventListener('click', async () => {
        const email = document.querySelector('#sa-reset-email').value.trim();
        if (!email) return;
        const { error } = await supabaseAuth.resetPassword(email);
        if (error) { renderSupabaseGate('reset', { error: error.message, email }); }
        else { renderSupabaseGate('reset-sent', { email }); }
      });
      document.querySelector('#sa-back-login').addEventListener('click', () => renderSupabaseGate('login'));

    } else if (view === 'reset-sent') {
      gate.innerHTML = `
        <div class="supabase-gate">
          <div class="gate-card">
            <div class="gate-top">
              <div class="mark">Club<em>5to7</em></div>
            </div>
            <div class="gate-body">
              <div class="reset-sent">
                <div class="check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style="font-size:28px">Check your inbox</h2>
                <p class="sub" style="margin-top:8px">Reset link sent to <strong>${opts.email}</strong>.<br>Open it and choose a new password.</p>
              </div>
            </div>
            <div class="gate-foot">
              <button class="gate-link" id="sa-back-login">← Back to sign in</button>
            </div>
          </div>
        </div>
      `;
      document.querySelector('#sa-back-login').addEventListener('click', () => renderSupabaseGate('login'));
    }
  }

  // Boot once Supabase user is confirmed
  async function bootWithUser() {
    const user = await supabaseAuth.getUser();
    if (!user) { renderSupabaseGate('login'); return; }
    gate.classList.add('hide');
    app.classList.remove('hide');
    buildPanes();
    // Inject session bar at top of pane area
    const bar = document.createElement('div');
    bar.className = 'session-bar';
    bar.innerHTML = `
      <div class="avatar">${(user.email||'?')[0].toUpperCase()}</div>
      <div>
        <div class="email">${user.email}</div>
        <div class="role">Curator · Supabase Auth</div>
      </div>
      <button class="btn sm ghost signout-btn" id="sb-signout">Sign out</button>
    `;
    document.querySelector('#admin-app').prepend(bar);
    bar.querySelector('#sb-signout').addEventListener('click', async () => {
      await supabaseAuth.signOut();
      location.reload();
    });
    const initial = (location.hash || '#dash').slice(1);
    go(SECTIONS.find(s => s.id === initial) ? initial : 'dash');
  }

  // ── Sidebar ────────────────────────────────────────────
  function renderNav(active) {
    let html = '';
    let lastGroup = null;
    for (const s of SECTIONS) {
      if (s.group !== lastGroup) {
        html += `<h4>${s.group}</h4>`;
        lastGroup = s.group;
      }
      html += `<a data-section="${s.id}" class="${s.id===active?'on':''}">
        <span class="num">${s.num}</span><span>${s.label}</span>
      </a>`;
    }
    navWrap.innerHTML = html;
    navWrap.querySelectorAll('[data-section]').forEach(b =>
      b.addEventListener('click', () => go(b.dataset.section)));
  }

  function go(id) {
    pane.querySelectorAll('section').forEach(s => s.classList.toggle('on', s.dataset.id === id));
    renderNav(id);
    history.replaceState({}, '', `#${id}`);
    const fn = RENDERERS[id];
    if (fn) fn();
  }

  // ── Boot ──────────────────────────────────────────────
  function boot() {
    gate.classList.add('hide');
    app.classList.remove('hide');
    buildPanes();
    const initial = (location.hash || '#dash').slice(1);
    go(SECTIONS.find(s => s.id === initial) ? initial : 'dash');
  }

  function buildPanes() {
    pane.innerHTML = SECTIONS.map(s => `<section data-id="${s.id}"></section>`).join('');
  }

  if (window.USE_SUPABASE_AUTH) {
    // /my-admin — use real Supabase Auth
    supabaseAuth.getUser().then(user => {
      if (user) bootWithUser();
      else renderSupabaseGate('login');
    });
    // Re-check auth state on changes (e.g. after password reset redirect)
    supabaseAuth.onAuthChange((event, session) => {
      if (event === 'SIGNED_IN' && session) bootWithUser();
      if (event === 'SIGNED_OUT') renderSupabaseGate('login');
      if (event === 'PASSWORD_RECOVERY') renderSupabaseGate('login', { error: 'Set your new password after logging in.' });
    });
  } else {
    // /admin — legacy demo password gate
    if (auth.isAdmin()) boot();
    else renderGate();
  }

  // ╔══════════════════════════════════════════════════════╗
  // ║ Renderers per section                                ║
  // ╚══════════════════════════════════════════════════════╝

  const RENDERERS = {};
  const $sec = (id) => pane.querySelector(`section[data-id="${id}"]`);

  function headTpl(title, sub) {
    return `<div class="pane-head"><div><h2>${title}</h2><div class="sub">${sub||''}</div></div></div>`;
  }

  /* ── Dashboard ─────────────────────────────── */
  RENDERERS.dash = async () => {
    const takes = (await db.list('hot_takes')).filter(t => !t.approved).length;
    const reqs  = (await db.list('theme_requests')).filter(t => t.status === 'pending').length;
    const evs   = (await db.list('events')).length;
    const rsvps = (await db.list('rsvps')).length;
    const digest= (await db.list('digest_issues')).filter(d => d.status === 'draft').length;
    const settings = await db.get('site_settings', {});

    $sec('dash').innerHTML = `
      ${headTpl('Studio', `Welcome back, curator. ${takes} thing(s) need eyes.`)}
      <div class="form-grid">
        <a class="card" onclick="this.closest('.admin-pane').dispatchEvent(new CustomEvent('go',{detail:'takes'}))" style="cursor:pointer">
          <span class="eyebrow">Hot takes</span>
          <div class="display" style="font-size:48px;line-height:1;margin-top:4px">${takes}</div>
          <p class="muted" style="font-size:13px;margin-top:6px">awaiting moderation</p>
        </a>
        <a class="card" onclick="this.closest('.admin-pane').dispatchEvent(new CustomEvent('go',{detail:'requests'}))" style="cursor:pointer">
          <span class="eyebrow">Theme requests</span>
          <div class="display" style="font-size:48px;line-height:1;margin-top:4px">${reqs}</div>
          <p class="muted" style="font-size:13px;margin-top:6px">pending review</p>
        </a>
        <div class="card">
          <span class="eyebrow">RSVPs</span>
          <div class="display" style="font-size:48px;line-height:1;margin-top:4px">${rsvps}</div>
          <p class="muted" style="font-size:13px;margin-top:6px">across ${evs} event(s)</p>
        </div>
        <div class="card">
          <span class="eyebrow">Digest drafts</span>
          <div class="display" style="font-size:48px;line-height:1;margin-top:4px">${digest}</div>
          <p class="muted" style="font-size:13px;margin-top:6px">unpublished</p>
        </div>
      </div>

      <div class="tip" style="margin-top:24px">
        <strong>Heads up</strong>
        <span>Every change saves instantly to local storage. When this site is wired to Supabase, the same code will hit the database. <a href="../" style="text-decoration:underline;color:inherit">Preview the public site</a> in another tab to see your edits live.</span>
      </div>

      <div class="card" style="margin-top:16px;background:var(--bg-deep)">
        <div class="row between" style="margin-bottom:8px">
          <h3 class="display" style="font-size:24px">Quick links</h3>
        </div>
        <div class="row wrap">
          <a class="btn" href="index.html" target="_blank">View home ↗</a>
          <a class="btn" href="hot-takes.html" target="_blank">View hot takes ↗</a>
          <a class="btn" href="digest.html" target="_blank">View digest ↗</a>
          <button class="btn ghost" id="reset-data">Reset demo data</button>
          <button class="btn ghost" style="margin-left:auto" onclick="auth.signOut();location.reload()">Sign out</button>
        </div>
      </div>
    `;
    pane.addEventListener('go', e => go(e.detail), { once: true });
    document.querySelector('#reset-data').addEventListener('click', async () => {
      if (confirm('Reset all prototype data back to seed?')) {
        await seed.reset();
        toast('Reset done. Reloading…');
        setTimeout(() => location.reload(), 600);
      }
    });
  };

  /* ── Now Showing (two picks + theme + next) ─── */
  RENDERERS.now = async () => {
    const pick  = await db.get('current_pick', {});
    const pick2 = await db.get('current_pick_2', {});
    const theme = await db.get('current_theme', {});
    const next  = await db.get('next_theme', {});

    const pickFields = (prefix, p) => `
      <div class="field"><label>Title</label><input class="input" id="${prefix}-title" value="${escapeHtml(p.title||'')}"></div>
      <div class="field"><label>Director</label><input class="input" id="${prefix}-dir" value="${escapeHtml(p.director||'')}"></div>
      <div class="field"><label>Year</label><input class="input" id="${prefix}-year" value="${escapeHtml(p.year||'')}"></div>
      <div class="field"><label>Country</label><input class="input" id="${prefix}-country" value="${escapeHtml(p.country||'')}"></div>
      <div class="field"><label>Runtime (min)</label><input class="input" id="${prefix}-run" value="${escapeHtml(p.runtime||'')}"></div>
      <div class="field"><label>Screening date</label><input class="input" id="${prefix}-scr" value="${escapeHtml(p.screening_date||'')}"></div>
      <div class="field"><label>Venue</label><input class="input" id="${prefix}-venue" value="${escapeHtml(p.venue||'')}"></div>
      <div class="field col-2"><label>Poster image URL</label>
        <input class="input" id="${prefix}-poster" value="${escapeHtml(p.poster_url||'')}" placeholder="https://…  (paste any image URL — TMDB, Wikipedia, etc.)">
        <span class="help">Paste a URL to any 2:3 image. Shows on the home page immediately.</span></div>
      <div class="field col-2"><label>Curator's note</label>
        <textarea class="textarea" id="${prefix}-note">${escapeHtml(p.note||'')}</textarea>
        <span class="help">Three or four sentences. Why this film, why now.</span></div>
    `;

    $sec('now').innerHTML = `
      ${headTpl('Now showing', 'Two film picks, the monthly theme, and the sealed-envelope reveal. Edits go live the moment you save.')}

      <div class="tip"><strong>Plain English →</strong><span>What you type here appears on the home page instantly.</span></div>

      <h3 class="display" style="font-size:28px;margin-top:16px">This month's theme</h3>
      <div class="form-grid" style="margin-top:12px">
        <div class="field"><label>Theme name</label><input class="input" id="t-name" value="${escapeHtml(theme.name||'')}">
          <span class="help">e.g. "Films of Return"</span></div>
        <div class="field"><label>Month label</label><input class="input" id="t-month" value="${escapeHtml(theme.month||'')}">
          <span class="help">e.g. "May 2026"</span></div>
        <div class="field"><label>Italicised word</label><input class="input" id="t-word" value="${escapeHtml(theme.accent_word||'')}">
          <span class="help">Last word that gets the indigo italic treatment.</span></div>
        <div class="field col-2"><label>One-paragraph blurb</label>
          <textarea class="textarea" id="t-blurb">${escapeHtml(theme.blurb||'')}</textarea>
          <span class="help">Two to four sentences. Appears under the theme name on the home page.</span></div>
      </div>

      <div class="hr"></div>

      <h3 class="display" style="font-size:28px">Pick 01 of 02</h3>
      <div class="form-grid" style="margin-top:12px">${pickFields('p1', pick)}</div>

      <div class="preview-box">
        <div class="label">Preview · Pick 01</div>
        <div class="preview-pick">
          <div class="mini-poster" id="prev1-poster">${(pick.title||'?').slice(0,10).toUpperCase()}</div>
          <div>
            <div class="t" id="prev1-title">${escapeHtml(pick.title||'')}</div>
            <div class="sub" id="prev1-sub">DIR ${escapeHtml(pick.director||'')} · ${escapeHtml(pick.year||'')}</div>
          </div>
        </div>
      </div>

      <div class="hr"></div>

      <h3 class="display" style="font-size:28px">Pick 02 of 02</h3>
      <div class="form-grid" style="margin-top:12px">${pickFields('p2', pick2)}</div>

      <div class="preview-box">
        <div class="label">Preview · Pick 02</div>
        <div class="preview-pick">
          <div class="mini-poster" id="prev2-poster">${(pick2.title||'?').slice(0,10).toUpperCase()}</div>
          <div>
            <div class="t" id="prev2-title">${escapeHtml(pick2.title||'')}</div>
            <div class="sub" id="prev2-sub">DIR ${escapeHtml(pick2.director||'')} · ${escapeHtml(pick2.year||'')}</div>
          </div>
        </div>
      </div>

      <div class="hr"></div>

      <h3 class="display" style="font-size:28px">Next month (sealed envelope)</h3>
      <p class="muted" style="font-size:13px;margin-bottom:12px">The countdown on the home page ticks to <strong>reveal date</strong>.</p>
      <div class="form-grid">
        <div class="field"><label>Next theme name</label><input class="input" id="n-name" value="${escapeHtml(next.name||'')}"></div>
        <div class="field"><label>Next month label</label><input class="input" id="n-month" value="${escapeHtml(next.month||'')}"></div>
        <div class="field col-2"><label>Teaser (1 sentence)</label><input class="input" id="n-tease" value="${escapeHtml(next.teaser||'')}"></div>
        <div class="field"><label>Reveal date</label><input class="input" type="datetime-local" id="n-date" value="${dtLocalFrom(next.reveal_at)}"></div>
      </div>

      <div class="action-bar">
        <button class="btn ghost" id="now-cancel">Discard</button>
        <button class="btn primary" id="now-save">Save & publish →</button>
      </div>
    `;

    // Live previews
    const upd1 = () => {
      const t = document.querySelector('#p1-title').value;
      document.querySelector('#prev1-poster').textContent = (t||'?').slice(0,10).toUpperCase();
      document.querySelector('#prev1-title').textContent  = t;
      document.querySelector('#prev1-sub').textContent    = `DIR ${document.querySelector('#p1-dir').value} · ${document.querySelector('#p1-year').value}`;
    };
    const upd2 = () => {
      const t = document.querySelector('#p2-title').value;
      document.querySelector('#prev2-poster').textContent = (t||'?').slice(0,10).toUpperCase();
      document.querySelector('#prev2-title').textContent  = t;
      document.querySelector('#prev2-sub').textContent    = `DIR ${document.querySelector('#p2-dir').value} · ${document.querySelector('#p2-year').value}`;
    };
    ['#p1-title','#p1-dir','#p1-year'].forEach(s => document.querySelector(s).addEventListener('input', upd1));
    ['#p2-title','#p2-dir','#p2-year'].forEach(s => document.querySelector(s).addEventListener('input', upd2));

    document.querySelector('#now-save').addEventListener('click', async () => {
      const v = (s) => document.querySelector(s).value;
      await db.set('current_theme', { name: v('#t-name'), month: v('#t-month'), accent_word: v('#t-word'), blurb: v('#t-blurb') });
      await db.set('current_pick', {
        title: v('#p1-title'), director: v('#p1-dir'), year: v('#p1-year'),
        country: v('#p1-country'), runtime: v('#p1-run'),
        screening_date: v('#p1-scr'), venue: v('#p1-venue'),
        poster_url: v('#p1-poster'), note: v('#p1-note')
      });
      await db.set('current_pick_2', {
        title: v('#p2-title'), director: v('#p2-dir'), year: v('#p2-year'),
        country: v('#p2-country'), runtime: v('#p2-run'),
        screening_date: v('#p2-scr'), venue: v('#p2-venue'),
        poster_url: v('#p2-poster'), note: v('#p2-note')
      });
      const dt = v('#n-date');
      await db.set('next_theme', {
        name: v('#n-name'), month: v('#n-month'), teaser: v('#n-tease'),
        reveal_at: dt ? new Date(dt).getTime() : (next.reveal_at || (Date.now()+1000*60*60*24*7))
      });
      toast('Published. The home page is updated.');
    });
    document.querySelector('#now-cancel').addEventListener('click', () => RENDERERS.now());
  };

  /* ── Hot Takes moderation ───────────────────── */
  RENDERERS.takes = async () => {
    const all = await db.list('hot_takes', { sortBy: 'created_at', desc: true });
    $sec('takes').innerHTML = `
      ${headTpl('Hot takes', 'Approve, pin, edit, or delete. Pinned takes float to the top of the public page.')}
      <table class="tbl">
        <thead><tr>
          <th>Author</th><th>Title</th><th>Body</th><th>Status</th><th>Votes</th><th style="text-align:right">Actions</th>
        </tr></thead>
        <tbody>
          ${all.map(t => `
            <tr data-id="${t.id}">
              <td><strong>@${escapeHtml(t.author)}</strong><br><span class="mono muted" style="font-size:10px">${timeAgo(t.created_at)}</span></td>
              <td style="max-width:200px">${escapeHtml(t.title)}</td>
              <td style="max-width:280px;font-size:13px;color:var(--ink-mute)">${escapeHtml((t.body||'').slice(0,140))}${t.body && t.body.length>140?'…':''}</td>
              <td>
                <span class="status-pill ${t.approved?'ok':'warn'}">${t.approved?'Live':'Pending'}</span>
                ${t.pinned?'<span class="status-pill live" style="margin-left:4px">Pinned</span>':''}
              </td>
              <td class="mono">${t.votes||0}</td>
              <td>
                <div class="row-actions">
                  ${!t.approved?'<button class="ok" data-act="approve">Approve</button>':''}
                  <button data-act="pin">${t.pinned?'Unpin':'Pin'}</button>
                  <button class="delete" data-act="delete">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${all.length === 0 ? '<p class="muted" style="padding:32px;text-align:center">No takes yet.</p>' : ''}
    `;
    $sec('takes').querySelectorAll('tr[data-id]').forEach(tr => {
      tr.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', async () => {
        const id = tr.dataset.id; const act = b.dataset.act;
        const cur = (await db.list('hot_takes')).find(x => x.id === id);
        if (act === 'approve') { await db.update('hot_takes', id, { approved: true }); toast('Approved'); }
        if (act === 'pin')     { await db.update('hot_takes', id, { pinned: !cur.pinned }); toast(cur.pinned?'Unpinned':'Pinned'); }
        if (act === 'delete')  { if (confirm('Delete this take?')) { await db.remove('hot_takes', id); toast('Deleted'); } }
        RENDERERS.takes();
      }));
    });
  };

  /* ── Theme requests management ─────────────── */
  RENDERERS.requests = async () => {
    const all = await db.list('theme_requests', { sortBy: 'created_at', desc: true });
    $sec('requests').innerHTML = `
      ${headTpl('Theme requests', 'Queue what makes the next month, archive what doesn\'t.')}
      <table class="tbl">
        <thead><tr><th>Theme</th><th>Why</th><th>By</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${all.map(t => `
            <tr data-id="${t.id}">
              <td><strong>${escapeHtml(t.theme)}</strong></td>
              <td style="font-size:13px;color:var(--ink-mute);max-width:300px">${escapeHtml(t.why||'')}</td>
              <td class="mono">@${escapeHtml(t.by||'anon')}</td>
              <td><span class="status-pill ${t.status==='queued'?'ok':t.status==='archived'?'warn':''}">${escapeHtml(t.status||'pending')}</span></td>
              <td><div class="row-actions">
                <button class="ok" data-act="queue">Queue</button>
                <button data-act="archive">Archive</button>
                <button class="delete" data-act="delete">Delete</button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    $sec('requests').querySelectorAll('tr[data-id]').forEach(tr => {
      tr.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', async () => {
        const id = tr.dataset.id; const act = b.dataset.act;
        if (act === 'queue') await db.update('theme_requests', id, { status: 'queued' });
        if (act === 'archive') await db.update('theme_requests', id, { status: 'archived' });
        if (act === 'delete') { if (confirm('Delete?')) await db.remove('theme_requests', id); }
        toast('Saved');
        RENDERERS.requests();
      }));
    });
  };

  /* ── Movie pool ────────────────────────────── */
  RENDERERS.pool = async () => {
    const films = await db.list('film_pool', { sortBy: 'created_at' });
    $sec('pool').innerHTML = `
      ${headTpl('Movie pool', 'The films the wheel can land on. Add or retire any time.')}
      <table class="tbl">
        <thead><tr><th>Title</th><th>In rotation</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${films.map(f => `
            <tr data-id="${f.id}">
              <td>${escapeHtml(f.title)}</td>
              <td><span class="status-pill ${f.in_rotation?'ok':'warn'}">${f.in_rotation?'Live':'Retired'}</span></td>
              <td><div class="row-actions">
                <button data-act="toggle">${f.in_rotation?'Retire':'Restore'}</button>
                <button class="delete" data-act="delete">Delete</button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="add-row">
        <input class="input" id="new-film" placeholder="Title (Year) — e.g. Touki Bouki (1973)">
        <button class="btn primary" id="add-film">Add film</button>
      </div>
    `;
    $sec('pool').querySelector('#add-film').addEventListener('click', async () => {
      const v = $sec('pool').querySelector('#new-film').value.trim();
      if (!v) return;
      await db.insert('film_pool', { title: v, in_rotation: true });
      toast('Added');
      RENDERERS.pool();
    });
    $sec('pool').querySelectorAll('tr[data-id]').forEach(tr => {
      tr.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', async () => {
        const id = tr.dataset.id, act = b.dataset.act;
        const cur = (await db.list('film_pool')).find(x => x.id === id);
        if (act === 'toggle') await db.update('film_pool', id, { in_rotation: !cur.in_rotation });
        if (act === 'delete') { if (confirm('Delete?')) await db.remove('film_pool', id); }
        RENDERERS.pool();
      }));
    });
  };

  /* ── Events ────────────────────────────────── */
  RENDERERS.events = async () => {
    const events = await db.list('events', { sortBy: 'created_at', desc: true });
    const evt = events[0];
    if (!evt) { $sec('events').innerHTML = headTpl('Events', 'No events yet.'); return; }
    const rsvps = (await db.list('rsvps', { where: { event_id: evt.id } })).filter(r => r.status === 'going');

    $sec('events').innerHTML = `
      ${headTpl('Events', 'One event at a time. Set the cap, watch the seats fill, export the list.')}

      <div class="form-grid">
        <div class="field col-2"><label>Event title</label><input class="input" id="e-title" value="${escapeHtml(evt.title)}"></div>
        <div class="field"><label>Date label (shown to public)</label><input class="input" id="e-date" value="${escapeHtml(evt.date_label)}"></div>
        <div class="field"><label>Venue</label><input class="input" id="e-venue" value="${escapeHtml(evt.venue)}"></div>
        <div class="field"><label>Capacity</label><input class="input" type="number" id="e-cap" value="${evt.capacity}">
          <span class="help">How many seats. The bar on the public page divides into this number.</span></div>
        <div class="field">
          <label>Charge for this event?</label>
          <select class="select" id="e-pay">
            <option value="false" ${!evt.require_payment?'selected':''}>No — free</option>
            <option value="true"  ${evt.require_payment?'selected':''}>Yes — Chapa checkout (wired but disabled in code)</option>
          </select>
          <span class="help">Chapa integration is stubbed. Flip the feature flag in Site Settings to actually charge.</span>
        </div>
        <div class="field"><label>Price (birr)</label><input class="input" type="number" id="e-price" value="${evt.price_birr||0}"></div>
        <div class="field col-2"><label>Description</label>
          <textarea class="textarea" id="e-desc">${escapeHtml(evt.description||'')}</textarea>
          <span class="help">Two or three sentences. What people will see if they're trying to decide.</span></div>
      </div>

      <div class="action-bar">
        <button class="btn ghost" id="export-csv">Export attendees CSV</button>
        <button class="btn primary" id="e-save">Save event →</button>
      </div>

      <div class="hr"></div>

      <h3 class="display" style="font-size:28px">Attendees · ${rsvps.length} / ${evt.capacity}</h3>
      <table class="tbl" style="margin-top:12px">
        <thead><tr><th>Handle</th><th>Status</th><th>RSVP'd</th><th style="text-align:right">Action</th></tr></thead>
        <tbody>
          ${rsvps.map(r => `
            <tr data-id="${r.id}">
              <td>@${escapeHtml(r.handle)}</td>
              <td><span class="status-pill ok">Going</span></td>
              <td class="mono">${timeAgo(r.created_at)}</td>
              <td><div class="row-actions"><button class="delete" data-act="remove">Remove</button></div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    $sec('events').querySelector('#e-save').addEventListener('click', async () => {
      const v = (s) => document.querySelector(s).value;
      await db.update('events', evt.id, {
        title: v('#e-title'), date_label: v('#e-date'), venue: v('#e-venue'),
        capacity: parseInt(v('#e-cap'),10) || 0,
        require_payment: v('#e-pay') === 'true',
        price_birr: parseInt(v('#e-price'),10) || 0,
        description: v('#e-desc')
      });
      toast('Event saved');
    });
    $sec('events').querySelector('#export-csv').addEventListener('click', () => {
      const csv = 'handle,status,rsvp_at\n' + rsvps.map(r => `@${r.handle},going,${new Date(r.created_at).toISOString()}`).join('\n');
      downloadFile('attendees.csv', csv, 'text/csv');
    });
    $sec('events').querySelectorAll('tr[data-id] [data-act="remove"]').forEach(b => b.addEventListener('click', async () => {
      const tr = b.closest('tr');
      if (confirm('Remove this RSVP?')) { await db.remove('rsvps', tr.dataset.id); RENDERERS.events(); }
    }));
  };

  /* ── Challenges ────────────────────────────── */
  RENDERERS.challenges = async () => {
    const cs = await db.list('challenges', { sortBy: 'created_at' });
    $sec('challenges').innerHTML = `
      ${headTpl('Challenges', 'Create themed marathons. Members tick off films and earn points (160 on completion, 10 per film, 30 bonus).')}
      <div style="display:flex;flex-direction:column;gap:16px">
        ${cs.map(c => `
          <div class="card" data-id="${c.id}">
            <div class="form-grid">
              <div class="field"><label>Title</label><input class="input" data-f="title" value="${escapeHtml(c.title)}"></div>
              <div class="field"><label>Target (films to watch)</label><input class="input" type="number" data-f="target" value="${c.target}"></div>
              <div class="field"><label>Bonus film name</label><input class="input" data-f="bonus_film" value="${escapeHtml(c.bonus_film||'')}"></div>
              <div class="field"><label>Closing label</label><input class="input" data-f="ends_label" value="${escapeHtml(c.ends_label||'')}"></div>
              <div class="field col-2"><label>Description</label><textarea class="textarea" data-f="description">${escapeHtml(c.description)}</textarea></div>
            </div>
            <div class="row" style="margin-top:12px;gap:8px">
              <span class="status-pill ${c.active?'ok':'warn'}">${c.active?'Active':'Closed'}</span>
              <button class="btn sm" data-act="toggle">${c.active?'Close':'Reopen'}</button>
              <button class="btn sm primary" data-act="save" style="margin-left:auto">Save</button>
              <button class="btn sm" data-act="delete">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="add-row" style="flex-direction:column;align-items:stretch">
        <input class="input" id="new-c-title" placeholder="New challenge title">
        <button class="btn primary" id="add-c">Create new challenge →</button>
      </div>
    `;
    $sec('challenges').querySelector('#add-c').addEventListener('click', async () => {
      const t = $sec('challenges').querySelector('#new-c-title').value.trim();
      if (!t) return;
      await db.insert('challenges', { title: t, description: '', target: 5, base_points: 160, per_film: 10, bonus: 30, bonus_film: '', active: true, ends_label: '' });
      toast('Created');
      RENDERERS.challenges();
    });
    $sec('challenges').querySelectorAll('[data-id]').forEach(card => {
      const id = card.dataset.id;
      card.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
        const cur = (await db.list('challenges')).find(x => x.id === id);
        if (b.dataset.act === 'save') {
          const patch = {};
          card.querySelectorAll('[data-f]').forEach(i => patch[i.dataset.f] = i.type === 'number' ? parseInt(i.value,10) : i.value);
          await db.update('challenges', id, patch);
          toast('Saved');
        }
        if (b.dataset.act === 'toggle') await db.update('challenges', id, { active: !cur.active });
        if (b.dataset.act === 'delete' && confirm('Delete challenge and all its logs?')) {
          (await db.list('challenge_log', { where: { challenge_id: id } })).forEach(l => db.remove('challenge_log', l.id));
          await db.remove('challenges', id);
          toast('Deleted');
        }
        RENDERERS.challenges();
      }));
    });
  };

  /* ── Members ────────────────────────────────── */
  RENDERERS.members = async () => {
    const mems = await db.list('members', { sortBy: 'created_at' });
    $sec('members').innerHTML = `
      ${headTpl('Members', 'Approve newcomers, demote troublemakers, ban repeaters.')}
      <table class="tbl">
        <thead><tr><th>Handle</th><th>Name</th><th>Joined</th><th>Role</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>
          ${mems.map(m => `
            <tr data-id="${m.id}">
              <td><strong>@${escapeHtml(m.handle)}</strong></td>
              <td>${escapeHtml(m.name||'—')}</td>
              <td class="mono">${escapeHtml(m.joined||'—')}</td>
              <td><span class="status-pill ${m.role==='curator'?'live':''}">${escapeHtml(m.role||'member')}</span></td>
              <td><span class="status-pill ${m.status==='active'?'ok':m.status==='banned'?'warn':''}">${escapeHtml(m.status||'pending')}</span></td>
              <td><div class="row-actions">
                ${m.status==='pending' ? '<button class="ok" data-act="approve">Approve</button>' : ''}
                ${m.status!=='banned' ? '<button data-act="ban">Ban</button>' : '<button class="ok" data-act="unban">Unban</button>'}
                <button class="delete" data-act="delete">Delete</button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    $sec('members').querySelectorAll('tr[data-id]').forEach(tr => {
      tr.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
        const act = b.dataset.act, id = tr.dataset.id;
        if (act === 'approve') await db.update('members', id, { status: 'active' });
        if (act === 'ban')     await db.update('members', id, { status: 'banned' });
        if (act === 'unban')   await db.update('members', id, { status: 'active' });
        if (act === 'delete' && confirm('Delete member?')) await db.remove('members', id);
        toast('Saved');
        RENDERERS.members();
      }));
    });
  };

  /* ── Site Settings ──────────────────────────── */
  RENDERERS.settings = async () => {
    const s = await db.get('site_settings', {});
    $sec('settings').innerHTML = `
      ${headTpl('Site settings', 'Club name, contact links, accent color, admin password, feature flags.')}

      <h3 class="display" style="font-size:24px;margin-top:8px">Club identity</h3>
      <div class="form-grid" style="margin-top:12px">
        <div class="field"><label>Club name</label><input class="input" id="s-name" value="${escapeHtml(s.club_name||'')}">
          <span class="help">Appears in the sidebar logo and the browser title.</span></div>
        <div class="field"><label>Tagline</label><input class="input" id="s-tag" value="${escapeHtml(s.tagline||'')}"></div>
        <div class="field"><label>Accent color</label>
          <input class="input" type="color" id="s-accent" value="${escapeHtml(s.accent||'#2E46C7')}" style="height:42px;padding:4px">
          <span class="help">A single hex. Used for italics, buttons, the wheel, the indigo line.</span></div>
        <div class="field"><label>Admin password</label><input class="input" id="s-pw" value="${escapeHtml(s.admin_password||'')}">
          <span class="help">Changes the gate for /admin. In production: real Supabase auth.</span></div>
      </div>

      <h3 class="display" style="font-size:24px;margin-top:24px">Contact</h3>
      <div class="form-grid" style="margin-top:12px">
        <div class="field"><label>Instagram handle</label><input class="input" id="s-ig" value="${escapeHtml(s.socials?.instagram||'')}"></div>
        <div class="field"><label>Telegram link</label><input class="input" id="s-tg" value="${escapeHtml(s.socials?.telegram||'')}"></div>
        <div class="field"><label>Email</label><input class="input" id="s-em" value="${escapeHtml(s.socials?.email||'')}"></div>
        <div class="field"><label>Intro video URL (YouTube / Vimeo)</label><input class="input" id="s-video" value="${escapeHtml(s.about_video_url||'')}"></div>
      </div>

      <h3 class="display" style="font-size:24px;margin-top:24px">About copy</h3>
      <div class="field" style="margin-top:12px">
        <label>About page body</label>
        <textarea class="textarea" id="s-about" style="min-height:200px">${escapeHtml(s.about_body||'')}</textarea>
        <span class="help">Plain text. Wrap *like this* for italics. New paragraphs by leaving a blank line.</span>
      </div>

      <h3 class="display" style="font-size:24px;margin-top:24px">Feature flags</h3>
      <div class="field-row">
        <label>Chapa payments</label>
        <span class="help" style="flex:1">Master switch. Even if individual events are set to "charge", they stay free until this is on.</span>
        <label class="bonus-toggle" style="min-width:120px">
          <input type="checkbox" id="s-chapa" ${s.chapa_enabled?'checked':''}>
          <span>${s.chapa_enabled?'On':'Off'}</span>
        </label>
      </div>
      <div class="field-row">
        <label>Live chatroom</label>
        <span class="help" style="flex:1">Wired but not yet built. When backend is live, this turns the chat page on.</span>
        <label class="bonus-toggle" style="min-width:120px">
          <input type="checkbox" id="s-chat" ${s.chat_enabled?'checked':''}>
          <span>${s.chat_enabled?'On':'Off'}</span>
        </label>
      </div>

      <div class="action-bar">
        <button class="btn ghost" id="s-cancel">Cancel</button>
        <button class="btn primary" id="s-save">Save settings →</button>
      </div>
    `;
    document.querySelector('#s-save').addEventListener('click', async () => {
      const v = (sel) => document.querySelector(sel).value;
      const c = (sel) => document.querySelector(sel).checked;
      await db.set('site_settings', {
        club_name: v('#s-name'),
        tagline: v('#s-tag'),
        accent: v('#s-accent'),
        admin_password: v('#s-pw'),
        socials: { instagram: v('#s-ig'), telegram: v('#s-tg'), email: v('#s-em') },
        about_video_url: v('#s-video'),
        about_body: v('#s-about'),
        chapa_enabled: c('#s-chapa'),
        chat_enabled: c('#s-chat')
      });
      toast('Settings saved');
    });
    document.querySelector('#s-cancel').addEventListener('click', () => RENDERERS.settings());
  };

  /* ── Digest editor — handled in admin-digest.js ── */
  RENDERERS.digest = () => {
    if (window.renderDigestEditor) window.renderDigestEditor($sec('digest'), headTpl);
  };

  // helpers
  function dtLocalFrom(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
})();
