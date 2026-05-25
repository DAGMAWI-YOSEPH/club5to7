/* ping-pong.js · playable 1v1 (player vs AI) */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const canvas = document.querySelector('#pong-canvas');
  const ctx = canvas.getContext('2d');
  const W = 800, H = 600;
  canvas.width = W; canvas.height = H;

  const PAD_W = 12, PAD_H = 110;
  const state = {
    p: { x: 24, y: H/2 - PAD_H/2, vy: 0 },
    a: { x: W - 24 - PAD_W, y: H/2 - PAD_H/2 },
    ball: { x: W/2, y: H/2, vx: 0, vy: 0, r: 8 },
    score: { p: 0, a: 0 },
    running: false,
    paused: true,
    rallies: 0,
    diff: 'normal',  // easy / normal / hard
    msg: 'Click to start'
  };

  const DIFF = {
    easy:   { aiSpeed: 4.5, ballBase: 5,  ballMax: 9  },
    normal: { aiSpeed: 6,   ballBase: 6,  ballMax: 11 },
    hard:   { aiSpeed: 8.5, ballBase: 7,  ballMax: 13 }
  };

  function reset(servingLeft) {
    state.ball.x = W/2; state.ball.y = H/2;
    const dir = servingLeft ? -1 : 1;
    const ang = (Math.random() - 0.5) * 0.5;
    const v = DIFF[state.diff].ballBase;
    state.ball.vx = Math.cos(ang) * v * dir;
    state.ball.vy = Math.sin(ang) * v;
    state.rallies = 0;
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // court
    ctx.fillStyle = '#19170F'; ctx.fillRect(0, 0, W, H);
    // center dashed line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.setLineDash([10, 14]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.setLineDash([]);
    // outer frame
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, W-8, H-8);

    // paddles
    rect(state.p.x, state.p.y, PAD_W, PAD_H, '#8AA0FF');
    rect(state.a.x, state.a.y, PAD_W, PAD_H, '#EDE6D3');

    // ball (with simple motion trail)
    ctx.fillStyle = 'rgba(201, 162, 39, 0.25)';
    ctx.beginPath(); ctx.arc(state.ball.x - state.ball.vx*0.6, state.ball.y - state.ball.vy*0.6, state.ball.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#C9A227';
    ctx.beginPath(); ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI*2); ctx.fill();
  }

  function step() {
    if (!state.running || state.paused) { draw(); return; }
    // ball
    state.ball.x += state.ball.vx;
    state.ball.y += state.ball.vy;

    // walls
    if (state.ball.y < state.ball.r) { state.ball.y = state.ball.r; state.ball.vy *= -1; }
    if (state.ball.y > H - state.ball.r) { state.ball.y = H - state.ball.r; state.ball.vy *= -1; }

    // paddles
    const collide = (px, py, pw, ph) =>
      state.ball.x + state.ball.r > px && state.ball.x - state.ball.r < px + pw &&
      state.ball.y + state.ball.r > py && state.ball.y - state.ball.r < py + ph;

    if (state.ball.vx < 0 && collide(state.p.x, state.p.y, PAD_W, PAD_H)) {
      state.ball.x = state.p.x + PAD_W + state.ball.r;
      const rel = (state.ball.y - (state.p.y + PAD_H/2)) / (PAD_H/2);
      const speed = Math.min(DIFF[state.diff].ballMax, Math.hypot(state.ball.vx, state.ball.vy) * 1.07);
      const ang = rel * 0.9;
      state.ball.vx = Math.cos(ang) * speed;
      state.ball.vy = Math.sin(ang) * speed;
      state.rallies++;
      updateRally();
    }
    if (state.ball.vx > 0 && collide(state.a.x, state.a.y, PAD_W, PAD_H)) {
      state.ball.x = state.a.x - state.ball.r;
      const rel = (state.ball.y - (state.a.y + PAD_H/2)) / (PAD_H/2);
      const speed = Math.min(DIFF[state.diff].ballMax, Math.hypot(state.ball.vx, state.ball.vy) * 1.07);
      const ang = Math.PI - rel * 0.9;
      state.ball.vx = Math.cos(ang) * speed;
      state.ball.vy = Math.sin(ang) * speed;
      state.rallies++;
      updateRally();
    }

    // AI move (with a touch of delay/error)
    const target = state.ball.y - PAD_H/2 + (Math.random()-0.5) * (state.diff === 'hard' ? 12 : state.diff === 'normal' ? 28 : 80);
    const speed = DIFF[state.diff].aiSpeed;
    const dy = target - state.a.y;
    if (Math.abs(dy) > speed) state.a.y += Math.sign(dy) * speed;
    else state.a.y = target;
    state.a.y = Math.max(0, Math.min(H - PAD_H, state.a.y));

    // score
    if (state.ball.x < -20) { state.score.a++; updateScore(); reset(false); }
    if (state.ball.x > W + 20) { state.score.p++; updateScore(); reset(true); }

    if (state.score.p >= 11 || state.score.a >= 11) {
      state.running = false;
      state.paused = true;
      state.msg = state.score.p > state.score.a ? `Game · you win ${state.score.p}-${state.score.a}` : `Game · AI wins ${state.score.a}-${state.score.p}`;
      showStatus(state.msg, 'Save score to leaderboard?');
      if (state.score.p > state.score.a && auth.current()) {
        db.insert('pong_scores', { handle: auth.current().handle, score: state.score.p, opponent_score: state.score.a });
      }
      renderLeaderboard();
    }

    draw();
  }

  function showStatus(big, sm) {
    const s = document.querySelector('#pong-status');
    s.classList.remove('hide');
    s.querySelector('.big').textContent = big;
    s.querySelector('.sm').textContent = sm;
  }
  function hideStatus() { document.querySelector('#pong-status').classList.add('hide'); }

  function updateScore() {
    document.querySelector('#sc-p').textContent = state.score.p;
    document.querySelector('#sc-a').textContent = state.score.a;
  }
  function updateRally() {
    document.querySelector('#rally').textContent = state.rallies;
  }

  function start() {
    state.score = { p: 0, a: 0 };
    state.running = true;
    state.paused = false;
    updateScore();
    reset(Math.random() > 0.5);
    hideStatus();
  }

  // Mouse / touch
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = (e.clientY - rect.top) / rect.height * H;
    state.p.y = Math.max(0, Math.min(H - PAD_H, y - PAD_H/2));
  });
  canvas.addEventListener('click', () => { if (!state.running) start(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { state.paused = !state.paused; if (!state.running) start(); else if (state.paused) showStatus('Paused', 'Space to resume'); else hideStatus(); }
    if (e.key === 'ArrowUp') state.p.y = Math.max(0, state.p.y - 30);
    if (e.key === 'ArrowDown') state.p.y = Math.min(H - PAD_H, state.p.y + 30);
  });

  document.querySelector('#btn-start').addEventListener('click', start);
  document.querySelector('#btn-pause').addEventListener('click', () => {
    if (!state.running) return;
    state.paused = !state.paused;
    state.paused ? showStatus('Paused', 'Click to resume') : hideStatus();
  });

  document.querySelectorAll('.difficulty button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.difficulty button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    state.diff = b.dataset.diff;
  }));

  async function renderLeaderboard() {
    const scores = await db.list('pong_scores', { sortBy: 'score', desc: true });
    const top = scores.slice(0, 8);
    document.querySelector('#leaderboard').innerHTML = top.map((s, i) => `
      <li>
        <span><span class="rank">${String(i+1).padStart(2,'0')}</span>@${s.handle}</span>
        <span class="score">${s.score}–${s.opponent_score}</span>
      </li>
    `).join('') || '<li class="muted">No scores yet.</li>';
  }

  renderLeaderboard();
  showStatus('5/7', 'Click or press space to play');
  draw();
  setInterval(step, 1000 / 60);
})();
