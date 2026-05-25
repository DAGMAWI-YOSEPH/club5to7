/* home.js · populate hero from db, run countdown to next theme reveal */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const theme = await db.get('current_theme', {});
  const pick1 = await db.get('current_pick', {});
  const pick2 = await db.get('current_pick_2', {});
  const next  = await db.get('next_theme', {});

  // Theme banner
  const themeName  = theme.name || 'Films of Return';
  const accentWord = theme.accent_word || (themeName.split(' ').slice(-1)[0]);
  const before     = themeName.replace(new RegExp(`\\s*${accentWord}\\s*$`), '');
  const themeEl    = document.querySelector('#theme-name');
  if (themeEl) themeEl.innerHTML = `${before} <em>${accentWord}</em>`;
  setText('#theme-month',    theme.month || '');
  setText('#theme-blurb',    theme.blurb || '');
  setText('#next-theme-name', next.name || '—');

  // Film picks
  populatePick('1', pick1);
  populatePick('2', pick2);

  // Next theme teaser + countdown
  setText('#next-teaser', next.teaser || '');
  if (next.reveal_at) startCountdown(next.reveal_at);

  // Date stamp
  const d = new Date();
  setText('#today', d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

  function populatePick(n, pick) {
    setText(`#film-title-${n}`,    pick.title    || 'Untitled');
    setText(`#ptitle-${n}`,        (pick.title   || '').toUpperCase());
    setText(`#pdir-${n}`,          `DIR ${(pick.director || '').toUpperCase()} · ${pick.year || ''}`);
    setText(`#film-note-${n}`,     pick.note     || '');
    setText(`#film-director-${n}`, pick.director || '—');
    setText(`#film-year-${n}`,     pick.year     || '—');
    setText(`#film-country-${n}`,  pick.country  || '—');
    setText(`#film-runtime-${n}`,  pick.runtime  ? `${pick.runtime} min` : '—');
    setText(`#film-screening-${n}`, pick.screening_date || '—');
    setText(`#film-venue-${n}`,    pick.venue    || '—');
    // Poster image
    if (pick.poster_url) {
      const img = document.querySelector(`#poster-img-${n}`);
      const box = document.querySelector(`#poster-${n}`);
      if (img && box) { img.src = pick.poster_url; box.classList.add('has-image'); }
    }
  }

  function setText(sel, v) {
    document.querySelectorAll(sel).forEach(n => n.textContent = v);
  }

  function startCountdown(when) {
    const root = document.querySelector('#countdown');
    if (!root) return;
    function tick() {
      const ms  = when - Date.now();
      const s   = Math.max(0, Math.floor(ms / 1000));
      const d   = Math.floor(s / 86400);
      const h   = Math.floor((s % 86400) / 3600);
      const m   = Math.floor((s % 3600) / 60);
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
