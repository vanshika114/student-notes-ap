/* ═══════════════════════════════════════════════════════
   Balloon Pop Game — Game Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM ─── */
  const sky = document.getElementById('sky');
  const scoreEl = document.getElementById('score');
  const multEl = document.getElementById('mult');
  const timerEl = document.getElementById('timer');
  const bestEl = document.getElementById('best');
  const startBtn = document.getElementById('btn-start');
  const modal = document.getElementById('modal');
  const mPopped = document.getElementById('m-popped');
  const mScore = document.getElementById('m-score');
  const mBest = document.getElementById('m-best');
  const restartBtn = document.getElementById('btn-restart');

  /* ─── State ─── */
  let score = 0, multiplier = 1, highScore = 0;
  let popped = 0;
  let timeLeft = 45;
  let isRunning = false;
  let spawnTimerId = null;
  let tickTimerId = null;
  let activeBalloons = [];

  /* ─── Constants ─── */
  const ROUND_SECONDS = 45;
  const BASE_SPAWN = 1200;             // ms
  const BASE_DURATION = 4000;          // ms
  const SPAWN_DECAY = 50;              // ms per 40 pts
  const DURATION_DECAY = 100;          // ms per 40 pts
  const DECAY_STEP = 40;
  const MIN_SPAWN = 350;
  const MIN_DURATION = 1200;
  const POINTS_PER_POP = 10;
  const BALLOON_SIZE = 6;              // vmin
  const COLORS = [
    { fill: '#ff2a5f', glow: 'rgba(255,42,95,0.35)' },
    { fill: '#00f0ff', glow: 'rgba(0,240,255,0.30)' },
    { fill: '#a855f7', glow: 'rgba(168,85,247,0.30)' },
  ];
  const LS_KEY = 'bpg_high';

  /* ─── Init ─── */
  function init () {
    highScore = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
    bestEl.textContent = highScore;
    startBtn.addEventListener('click', startRound);
    restartBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      startRound();
    });
    sky.addEventListener('click', onSkyClick);
    sky.addEventListener('touchstart', onSkyTouch, { passive: true });
  }

  /* ─── Difficulty ─── */
  function getSpawnInterval () {
    const steps = Math.floor(score / DECAY_STEP);
    return Math.max(MIN_SPAWN, BASE_SPAWN - steps * SPAWN_DECAY);
  }

  function getFloatDuration () {
    const steps = Math.floor(score / DECAY_STEP);
    return Math.max(MIN_DURATION, BASE_DURATION - steps * DURATION_DECAY);
  }

  /* ─── Start Round ─── */
  function startRound () {
    stopAll();
    clearBalloons();

    score = 0; multiplier = 1; popped = 0;
    timeLeft = ROUND_SECONDS;
    isRunning = true;
    activeBalloons = [];

    updateUI();
    timerEl.textContent = ROUND_SECONDS;
    startBtn.disabled = true;

    tickTimerId = setInterval(tick, 200);
    scheduleSpawn();
  }

  function scheduleSpawn () {
    if (!isRunning) return;
    spawnBalloon();
    const next = getSpawnInterval() + Math.random() * 200;
    spawnTimerId = setTimeout(scheduleSpawn, next);
  }

  /* ─── Timer ─── */
  function tick () {
    if (!isRunning) return;
    timeLeft -= 0.2;
    if (timeLeft <= 0) {
      timeLeft = 0;
      timerEl.textContent = '0';
      endRound();
      return;
    }
    timerEl.textContent = Math.ceil(timeLeft);
  }

  /* ─── Spawn ─── */
  function spawnBalloon () {
    if (!isRunning) return;

    const rect = sky.getBoundingClientRect();
    const size = Math.max(28, rect.width * (BALLOON_SIZE / 100));
    const pad = size / 2;
    const x = pad + Math.random() * (rect.width - size - pad * 2);

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const duration = getFloatDuration();

    const el = document.createElement('div');
    el.className = 'balloon';
    el.style.left = x + 'px';
    el.style.width = size + 'px';
    el.style.height = (size * 1.2) + 'px';
    el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), ${color.fill})`;
    el.style.boxShadow = `0 0 16px ${color.glow}`;
    el.style.animationDuration = (duration / 1000) + 's';
    el.dataset.popped = 'false';

    sky.appendChild(el);

    const entry = { el, id: Date.now() + Math.random() };
    activeBalloons.push(entry);

    // Remove on animation end (escaped)
    el.addEventListener('animationend', () => {
      if (el.dataset.popped === 'false') {
        // Missed — balloon escaped
        multiplier = 1;
        updateUI();
        sky.classList.remove('shake');
        void sky.offsetWidth;
        sky.classList.add('shake');
      }
      removeBalloon(entry);
    });
  }

  /* ─── Click / Tap ─── */
  function onSkyClick (e) {
    if (!isRunning) return;
    handlePointer(e.clientX, e.clientY);
  }

  function onSkyTouch (e) {
    if (!isRunning) return;
    const touch = e.touches[0];
    if (!touch) return;
    handlePointer(touch.clientX, touch.clientY);
  }

  function handlePointer (cx, cy) {
    if (!isRunning) return;

    // Find hit balloon (reverse order — topmost first)
    for (let i = activeBalloons.length - 1; i >= 0; i--) {
      const entry = activeBalloons[i];
      const el = entry.el;
      if (el.dataset.popped === 'true') continue;

      const rect = el.getBoundingClientRect();
      if (cx >= rect.left && cx <= rect.right &&
          cy >= rect.top && cy <= rect.bottom) {
        pop(entry);
        return;
      }
    }
  }

  /* ─── Pop ─── */
  function pop (entry) {
    const el = entry.el;
    if (el.dataset.popped === 'true') return;
    el.dataset.popped = 'true';

    // Score
    const earned = POINTS_PER_POP * multiplier;
    score += earned;
    popped++;
    multiplier++;
    updateUI();

    // Visual pop
    el.classList.add('pop');

    // Particles
    spawnParticles(el);

    // Remove after short delay
    setTimeout(() => removeBalloon(entry), 150);
  }

  /* ─── Particles ─── */
  function spawnParticles (el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const color = window.getComputedStyle(el).backgroundColor;

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 3 + Math.random() * 5;
      const angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5) * 0.6;
      const dist = 20 + Math.random() * 30;
      p.style.left = (cx - size / 2) + 'px';
      p.style.top = (cy - size / 2) + 'px';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = color;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.remove(); }, 500);
    }
  }

  /* ─── Remove balloon ─── */
  function removeBalloon (entry) {
    const idx = activeBalloons.indexOf(entry);
    if (idx !== -1) activeBalloons.splice(idx, 1);
    if (entry.el && entry.el.parentNode) {
      entry.el.parentNode.removeChild(entry.el);
    }
  }

  /* ─── End Round ─── */
  function endRound () {
    isRunning = false;
    stopAll();
    clearBalloons();
    startBtn.disabled = false;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(LS_KEY, String(highScore));
      bestEl.textContent = highScore;
    }

    mPopped.textContent = popped;
    mScore.textContent = score;
    mBest.textContent = highScore;
    modal.classList.add('active');
  }

  /* ─── Stop All ─── */
  function stopAll () {
    if (spawnTimerId) { clearTimeout(spawnTimerId); spawnTimerId = null; }
    if (tickTimerId) { clearInterval(tickTimerId); tickTimerId = null; }
  }

  /* ─── Clear balloons ─── */
  function clearBalloons () {
    for (const entry of activeBalloons) {
      if (entry.el && entry.el.parentNode) {
        entry.el.parentNode.removeChild(entry.el);
      }
    }
    activeBalloons = [];
  }

  /* ─── UI ─── */
  function updateUI () {
    scoreEl.textContent = score;
    multEl.textContent = '×' + multiplier;
    bestEl.textContent = highScore;
  }

  /* ─── Boot ─── */
  init();

})();
