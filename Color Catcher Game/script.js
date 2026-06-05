/* ═══════════════════════════════════════════════════════
   Color Catcher Game — Arcade Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Constants ───
  const HIGH_SCORE_KEY = 'colorCatcherBest';
  const BLOCK_SIZE = 32;
  const CATCHER_W = 80;
  const CATCHER_H = 18;
  const MAX_LIVES = 3;
  const SPAWN_INTERVAL = 900;      // ms between spawns
  const SPEED_STEP_INTERVAL = 15000; // ms between speed increases
  const BASE_SPEED = 1.8;
  const SPEED_INCREMENT = 0.25;

  const COLORS = [
    { name: 'cyan',    hex: '#06b6d4' },
    { name: 'magenta', hex: '#d946ef' },
    { name: 'yellow',  hex: '#eab308' },
    { name: 'emerald', hex: '#10b981' },
  ];

  // ─── State ───
  let score = 0;
  let combo = 1;
  let lives = MAX_LIVES;
  let highScore = 0;
  let speed = BASE_SPEED;
  let isRunning = false;

  let targetColor = null;
  let blocks = [];          // { x, y, w, h, color, hex }
  let catcher = { x: 0, y: 0, w: CATCHER_W, h: CATCHER_H };
  let keys = { left: false, right: false };

  let animId = null;
  let lastSpawn = 0;
  let lastSpeedStep = 0;
  let canvas, ctx;
  let cw = 0, ch = 0;
  let dpr = 1;

  // ─── DOM ───
  const $ = (s) => document.querySelector(s);

  const dom = {};

  function cacheDom() {
    dom.score = $('#score');
    dom.combo = $('#combo');
    dom.lives = $('#lives');
    dom.highScore = $('#high-score');
    dom.targetSwatch = $('#target-swatch');
    dom.canvas = $('#canvas');
    dom.gameOver = $('#game-over');
    dom.goScore = $('#go-score');
    dom.goBest = $('#go-best');
    dom.btnRestart = $('#btn-restart');
    canvas = dom.canvas;
    ctx = canvas.getContext('2d');
  }

  // ─── Storage ───
  function loadHigh() {
    try {
      const v = localStorage.getItem(HIGH_SCORE_KEY);
      if (v) highScore = parseInt(v, 10) || 0;
    } catch { highScore = 0; }
  }
  function saveHigh() {
    try { localStorage.setItem(HIGH_SCORE_KEY, String(highScore)); } catch { /* ignore */ }
  }

  // ─── Resize ───
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width;
    const h = w * (4 / 3);
    dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    cw = w;
    ch = h;
    ctx.scale(dpr, dpr);
    catcher.x = (cw - catcher.w) / 2;
    catcher.y = ch - 28;
  }

  // ─── Target Color ───
  function pickTarget() {
    targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    dom.targetSwatch.style.background = targetColor.hex;
    dom.targetSwatch.style.color = targetColor.hex;
  }

  // ─── Spawn Block ───
  function spawnBlock() {
    // 60% chance of target color, 40% of any other color
    let color;
    if (Math.random() < 0.6) {
      color = targetColor;
    } else {
      const others = COLORS.filter((c) => c.name !== targetColor.name);
      color = others[Math.floor(Math.random() * others.length)];
    }
    const x = Math.random() * (cw - BLOCK_SIZE);
    blocks.push({
      x,
      y: -BLOCK_SIZE,
      w: BLOCK_SIZE,
      h: BLOCK_SIZE,
      color: color.name,
      hex: color.hex,
    });
  }

  // ─── AABB Collision ───
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ─── Particles ───
  let particles = [];

  function spawnParticles(x, y, hex, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        hex,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ─── Shake ───
  let shakeTimer = 0;

  function triggerShake() {
    shakeTimer = 8;
  }

  // ─── Update ───
  function update(now) {
    if (!isRunning) return;

    // Catcher movement
    const moveSpeed = 5;
    if (keys.left) catcher.x -= moveSpeed;
    if (keys.right) catcher.x += moveSpeed;
    catcher.x = Math.max(0, Math.min(cw - catcher.w, catcher.x));

    // Spawn blocks
    if (now - lastSpawn > SPAWN_INTERVAL) {
      spawnBlock();
      lastSpawn = now;
    }

    // Speed escalation
    if (now - lastSpeedStep > SPEED_STEP_INTERVAL) {
      speed += SPEED_INCREMENT;
      lastSpeedStep = now;
    }

    // Move blocks
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      b.y += speed;

      // Off screen bottom — miss
      if (b.y > ch + 10) {
        blocks.splice(i, 1);
        continue;
      }

      // Collision with catcher
      if (aabb(b, catcher)) {
        if (b.color === targetColor.name) {
          // Correct catch
          score += 10 * combo;
          combo = Math.min(10, combo + 1);
          spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.hex, 12);
        } else {
          // Wrong catch
          lives--;
          combo = 1;
          triggerShake();
          spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ef4444', 8);
        }
        blocks.splice(i, 1);
        updateUI();

        if (lives <= 0) {
          gameOver();
          return;
        }

        if (score > highScore) {
          highScore = score;
          saveHigh();
        }
      }
    }

    updateParticles();

    if (shakeTimer > 0) shakeTimer--;
  }

  // ─── Draw ───
  function draw() {
    ctx.save();

    // Shake offset
    if (shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * 6;
      const sy = (Math.random() - 0.5) * 6;
      ctx.translate(sx, sy);
    }

    // Clear
    ctx.clearRect(-10, -10, cw + 20, ch + 20);

    // Background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.1)';
    ctx.beginPath();
    ctx.roundRect(0, 0, cw, ch, 14);
    ctx.fill();

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(56, 182, 248, 0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < cw; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ch);
      ctx.stroke();
    }
    for (let i = 0; i < ch; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(cw, i);
      ctx.stroke();
    }

    // Blocks
    for (const b of blocks) {
      ctx.shadowColor = b.hex;
      ctx.shadowBlur = 18;
      ctx.fillStyle = b.hex;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Particles
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.hex;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Catcher
    ctx.shadowColor = 'rgba(148, 163, 184, 0.2)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(catcher.x, catcher.y, catcher.w, catcher.h, 6);
    ctx.fill();

    // Catcher glow arc
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(catcher.x + 4, catcher.y);
    ctx.quadraticCurveTo(catcher.x + catcher.w / 2, catcher.y - 8, catcher.x + catcher.w - 4, catcher.y);
    ctx.stroke();

    ctx.restore();
  }

  // ─── Game Loop ───
  function gameLoop(timestamp) {
    if (!isRunning) return;
    update(timestamp);
    draw();
    animId = requestAnimationFrame(gameLoop);
  }

  // ─── UI Update ───
  function updateUI() {
    dom.score.textContent = score;
    dom.combo.textContent = `×${combo}`;
    dom.lives.textContent = '❤'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
    dom.highScore.textContent = highScore;
  }

  // ─── Game Over ───
  function gameOver() {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    dom.goScore.textContent = score;
    dom.goBest.textContent = highScore;
    dom.gameOver.classList.add('active');
  }

  // ─── Start ───
  function startGame() {
    score = 0;
    combo = 1;
    lives = MAX_LIVES;
    speed = BASE_SPEED;
    blocks = [];
    particles = [];
    shakeTimer = 0;
    keys.left = false;
    keys.right = false;

    resizeCanvas();
    pickTarget();
    lastSpawn = performance.now();
    lastSpeedStep = lastSpawn;
    updateUI();
    dom.gameOver.classList.remove('active');

    isRunning = true;
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(gameLoop);
  }

  // ─── Events ───
  function setupEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keys.right = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });

    // Touch controls — split screen
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        if (x < cw / 2) keys.left = true;
        else keys.right = true;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Check remaining touches
      const rect = canvas.getBoundingClientRect();
      let hasLeft = false, hasRight = false;
      for (const t of e.touches) {
        const x = t.clientX - rect.left;
        if (x < cw / 2) hasLeft = true;
        else hasRight = true;
      }
      keys.left = hasLeft;
      keys.right = hasRight;
    }, { passive: false });

    canvas.addEventListener('touchcancel', () => {
      keys.left = false;
      keys.right = false;
    });

    dom.btnRestart.addEventListener('click', startGame);

    window.addEventListener('resize', () => {
      if (!isRunning) return;
      resizeCanvas();
    });
  }

  // ─── Init ───
  function init() {
    cacheDom();
    loadHigh();
    dom.highScore.textContent = highScore;
    setupEvents();
    startGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
