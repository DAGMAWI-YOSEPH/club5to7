/* picker.js · spin wheel from world cinema catalogue + TMDB search */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const wheelEl  = document.querySelector('#wheel');
  const spinBtn  = document.querySelector('#spin');
  const resultEl = document.querySelector('#result');
  const poolEl   = document.querySelector('#pool');
  const historyEl= document.querySelector('#history');
  const countEl  = document.querySelector('#pool-count');
  const searchEl = document.querySelector('#film-search');
  const searchResultsEl = document.querySelector('#search-results');

  /* ── Built-in catalogue: African + world cinema ─────────────── */
  const CATALOGUE = [
    /* African Cinema */
    { title: 'Teza', year: 1985, director: 'Haile Gerima', country: 'Ethiopia' },
    { title: 'Yeelen', year: 1987, director: 'Souleymane Cissé', country: 'Mali' },
    { title: 'Touki Bouki', year: 1973, director: 'Djibril Diop Mambéty', country: 'Senegal' },
    { title: 'Black Girl', year: 1966, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'Mooladé', year: 2004, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'Faat Kiné', year: 2000, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'Mandabi', year: 1968, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'Hyenas', year: 1992, director: 'Djibril Diop Mambéty', country: 'Senegal' },
    { title: 'Soleil Ô', year: 1970, director: 'Med Hondo', country: 'Mauritania' },
    { title: 'Sambizanga', year: 1972, director: 'Sarah Maldoror', country: 'Angola' },
    { title: 'Daughters of the Dust', year: 1991, director: 'Julie Dash', country: 'USA' },
    { title: 'Difret', year: 2014, director: 'Zeresenay Berhane Mehari', country: 'Ethiopia' },
    { title: 'Lamb', year: 2015, director: 'Yared Zeleke', country: 'Ethiopia' },
    { title: 'Adwa: An African Victory', year: 1999, director: 'Haile Gerima', country: 'Ethiopia' },
    { title: 'Harvest: 3000 Years', year: 1976, director: 'Haile Gerima', country: 'Ethiopia' },
    { title: 'Xala', year: 1975, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'Ceddo', year: 1977, director: 'Ousmane Sembène', country: 'Senegal' },
    { title: 'The Battle of Algiers', year: 1966, director: 'Gillo Pontecorvo', country: 'Algeria' },
    { title: 'Finzan', year: 1989, director: 'Cheick Oumar Sissoko', country: 'Mali' },
    { title: 'Quartier Mozart', year: 1992, director: 'Jean-Pierre Bekolo', country: 'Cameroon' },
    { title: 'Yaaba', year: 1989, director: 'Idrissa Ouedraogo', country: 'Burkina Faso' },
    { title: 'Tilai', year: 1990, director: 'Idrissa Ouedraogo', country: 'Burkina Faso' },
    { title: 'Le Franc', year: 1994, director: 'Djibril Diop Mambéty', country: 'Senegal' },
    { title: 'Félicité', year: 2017, director: 'Alain Gomis', country: 'DR Congo' },
    /* World Cinema */
    { title: 'Memories of Murder', year: 2003, director: 'Bong Joon-ho', country: 'South Korea' },
    { title: 'In the Mood for Love', year: 2000, director: 'Wong Kar-wai', country: 'Hong Kong' },
    { title: 'Bicycle Thieves', year: 1948, director: 'Vittorio De Sica', country: 'Italy' },
    { title: 'Pan\'s Labyrinth', year: 2006, director: 'Guillermo del Toro', country: 'Spain' },
    { title: 'Y Tu Mamá También', year: 2001, director: 'Alfonso Cuarón', country: 'Mexico' },
    { title: 'Parasite', year: 2019, director: 'Bong Joon-ho', country: 'South Korea' },
    { title: 'Certified Copy', year: 2010, director: 'Abbas Kiarostami', country: 'Iran' },
    { title: 'A Separation', year: 2011, director: 'Asghar Farhadi', country: 'Iran' },
    { title: 'Stalker', year: 1979, director: 'Andrei Tarkovsky', country: 'Soviet Union' },
    { title: 'The Mirror', year: 1975, director: 'Andrei Tarkovsky', country: 'Soviet Union' },
    { title: 'Come and See', year: 1985, director: 'Elem Klimov', country: 'Soviet Union' },
    { title: 'Wild Strawberries', year: 1957, director: 'Ingmar Bergman', country: 'Sweden' },
    { title: 'The Seventh Seal', year: 1957, director: 'Ingmar Bergman', country: 'Sweden' },
    { title: 'City of God', year: 2002, director: 'Fernando Meirelles', country: 'Brazil' },
    { title: 'The Lives of Others', year: 2006, director: 'Florian Henckel von Donnersmarck', country: 'Germany' },
    { title: 'Amores Perros', year: 2000, director: 'Alejandro González Iñárritu', country: 'Mexico' },
    { title: 'Roma', year: 2018, director: 'Alfonso Cuarón', country: 'Mexico' },
    { title: 'Burning', year: 2018, director: 'Lee Chang-dong', country: 'South Korea' },
    { title: 'Portrait of a Lady on Fire', year: 2019, director: 'Céline Sciamma', country: 'France' },
    { title: 'The Square', year: 2017, director: 'Ruben Östlund', country: 'Sweden' },
    { title: 'Force Majeure', year: 2014, director: 'Ruben Östlund', country: 'Sweden' },
    { title: 'The White Ribbon', year: 2009, director: 'Michael Haneke', country: 'Austria' },
    { title: 'Caché', year: 2005, director: 'Michael Haneke', country: 'France' },
    { title: 'Three Colors: Blue', year: 1993, director: 'Krzysztof Kieślowski', country: 'France' },
    { title: 'Mulholland Drive', year: 2001, director: 'David Lynch', country: 'USA' },
    { title: 'Oldboy', year: 2003, director: 'Park Chan-wook', country: 'South Korea' },
    { title: 'Raise the Red Lantern', year: 1991, director: 'Zhang Yimou', country: 'China' },
    { title: 'Chungking Express', year: 1994, director: 'Wong Kar-wai', country: 'Hong Kong' },
    { title: 'Spirited Away', year: 2001, director: 'Hayao Miyazaki', country: 'Japan' },
    { title: 'Nobody Knows', year: 2004, director: 'Hirokazu Kore-eda', country: 'Japan' },
  ];

  /* Load any admin-curated additions from Supabase film_pool */
  let customFilms = [];
  try {
    const pool = await db.list('film_pool');
    customFilms = pool.filter(f => f.in_rotation).map(f => ({
      title: f.title.replace(/\s*\(\d{4}\)\s*$/, ''),
      year:  (f.title.match(/\((\d{4})\)$/) || [])[1] || '',
      director: f.director || '',
      country:  f.country  || ''
    }));
  } catch (_) { /* table may not exist */ }

  /* Merge: custom films first, then catalogue (no title duplicates) */
  const customTitles = new Set(customFilms.map(f => f.title.toLowerCase()));
  const allFilms = [
    ...customFilms,
    ...CATALOGUE.filter(f => !customTitles.has(f.title.toLowerCase()))
  ];

  if (countEl) countEl.textContent = allFilms.length;

  let activeFilms = [...allFilms];
  let rotation    = 0;
  const history   = [];

  /* ── Wheel rendering ─────────────────────────────────────────── */
  const WHEEL_COLORS = [
    '#2A0C0A', '#1A0808', '#3A1008', '#200A06',
    '#2E0E0A', '#160604', '#320C08', '#1E0906'
  ];

  function buildWheel(films) {
    const n = films.length;
    if (!n) {
      wheelEl.innerHTML = '<text x="200" y="200" text-anchor="middle" fill="var(--ink-mute)" font-family="JetBrains Mono, monospace" font-size="13">Add films to the pool</text>';
      return;
    }
    const cx = 200, cy = 200, r = 196;
    let svg = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const fill = WHEEL_COLORS[i % WHEEL_COLORS.length];
      /* Segment */
      svg += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z"
                    fill="${fill}" stroke="#0A0402" stroke-width="1"/>`;
      /* Label */
      const aMid = (a0 + a1) / 2;
      const lx = cx + (r * 0.60) * Math.cos(aMid);
      const ly = cy + (r * 0.60) * Math.sin(aMid);
      const rot = (aMid * 180 / Math.PI);
      const raw = films[i].title || '';
      const label = raw.length > 20 ? raw.slice(0, 19) + '…' : raw;
      svg += `<text x="${lx}" y="${ly}"
                    transform="rotate(${rot} ${lx} ${ly})"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="#D4B864"
                    font-family="JetBrains Mono, monospace"
                    font-size="${n > 30 ? 8 : n > 20 ? 9 : 10}"
                    font-weight="500"
                    letter-spacing="0.3">${label.toUpperCase()}</text>`;
    }
    /* Center hub ring */
    svg += `<circle cx="${cx}" cy="${cy}" r="28" fill="#0A0402" stroke="#D4B864" stroke-width="1" opacity="0.9"/>`;
    wheelEl.innerHTML = svg;
  }

  /* ── Pool list ───────────────────────────────────────────────── */
  function renderPool(films) {
    if (!poolEl) return;
    poolEl.innerHTML = films.map((f, i) => `
      <li>
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="film-name">${escapeHtml(f.title)}</span>
        ${f.year ? `<span class="film-year">${f.year}</span>` : ''}
      </li>
    `).join('');
  }

  /* ── Spin history ────────────────────────────────────────────── */
  function renderHistory() {
    if (!historyEl) return;
    if (!history.length) {
      historyEl.innerHTML = '<li class="muted" style="font-size:13px;padding:4px 0">No spins yet.</li>';
      return;
    }
    historyEl.innerHTML = history.slice(0, 6).map(h =>
      `<li>${h.time} · <span>${escapeHtml(h.title)}</span></li>`
    ).join('');
  }

  /* ── Spin ────────────────────────────────────────────────────── */
  function spin() {
    if (spinBtn.disabled || !activeFilms.length) return;
    spinBtn.disabled = true;

    const titleEl = resultEl.querySelector('.title');
    const byEl    = resultEl.querySelector('.by');
    if (titleEl) titleEl.innerHTML = '<em style="color:var(--ink-mute)">…</em>';
    if (byEl)    byEl.textContent  = 'Spinning';

    const target = Math.floor(Math.random() * activeFilms.length);
    const per    = 360 / activeFilms.length;
    const stop   = -(target * per + per / 2);
    const turns  = 4 + Math.floor(Math.random() * 3);
    rotation     = turns * 360 + stop - (rotation % 360);
    wheelEl.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      const film  = activeFilms[target];
      const title = film.title;
      const year  = film.year;
      const dir   = film.director;

      if (titleEl) {
        titleEl.innerHTML = year
          ? `${escapeHtml(title)} <em style="color:var(--ink-mute);font-family:var(--f-mono);font-size:0.65em">${year}</em>`
          : escapeHtml(title);
      }
      if (byEl) {
        byEl.textContent = dir
          ? `${dir.toUpperCase()} · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
          : `THE WHEEL HAS SPOKEN · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      }

      history.unshift({ title, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) });
      renderHistory();
      spinBtn.disabled = false;
    }, 5100);
  }

  /* ── TMDB search ─────────────────────────────────────────────── */
  let tmdbKey = null;
  try {
    const settings = await db.get('site_settings', {});
    tmdbKey = settings?.tmdb_api_key || null;
  } catch (_) {}

  let searchTimeout = null;
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = searchEl.value.trim();

      if (!q) {
        if (searchResultsEl) searchResultsEl.innerHTML = '';
        return;
      }

      /* Filter built-in catalogue first */
      const localMatches = allFilms.filter(f =>
        f.title.toLowerCase().includes(q.toLowerCase()) ||
        (f.director && f.director.toLowerCase().includes(q.toLowerCase()))
      ).slice(0, 6);

      if (searchResultsEl) {
        renderSearchResults(localMatches, q);
      }

      /* TMDB search if key is available */
      if (tmdbKey) {
        searchTimeout = setTimeout(() => fetchTMDB(q), 400);
      }
    });
  }

  async function fetchTMDB(q) {
    if (!tmdbKey || !searchResultsEl) return;
    try {
      const url  = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(q)}&include_adult=false`;
      const res  = await fetch(url);
      const json = await res.json();
      const hits = (json.results || []).slice(0, 8).map(m => ({
        title:    m.title,
        year:     m.release_date ? m.release_date.slice(0, 4) : '',
        director: '',
        country:  '',
        tmdb_id:  m.id
      }));
      renderSearchResults(hits, q);
    } catch (_) {}
  }

  function renderSearchResults(films, q) {
    if (!searchResultsEl) return;
    if (!films.length) {
      searchResultsEl.innerHTML = `<div class="search-empty">No results for "${escapeHtml(q)}"</div>`;
      return;
    }
    searchResultsEl.innerHTML = films.map(f => `
      <button class="search-hit" data-title="${escapeHtml(f.title)}" data-year="${f.year || ''}" data-director="${escapeHtml(f.director || '')}">
        <span class="sh-title">${escapeHtml(f.title)}</span>
        ${f.year ? `<span class="sh-year">${f.year}</span>` : ''}
        ${f.director ? `<span class="sh-dir">${escapeHtml(f.director)}</span>` : ''}
      </button>
    `).join('');

    searchResultsEl.querySelectorAll('.search-hit').forEach(btn => {
      btn.addEventListener('click', () => {
        const film = {
          title:    btn.dataset.title,
          year:     btn.dataset.year,
          director: btn.dataset.director,
          country:  ''
        };
        /* Add to active pool if not already there */
        if (!activeFilms.find(f => f.title.toLowerCase() === film.title.toLowerCase())) {
          activeFilms.unshift(film);
          buildWheel(activeFilms);
          renderPool(activeFilms);
          if (countEl) countEl.textContent = activeFilms.length;
        }
        searchEl.value = '';
        searchResultsEl.innerHTML = '';
        toast(`"${film.title}" added to the wheel`);
      });
    });
  }

  /* Close search results on outside click */
  document.addEventListener('click', e => {
    if (searchEl && !searchEl.contains(e.target) && searchResultsEl && !searchResultsEl.contains(e.target)) {
      searchResultsEl.innerHTML = '';
    }
  });

  /* ── Init ────────────────────────────────────────────────────── */
  buildWheel(activeFilms);
  renderPool(activeFilms);
  renderHistory();
  spinBtn.addEventListener('click', spin);
})();
