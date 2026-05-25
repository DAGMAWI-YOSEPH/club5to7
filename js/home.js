/* home.js · populate hero from db, run countdown to next theme reveal */

(async function () {
  // Wait a tick for db/seed
  await new Promise(r => setTimeout(r, 50));

  const settings = await db.get('site_settings', {});
  const theme    = await db.get('current_theme', {});
  const pick     = await db.get('current_pick', {});
  const next     = await db.get('next_theme', {});

  // Theme banner
  setText('#theme-month', theme.month || '');
  setText('#theme-name-pre', '');
  const themeName = theme.name || 'Films of Return';
  const accentWord = theme.accent_word || (themeName.split(' ').slice(-1)[0]);
  const before = themeName.replace(new RegExp(`\\s*${accentWord}\\s*$`), '');
  const themeEl = document.querySelector('#theme-name');
  if (themeEl) themeEl.innerHTML = `${before} <em>${accentWord}</em>`;

  setText('#theme-blurb', theme.blurb || '');
  setText('#next-theme-name', next.name || '—');

  // Hero film card
  setText('#film-title', pick.title || 'Untitled');
  setText('.poster .ptitle', (pick.title || '').toUpperCase());
  setText('.poster .pdir', `DIR ${(pick.director || '').toUpperCase()} · ${pick.year || ''}`);
  setText('#film-note', pick.note || '');
  setText('#film-director', pick.director || '—');
  setText('#film-year', pick.year || '—');
  setText('#film-country', pick.country || '—');
  setText('#film-runtime', pick.runtime ? `${pick.runtime} min` : '—');
  setText('#film-screening', pick.screening_date || '—');
  setText('#film-venue', pick.venue || '—');

  // Next theme teaser
  setText('#next-name', next.name || '—');
  setText('#next-month', next.month || '');
  setText('#next-teaser', next.teaser || '');

  // Countdown
  if (next.reveal_at) startCountdown(next.reveal_at);

  // Update current date stamp
  const d = new Date();
  const dateLine = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  setText('#today', dateLine);

  function setText(sel, v) {
    document.querySelectorAll(sel).forEach(n => n.textContent = v);
  }

  function startCountdown(when) {
    const root = document.querySelector('#countdown');
    if (!root) return;
    function tick() {
      const ms = when - Date.now();
      const s = Math.max(0, Math.floor(ms / 1000));
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      root.querySelector('[data-d] .n').textContent = String(d).padStart(2,'0');
      root.querySelector('[data-h] .n').textContent = String(h).padStart(2,'0');
      root.querySelector('[data-m] .n').textContent = String(m).padStart(2,'0');
      root.querySelector('[data-s] .n').textContent = String(sec).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
  }
})();
