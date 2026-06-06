((w) => {
  const C = {
    W: 480, H: 640,
    LANE_COUNT: 3, LANE_WIDTH: 120, ROAD_LEFT: 60,
    get LANE_CENTERS() {
      return Array.from({ length: this.LANE_COUNT }, (_, i) => this.ROAD_LEFT + this.LANE_WIDTH * (i + 0.5));
    },
    PLAYER_W: 38, PLAYER_H: 68, PLAYER_Y: 540,
    BASE_SPEED: 3, SPEED_STEP: 0.4, DIFF_STEP: 10000,
    BASE_SPAWN: 2000, SPAWN_FACTOR: 0.87, MIN_SPAWN: 400,
    LANE_COOLDOWN: 180, MAX_TRAFFIC: 8,
    TRAFFIC_COLORS: ['#ffd700','#ff6b35','#ff3333','#00d4ff','#b44dff','#22c55e','#fb923c']
  };

  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');
  const el = {
    time: $('timeDisplay'), score: $('scoreDisplay'), speed: $('speedDisplay'), best: $('bestDisplay'),
    modal: $('modal'), fTime: $('finalTime'), fScore: $('finalScore'),
    fDodged: $('finalDodged'), fSpeed: $('finalSpeed'), restart: $('restartBtn')
  };

  const s = {
    player: { x: 0, y: C.PLAYER_Y, w: C.PLAYER_W, h: C.PLAYER_H, lane: 1, targetX: 0 },
    cars: [], score: 0, dodged: 0, startTime: 0, elapsed: 0,
    speed: C.BASE_SPEED, spawnDelay: C.BASE_SPAWN, lastSpawn: 0, lastDiff: 0,
    lastLaneChange: 0, best: 0, roadOffset: 0, shake: 0, flash: 0,
    playing: false, gameOver: false, gameOverTimer: 0, animId: null, lastTime: 0
  };

  s.best = parseInt(localStorage.getItem('carDodgerBest')) || 0;
  s.player.x = C.LANE_CENTERS[1] - C.PLAYER_W / 2;
  s.player.targetX = s.player.x;

  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function roundRect(ctx2, x, y, w, h, r) {
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.lineTo(x + w - r, y);
    ctx2.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx2.lineTo(x + w, y + h - r);
    ctx2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx2.lineTo(x + r, y + h);
    ctx2.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx2.lineTo(x, y + r);
    ctx2.quadraticCurveTo(x, y, x + r, y);
    ctx2.closePath();
  }

  // ─── Drawing ─────────────────────────────────────────────────
  function drawRoad() {
    ctx.fillStyle = '#0d111f';
    ctx.fillRect(0, 0, C.W, C.H);

    // Road surface
    ctx.fillStyle = '#131a2e';
    ctx.fillRect(C.ROAD_LEFT, 0, C.LANE_COUNT * C.LANE_WIDTH, C.H);

    // Road glow edge
    ctx.shadowColor = 'rgba(255,45,120,0.06)';
    ctx.shadowBlur = 20;

    // Left shoulder line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,255,255,0.15)';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(C.ROAD_LEFT, 0); ctx.lineTo(C.ROAD_LEFT, C.H); ctx.stroke();

    // Right shoulder line
    ctx.beginPath(); ctx.moveTo(C.ROAD_LEFT + C.LANE_COUNT * C.LANE_WIDTH, 0);
    ctx.lineTo(C.ROAD_LEFT + C.LANE_COUNT * C.LANE_WIDTH, C.H); ctx.stroke();
    ctx.shadowBlur = 0;

    // Lane dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -s.roadOffset;
    for (let i = 1; i < C.LANE_COUNT; i++) {
      const lx = C.ROAD_LEFT + i * C.LANE_WIDTH;
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, C.H); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Shoulder neon strips
    const stripLen = 20;
    const stripGap = 50;
    const total = stripLen + stripGap;
    const off = s.roadOffset * 0.6 % total;
    ctx.fillStyle = 'rgba(255,45,120,0.06)';
    for (let y = -off; y < C.H; y += total) {
      ctx.fillRect(10, y, 4, stripLen);
      ctx.fillRect(C.W - 14, y, 4, stripLen);
    }

    // Road center marker
    ctx.fillStyle = 'rgba(255,45,120,0.02)';
    ctx.fillRect(C.ROAD_LEFT, 0, C.LANE_COUNT * C.LANE_WIDTH, C.H);
  }

  function drawCar(x, y, w, h, color, isPlayer) {
    ctx.save();

    if (isPlayer) {
      ctx.shadowColor = '#ff2d78';
      ctx.shadowBlur = 18;
    }

    // Body
    roundRect(ctx, x, y, w, h, 6);
    ctx.fillStyle = color;
    ctx.fill();
    if (!isPlayer) {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (isPlayer) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ff2d78';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Windshield
    const wsX = x + 5, wsY = y + 10, wsW = w - 10, wsH = h * 0.28;
    roundRect(ctx, wsX, wsY, wsW, wsH, 3);
    ctx.fillStyle = isPlayer ? 'rgba(10,10,30,0.7)' : 'rgba(0,0,0,0.35)';
    ctx.fill();

    // Rear window
    const rwH = h * 0.18;
    roundRect(ctx, wsX, y + h - rwH - 8, wsW, rwH, 3);
    ctx.fillStyle = isPlayer ? 'rgba(10,10,30,0.5)' : 'rgba(0,0,0,0.25)';
    ctx.fill();

    // Headlights (front, facing up = top of traffic, bottom of player)
    ctx.shadowBlur = 0;
    const hlY1 = isPlayer ? y + h - 6 : y + 2;
    const hlY2 = isPlayer ? y + h - 6 : y + 2;
    ctx.fillStyle = isPlayer ? '#ff0000' : '#fff';
    if (isPlayer) ctx.shadowColor = '#ff0000';
    else ctx.shadowColor = '#fff';
    ctx.shadowBlur = isPlayer ? 6 : 8;
    ctx.fillRect(x + 4, hlY1, 6, 4);
    ctx.fillRect(x + w - 10, hlY2, 6, 4);

    // Taillights (opposite end)
    ctx.shadowBlur = 0;
    const tlY1 = isPlayer ? y + 2 : y + h - 6;
    const tlY2 = isPlayer ? y + 2 : y + h - 6;
    ctx.fillStyle = isPlayer ? '#ff6600' : '#ff0000';
    if (isPlayer) ctx.shadowColor = '#ff6600';
    else ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = isPlayer ? 4 : 4;
    ctx.fillRect(x + 4, tlY1, 5, 3);
    ctx.fillRect(x + w - 9, tlY2, 5, 3);
    ctx.shadowBlur = 0;

    // Wheels
    ctx.fillStyle = '#0a0a0f';
    const wheelInset = 4;
    const wheelW = 5, wheelH = 14;
    ctx.fillRect(x - wheelInset, y + 10, wheelW, wheelH);
    ctx.fillRect(x + w - wheelInset, y + 10, wheelW, wheelH);
    ctx.fillRect(x - wheelInset, y + h - 24, wheelW, wheelH);
    ctx.fillRect(x + w - wheelInset, y + h - 24, wheelW, wheelH);

    // Player glow ring
    if (isPlayer) {
      ctx.shadowColor = '#ff2d78';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = 'rgba(255,45,120,0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 7);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  function drawBackground() {
    // Ground grid on shoulders
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 20; i++) {
      const gy = (i * 40 + s.roadOffset * 0.3) % 800 - 40;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(C.ROAD_LEFT, gy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(C.ROAD_LEFT + C.LANE_COUNT * C.LANE_WIDTH, gy);
      ctx.lineTo(C.W, gy); ctx.stroke();
    }

    // Horizon line
    ctx.strokeStyle = 'rgba(255,45,120,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(C.W, 40); ctx.stroke();
  }

  // ─── Spawning ────────────────────────────────────────────────
  function spawnCar() {
    if (s.cars.length >= C.MAX_TRAFFIC) return;
    const lane = randInt(0, C.LANE_COUNT - 1);

    // Prevent same-lane stacking
    const tooClose = s.cars.some(c => c.lane === lane && c.y > -100 && c.y < 200);
    if (tooClose) return;

    const w = rand(34, 44);
    const h = rand(58, 72);
    const color = C.TRAFFIC_COLORS[randInt(0, C.TRAFFIC_COLORS.length - 1)];
    const spdOff = rand(-0.4, 0.6);
    s.cars.push({
      x: C.LANE_CENTERS[lane] - w / 2, y: -h,
      w, h, lane, color, speed: s.speed + spdOff, scored: false
    });
  }

  // ─── Update ──────────────────────────────────────────────────
  function update(dt) {
    const now = performance.now();

    // Player lane movement
    s.player.x = lerp(s.player.x, s.player.targetX, 0.14 * dt);

    // Road scroll
    s.roadOffset += s.speed * dt;

    // Spawn timer
    if (now - s.lastSpawn > s.spawnDelay) {
      spawnCar();
      s.lastSpawn = now;
    }

    // Update cars
    for (let i = s.cars.length - 1; i >= 0; i--) {
      const c = s.cars[i];
      c.y += c.speed * dt;

      // Dodge tracking
      if (!c.scored && c.y > C.H + 20) {
        c.scored = true;
        s.dodged++;
      }

      // Remove off-screen cars
      if (c.y > C.H + 80) {
        s.cars.splice(i, 1);
      }
    }

    // Difficulty step
    if (s.elapsed - s.lastDiff >= C.DIFF_STEP) {
      s.speed += C.SPEED_STEP;
      s.spawnDelay = Math.max(C.MIN_SPAWN, s.spawnDelay * C.SPAWN_FACTOR);
      s.lastDiff = s.elapsed;
    }

    // Collision check
    for (const c of s.cars) {
      if (aabb(s.player, c)) {
        gameOver();
        return;
      }
    }

    // Update elapsed
    s.elapsed = now - s.startTime;
    s.score = Math.floor(s.elapsed / 100);
  }

  // ─── Game Flow ───────────────────────────────────────────────
  function moveLeft() {
    if (s.gameOver || !s.playing) return;
    const now = performance.now();
    if (now - s.lastLaneChange < C.LANE_COOLDOWN) return;
    if (s.player.lane <= 0) return;
    s.player.lane--;
    s.player.targetX = C.LANE_CENTERS[s.player.lane] - C.PLAYER_W / 2;
    s.lastLaneChange = now;
  }

  function moveRight() {
    if (s.gameOver || !s.playing) return;
    const now = performance.now();
    if (now - s.lastLaneChange < C.LANE_COOLDOWN) return;
    if (s.player.lane >= C.LANE_COUNT - 1) return;
    s.player.lane++;
    s.player.targetX = C.LANE_CENTERS[s.player.lane] - C.PLAYER_W / 2;
    s.lastLaneChange = now;
  }

  function gameOver() {
    s.playing = false;
    s.gameOver = true;
    s.shake = 18;
    s.flash = 20;
    s.gameOverTimer = 50;

    const finalScore = s.score;
    const isNewBest = finalScore > s.best;
    if (isNewBest) {
      s.best = finalScore;
      localStorage.setItem('carDodgerBest', s.best);
    }

    const mins = Math.floor(s.elapsed / 60000);
    const secs = Math.floor((s.elapsed % 60000) / 1000);
    el.fTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    el.fScore.textContent = finalScore;
    el.fDodged.textContent = s.dodged;
    const spdFactor = (s.speed / C.BASE_SPEED).toFixed(1);
    el.fSpeed.textContent = `×${spdFactor}`;
  }

  function resetGame() {
    el.modal.classList.add('hidden');

    s.player.lane = 1;
    s.player.x = C.LANE_CENTERS[1] - C.PLAYER_W / 2;
    s.player.targetX = s.player.x;
    s.cars = [];
    s.score = 0;
    s.dodged = 0;
    s.speed = C.BASE_SPEED;
    s.spawnDelay = C.BASE_SPAWN;
    s.lastSpawn = 0;
    s.lastDiff = 0;
    s.roadOffset = 0;
    s.shake = 0;
    s.flash = 0;
    s.gameOver = false;
    s.gameOverTimer = 0;
    s.playing = true;
    s.elapsed = 0;
    s.startTime = performance.now();
    s.lastLaneChange = 0;

    el.best.textContent = s.best;
    updateUI();

    if (!s.animId) {
      s.lastTime = performance.now();
      s.animId = requestAnimationFrame(tick);
    }
  }

  // ─── UI ──────────────────────────────────────────────────────
  function updateUI() {
    const mins = Math.floor(s.elapsed / 60000);
    const secs = Math.floor((s.elapsed % 60000) / 1000);
    el.time.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    el.score.textContent = s.score;
    const spdFactor = (s.speed / C.BASE_SPEED).toFixed(1);
    el.speed.textContent = `×${spdFactor}`;
    if (s.score > s.best) {
      el.best.textContent = s.score;
      el.best.style.color = '#ff2d78';
    }
  }

  // ─── Events ──────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault(); moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault(); moveRight();
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!s.playing || s.gameOver) return;
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    const rx = (t.clientX - r.left) / r.width;
    if (rx < 0.5) moveLeft(); else moveRight();
  }, { passive: false });

  el.restart.addEventListener('click', resetGame);

  // ─── Render ──────────────────────────────────────────────────
  function render() {
    ctx.save();

    // Screen shake
    if (s.shake > 0) {
      const intensity = s.shake * 0.35;
      ctx.translate(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
      s.shake--;
    }

    drawBackground();
    drawRoad();

    // Traffic cars
    for (const c of s.cars) {
      drawCar(c.x, c.y, c.w, c.h, c.color, false);
    }

    // Player
    drawCar(s.player.x, s.player.y, s.player.w, s.player.h, '#ff2d78', true);

    // Flash overlay
    if (s.flash > 0) {
      ctx.fillStyle = `rgba(255,0,0,${s.flash * 0.025})`;
      ctx.fillRect(-20, -20, C.W + 40, C.H + 40);
      s.flash--;
    }

    ctx.restore();
  }

  // ─── Main Loop ───────────────────────────────────────────────
  function tick(ts) {
    const dt = Math.min((ts - s.lastTime) / 16.67, 3);
    s.lastTime = ts;

    if (s.playing) {
      update(dt);
    } else if (s.gameOver) {
      s.gameOverTimer--;
      if (s.gameOverTimer <= 0) {
        render();
        updateUI();
        el.modal.classList.remove('hidden');
        return;
      }
    }

    render();
    updateUI();
    s.animId = requestAnimationFrame(tick);
  }

  // ─── Init ─────────────────────────────────────────────────────
  function init() {
    el.best.textContent = s.best;
    updateUI();

    s.startTime = performance.now();
    s.playing = true;
    s.lastTime = performance.now();
    s.animId = requestAnimationFrame(tick);
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
