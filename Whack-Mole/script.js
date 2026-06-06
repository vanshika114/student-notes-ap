/* ═══════════════════════════════════════════════════════
   Whack-Mole — Game Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM refs ─── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const gridEl = $('#grid');
  const holeEls = $$('.hole');
  const pointsEl = $('#points');
  const comboEl = $('#combo');
  const timerBarEl = $('#timer-bar');
  const highScoreEl = $('#high-score');
  const startBtn = $('#btn-start');
  const gameOverEl = $('#game-over');
  const goScoreEl = $('#go-score');
  const goBestEl = $('#go-best');
  const restartBtn = $('#btn-restart');
  const floatContainer = $('#float-container');

  /* ─── Constants ─── */
  const ROUND_DURATION = 30;           // seconds
  const BASE_VISIBILITY = 1000;        // ms
  const MIN_VISIBILITY = 400;          // ms
  const VISIBILITY_DECAY = 50;         // ms per 50 pts
  const DECAY_STEP = 50;               // points threshold
  const BASE_SPAWN_INTERVAL = 1100;    // ms between spawns
  const POINTS_PER_HIT = 10;

  /* ─── State ─── */
  let points = 0;
  let combo = 1;
  let highScore = 0;
  let timeLeft = ROUND_DURATION;
  let isRunning = false;
  let activeIndex = -1;                // -1 = no mole active
  let spawnTimerId = null;
  let hideTimerId = null;
  let tickTimerId = null;
  let spawnLagId = null;
  let moleTouched = false;             // was current mole hit?

  /* ─── Init ─── */
  function init () {
    highScore = parseInt(localStorage.getItem('wm_high_score') || '0', 10);
    highScoreEl.textContent = highScore;
    attachEvents();
  }

  /* ─── Events ─── */
  function attachEvents () {
    startBtn.addEventListener('click', startRound);
    restartBtn.addEventListener('click', () => { gameOverEl.classList.remove('active'); startRound(); });

    // Delegate clicks on grid
    gridEl.addEventListener('click', (e) => {
      if (!isRunning) return;
      const hole = e.target.closest('.hole');
      if (!hole) return;
      const idx = parseInt(hole.dataset.index, 10);

      if (activeIndex === idx && !moleTouched) {
        whack(idx, hole);
      } else if (activeIndex !== idx) {
        miss(hole);
      }
    });

    // Touch support
    gridEl.addEventListener('touchstart', (e) => {
      if (!isRunning) return;
      const hole = e.target.closest('.hole');
      if (!hole) return;
      const idx = parseInt(hole.dataset.index, 10);

      if (activeIndex === idx && !moleTouched) {
        whack(idx, hole);
      } else if (activeIndex !== idx) {
        miss(hole);
      }
    }, { passive: true });
  }

  /* ─── Start Round ─── */
  function startRound () {
    // Clean up any previous round
    stopAll();
    resetHoles();

    points = 0;
    combo = 1;
    timeLeft = ROUND_DURATION;
    isRunning = true;
    activeIndex = -1;
    moleTouched = false;

    updateUI();
    timerBarEl.style.width = '100%';
    timerBarEl.classList.remove('danger');
    startBtn.disabled = true;

    // Start timer tick
    tickTimerId = setInterval(timerTick, 100);

    // First spawn after short delay
    spawnLagId = setTimeout(spawnMole, 400);
  }

  /* ─── Timer ─── */
  function timerTick () {
    if (!isRunning) return;
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      endGame();
      return;
    }
    const pct = (timeLeft / ROUND_DURATION) * 100;
    timerBarEl.style.width = pct + '%';
    if (pct <= 20) timerBarEl.classList.add('danger');
  }

  /* ─── Spawn Mole ─── */
  function spawnMole () {
    if (!isRunning) return;

    // Pick random hole, different from current
    let idx;
    do {
      idx = Math.floor(Math.random() * 9);
    } while (idx === activeIndex && activeIndex !== -1);

    // Make sure hole doesn't already have a mole
    const hole = holeEls[idx];
    let mole = hole.querySelector('.mole');
    if (!mole) {
      mole = document.createElement('div');
      mole.className = 'mole';
      mole.textContent = '🐭';
      hole.appendChild(mole);
    }

    // Remove any stale hit flag
    mole.classList.remove('hit');
    mole.classList.add('up');
    activeIndex = idx;
    moleTouched = false;

    // Compute visibility duration
    const steps = Math.floor(points / DECAY_STEP);
    const visibility = Math.max(MIN_VISIBILITY, BASE_VISIBILITY - steps * VISIBILITY_DECAY);

    // Schedule hide
    if (hideTimerId) clearTimeout(hideTimerId);
    hideTimerId = setTimeout(() => {
      hideMole(false);
    }, visibility);

    // Schedule next spawn
    const spawnDelay = BASE_SPAWN_INTERVAL + Math.random() * 300;
    if (spawnTimerId) clearTimeout(spawnTimerId);
    spawnTimerId = setTimeout(spawnMole, spawnDelay);
  }

  /* ─── Hide Mole ─── */
  function hideMole (wasHit) {
    if (activeIndex === -1) return;
    const hole = holeEls[activeIndex];
    const mole = hole.querySelector('.mole');
    if (mole) {
      mole.classList.remove('up', 'hit');
      // If missed (not hit and not touched), no penalty
    }
    activeIndex = -1;
    moleTouched = false;
  }

  /* ─── Whack! ─── */
  function whack (idx, hole) {
    const mole = hole.querySelector('.mole');
    if (!mole) return;
    if (moleTouched) return;            // already hit this frame

    moleTouched = true;
    mole.classList.remove('up');
    mole.classList.add('hit');

    // Score
    const earned = POINTS_PER_HIT * combo;
    points += earned;
    combo += 1;
    updateUI();

    // Floating text
    spawnFloatText(hole, `+${earned}  ×${combo - 1}`);

    // Hide with small delay for hit animation
    setTimeout(() => {
      const m = hole.querySelector('.mole');
      if (m) {
        m.classList.remove('hit');
        m.classList.remove('up');
        // Quickly pop back down
      }
      if (activeIndex === idx) {
        activeIndex = -1;
        moleTouched = false;
      }
    }, 150);
  }

  /* ─── Miss ─── */
  function miss (hole) {
    if (!isRunning) return;
    // If mole is active on another hole, missed click = combo reset
    combo = 1;
    updateUI();
    hole.classList.remove('shake');
    // Force reflow
    void hole.offsetWidth;
    hole.classList.add('shake');
    spawnFloatText(hole, 'Miss!', '#ef4444');
  }

  /* ─── End Game ─── */
  function endGame () {
    isRunning = false;
    stopAll();
    hideMole(false);
    startBtn.disabled = false;

    // Persist high score
    if (points > highScore) {
      highScore = points;
      localStorage.setItem('wm_high_score', String(highScore));
      highScoreEl.textContent = highScore;
    }

    // Show modal
    goScoreEl.textContent = points;
    goBestEl.textContent = highScore;
    gameOverEl.classList.add('active');
  }

  /* ─── Stop All Timers ─── */
  function stopAll () {
    if (spawnTimerId) { clearTimeout(spawnTimerId); spawnTimerId = null; }
    if (hideTimerId) { clearTimeout(hideTimerId); hideTimerId = null; }
    if (tickTimerId) { clearInterval(tickTimerId); tickTimerId = null; }
    if (spawnLagId) { clearTimeout(spawnLagId); spawnLagId = null; }
  }

  /* ─── Reset Holes ─── */
  function resetHoles () {
    holeEls.forEach((h) => {
      const m = h.querySelector('.mole');
      if (m) m.remove();
      h.classList.remove('shake');
    });
    activeIndex = -1;
    moleTouched = false;
  }

  /* ─── Update UI ─── */
  function updateUI () {
    pointsEl.textContent = points;
    comboEl.textContent = `×${combo}`;
  }

  /* ─── Floating Text ─── */
  function spawnFloatText (anchor, text, color) {
    const rect = anchor.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'float-text';
    if (color) el.style.color = color;
    el.textContent = text;
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = (rect.top + window.scrollY) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  /* ─── Boot ─── */
  init();

})();
