/* ═══════════════════════════════════════════════════════
   Cosmic Debris Evader — Canvas Game Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Canvas Setup ─── */
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 480, H = 640;

  /* ─── DOM ─── */
  const scoreEl = document.getElementById('score');
  const shieldEl = document.getElementById('shield');
  const fieldEl = document.getElementById('field-energy');
  const bestEl = document.getElementById('best');
  const modal = document.getElementById('modal');
  const mTime = document.getElementById('m-time');
  const mScore = document.getElementById('m-score');
  const mBest = document.getElementById('m-best');
  const restartBtn = document.getElementById('btn-restart');

  /* ─── Constants ─── */
  const PLAYER_R = 14;
  const PLAYER_Y = H - 50;
  const FIELD_R = 90;
  const FIELD_DRAIN = 22;              // energy/sec while active
  const FIELD_RECHARGE = 12;           // energy/sec while idle
  const MAX_ENERGY = 100;
  const DEBRIS_SPAWN_INTERVAL = 700;   // ms between spawns
  const LS_KEY = 'cde_high';

  /* ─── State ─── */
  let score = 0, highScore = 0;
  let shieldHP = 100;
  let fieldEnergy = MAX_ENERGY;
  let fieldActive = false;
  let survivalTime = 0;
  let isRunning = false, animId = null;
  let player = { x: W / 2, y: PLAYER_Y, r: PLAYER_R };
  let debris = [];
  let stars = [];
  let spawnTimerId = null;
  let lastTime = 0;

  /* ─── Init ─── */
  function init () {
    highScore = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
    bestEl.textContent = highScore;
    restartBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      resetGame();
    });
    setupInput();
    generateStars();
    resetGame();
  }

  /* ─── Stars background ─── */
  function generateStars () {
    stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 0.8,
        a: 0.3 + Math.random() * 0.7,
      });
    }
  }

  /* ─── Input ─── */
  let pointerX = null;
  let fieldHold = false;

  function setupInput () {
    // Mouse
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      pointerX = (e.clientX - rect.left) * scaleX;
    });

    canvas.addEventListener('mouseleave', () => { pointerX = null; });

    // Touch
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const touch = e.touches[0];
      pointerX = (touch.clientX - rect.left) * scaleX;
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const touch = e.touches[0];
      pointerX = (touch.clientX - rect.left) * scaleX;
      fieldHold = true;
    }, { passive: false });

    canvas.addEventListener('touchend', () => { fieldHold = false; });

    // Spacebar
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        fieldHold = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        fieldHold = false;
      }
    });
  }

  /* ─── Reset ─── */
  function resetGame () {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (spawnTimerId) { clearInterval(spawnTimerId); spawnTimerId = null; }

    score = 0;
    shieldHP = 100;
    fieldEnergy = MAX_ENERGY;
    survivalTime = 0;
    fieldActive = false;
    fieldHold = false;
    debris = [];
    player.x = W / 2;
    pointerX = null;
    isRunning = true;
    updateUI();

    spawnTimerId = setInterval(spawnDebris, DEBRIS_SPAWN_INTERVAL);
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  /* ─── Spawn Debris ─── */
  function spawnDebris () {
    if (!isRunning) return;

    const types = [
      { r: 8,  speed: 1.4 },
      { r: 12, speed: 1.0 },
      { r: 16, speed: 0.7 },
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    const x = t.r + Math.random() * (W - t.r * 2);
    const angle = (Math.random() - 0.5) * 0.8;
    const spd = t.speed * (0.7 + Math.random() * 0.6);

    debris.push({
      x, y: -t.r,
      r: t.r,
      vx: Math.sin(angle) * spd * 0.6,
      vy: spd,
      ax: 0,
      ay: 0.04,        // slight gravity
    });
  }

  /* ─── Update ─── */
  function update (dt) {
    if (!isRunning) return;
    const dtNorm = Math.min(dt / 16.667, 3);  // normalize to ~60fps

    // Survival time
    survivalTime += dt / 1000;
    score = Math.floor(survivalTime * 10);
    updateUI();

    // Move player
    if (pointerX !== null) {
      const target = pointerX;
      player.x += (target - player.x) * 0.3;
      player.x = Math.max(player.r, Math.min(W - player.r, player.x));
    }

    // Field toggle
    fieldActive = fieldHold && fieldEnergy > 0;

    // Field energy
    if (fieldActive) {
      fieldEnergy -= FIELD_DRAIN * (dt / 1000);
      if (fieldEnergy < 0) fieldEnergy = 0;
    } else {
      fieldEnergy += FIELD_RECHARGE * (dt / 1000);
      if (fieldEnergy > MAX_ENERGY) fieldEnergy = MAX_ENERGY;
    }
    fieldEl.textContent = Math.round(fieldEnergy);

    // Move debris
    for (const d of debris) {
      d.vy += d.ay * dtNorm;
      d.vx += d.ax * dtNorm;
      d.x += d.vx * dtNorm;
      d.y += d.vy * dtNorm;
    }

    // Magnetic field deflection
    if (fieldActive && fieldEnergy > 0) {
      for (const d of debris) {
        const dx = d.x - player.x;
        const dy = d.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < FIELD_R + d.r && dist > 0.01) {
          const push = 3.5 * (1 - dist / (FIELD_R + d.r));
          const nx = dx / dist;
          const ny = dy / dist;
          d.vx += nx * push;
          d.vy += ny * push;
        }
      }
    }

    // Collision detection (circle-to-circle)
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      const dx = d.x - player.x;
      const dy = d.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < player.r + d.r) {
        // Hit!
        shieldHP -= (d.r / 8) * 15;
        debris.splice(i, 1);
        if (shieldHP <= 0) {
          shieldHP = 0;
          updateUI();
          gameOver();
          return;
        }
        updateUI();
        spawnImpactEffect(d.x, d.y, d.r);
        continue;
      }
    }

    // Purge off-screen debris
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      if (d.y - d.r > H + 10 || d.x + d.r < -20 || d.x - d.r > W + 20) {
        debris.splice(i, 1);
      }
    }
  }

  /* ─── Impact effect ─── */
  let impacts = [];

  function spawnImpactEffect (x, y, r) {
    const count = Math.min(12, Math.round(r * 1.5));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const speed = 1 + Math.random() * 2;
      impacts.push({
        x, y, r: 1.5 + Math.random() * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.015,
      });
    }
  }

  function updateImpacts () {
    for (let i = impacts.length - 1; i >= 0; i--) {
      const p = impacts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) impacts.splice(i, 1);
    }
  }

  /* ─── Draw ─── */
  function draw () {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createRadialGradient(W / 2, H * 0.8, 10, W / 2, H * 0.8, H * 0.8);
    grad.addColorStop(0, '#0a1830');
    grad.addColorStop(1, '#03050a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Debris
    for (const d of debris) {
      // Glow
      ctx.shadowColor = 'rgba(249, 115, 22, 0.3)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
      ctx.beginPath();
      ctx.arc(d.x - d.r * 0.2, d.y - d.r * 0.2, d.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magnetic field
    if (fieldActive && fieldEnergy > 0) {
      const pulse = 0.85 + Math.sin(performance.now() / 300) * 0.15;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, FIELD_R * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill
      ctx.fillStyle = `rgba(6, 182, 212, ${0.04 * pulse})`;
      ctx.beginPath();
      ctx.arc(player.x, player.y, FIELD_R * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player shield
    ctx.shadowColor = 'rgba(6, 182, 212, 0.35)';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Player inner glow
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(player.x - 3, player.y - 3, player.r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Impact particles
    for (const p of impacts) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  /* ─── Loop ─── */
  function loop (now) {
    const dt = now - lastTime;
    lastTime = now;
    update(dt);
    updateImpacts();
    draw();
    if (isRunning) animId = requestAnimationFrame(loop);
  }

  /* ─── Game Over ─── */
  function gameOver () {
    isRunning = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (spawnTimerId) { clearInterval(spawnTimerId); spawnTimerId = null; }

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(LS_KEY, String(highScore));
      bestEl.textContent = highScore;
    }

    const secs = Math.floor(survivalTime);
    mTime.textContent = secs + 's';
    mScore.textContent = score;
    mBest.textContent = highScore;
    modal.classList.add('active');
  }

  /* ─── UI ─── */
  function updateUI () {
    scoreEl.textContent = score;
    shieldEl.textContent = Math.round(shieldHP);
    bestEl.textContent = highScore;
  }

  /* ─── Boot ─── */
  init();

})();
