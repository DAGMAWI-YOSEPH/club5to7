/* picker.js · build wheel from film_pool, spin it */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const wheelEl = document.querySelector('#wheel');
  const spinBtn = document.querySelector('#spin');
  const resultEl = document.querySelector('#result');
  const poolEl = document.querySelector('#pool');
  const historyEl = document.querySelector('#history');

  const films = (await db.list('film_pool')).filter(f => f.in_rotation);
  let rotation = 0;
  const history = [];

  function buildWheel() {
    const n = films.length;
    if (!n) { wheelEl.innerHTML = '<text x="200" y="200" text-anchor="middle" fill="#666">Pool empty</text>'; return; }
    const cx = 200, cy = 200, r = 200;
    const colors = ['#2E46C7', '#19170F', '#C9A227', '#C8401C', '#1f5530', '#5b3a8a'];
    let svg = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const fill = colors[i % colors.length];
      svg += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z" fill="${fill}" stroke="#19170F" stroke-width="1.5"/>`;
      // Label along radius
      const aMid = (a0 + a1) / 2;
      const lx = cx + (r * 0.62) * Math.cos(aMid);
      const ly = cy + (r * 0.62) * Math.sin(aMid);
      const rot = (aMid * 180 / Math.PI);
      const label = (films[i].title || '').replace(/[()]/g, '').toUpperCase();
      svg += `
        <text x="${lx}" y="${ly}"
              transform="rotate(${rot} ${lx} ${ly})"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#FBF8F1"
              font-family="DM Sans, system-ui"
              font-size="12"
              font-weight="500"
              letter-spacing="0.5"
              style="text-shadow: 0 1px 0 rgba(0,0,0,0.4)">
          ${label.length > 22 ? label.slice(0, 21) + '…' : label}
        </text>
      `;
    }
    wheelEl.innerHTML = svg;
  }

  function renderPool() {
    poolEl.innerHTML = films.map((f, i) => `
      <li>
        <span><span class="n">${String(i+1).padStart(2,'0')}</span> &nbsp;${escapeHtml(f.title)}</span>
      </li>
    `).join('');
  }

  function renderHistory() {
    if (!history.length) { historyEl.innerHTML = '<li class="muted">No spins yet.</li>'; return; }
    historyEl.innerHTML = history.slice(0, 6).map(h => `<li>${h.time} · landed on <span>${escapeHtml(h.title)}</span></li>`).join('');
  }

  function spin() {
    if (spinBtn.disabled) return;
    spinBtn.disabled = true;
    resultEl.querySelector('.title').innerHTML = '<em>…</em>';
    resultEl.querySelector('.by').textContent = 'Spinning';
    const target = Math.floor(Math.random() * films.length);
    const per = 360 / films.length;
    const stop = -(target * per + per / 2);   // bring midpoint of slice to top
    const turns = 4 + Math.floor(Math.random() * 3);
    rotation = turns * 360 + stop - (rotation % 360);
    wheelEl.style.transform = `rotate(${rotation}deg)`;
    setTimeout(() => {
      const film = films[target];
      const name = film.title;
      const m = name.match(/^(.+?)\s*\((\d{4})\)\s*$/);
      const title = m ? m[1] : name;
      const year = m ? m[2] : '';
      resultEl.querySelector('.title').innerHTML = year
        ? `${escapeHtml(title)} <em>${year}</em>`
        : escapeHtml(name);
      resultEl.querySelector('.by').textContent = `THE WHEEL HAS SPOKEN · ${new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'})}`;
      history.unshift({ title: name, time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) });
      renderHistory();
      spinBtn.disabled = false;
    }, 5100);
  }

  buildWheel();
  renderPool();
  renderHistory();
  spinBtn.addEventListener('click', spin);
})();
