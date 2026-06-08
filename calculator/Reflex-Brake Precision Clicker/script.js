/* ═══════════════════════════════════════════════════════
   Reflex-Brake Precision Clicker — Game Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Constants ───
  const HIGH_SCORE_KEY = 'reflexBrakeHigh';
  const BASE_INTERVAL = 1200;     // ms — slowest spawn rate
  const MIN_INTERVAL = 400;       // ms — fastest spawn rate
  const NODE_LIFETIME = 900;      // ms — how long a node stays active
  const GO_WEIGHT = 0.8;          // 80% GO, 20% STOP
  const POINTS_GO = 10;
  const PENALTY_STOP = 5;
  const SCORE_PER_INTERVAL_STEP = 100; // every 100 score, reduce interval

  // ─── State ───
  let score = 0;
  let multiplier = 1;
  let highScore = 0;
  let round = 1;
  let isRunning = false;
  let activeIndex = null;          // currently highlighted cell index
  let activeType = null;           // 'go' | 'stop'
  let spawnTimer = null;
  let lifetimeTimer = null;
  let totalGOs = 0;

  // ─── DOM ───
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.score = $('#score');
    dom.multiplier = $('#multiplier');
    dom.highScore = $('#high-score');
    dom.round = $('#round');
    dom.grid = $('#grid');
    dom.cells = $$('.cell');
    dom.btnStart = $('#btn-start');
    dom.btnReset = $('#btn-reset');
    dom.screenFlash = $('#screen-flash');
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

  // ─── Helpers ───
  function getSpawnInterval() {
    // Decrease interval as score increases
    const reduction = Math.floor(score / SCORE_PER_INTERVAL_STEP) * 80;
    return Math.max(MIN_INTERVAL, BASE_INTERVAL - reduction);
  }

  function getRandomCell() {
    return Math.floor(Math.random() * 9);
  }

  function pickType() {
    return Math.random() < GO_WEIGHT ? 'go' : 'stop';
  }

  function getCell(index) {
    return dom.grid.querySelector(`[data-index="${index}"]`);
  }

  function clearAllCells() {
    dom.cells.forEach((c) => {
      c.classList.remove('go', 'stop', 'hit', 'expired');
      c.classList.add('locked');
    });
  }

  function unlockCells() {
    dom.cells.forEach((c) => {
      c.classList.remove('locked');
    });
  }

  // ─── Cleanup active node ───
  function cleanupActive() {
    if (lifetimeTimer) {
      clearTimeout(lifetimeTimer);
      lifetimeTimer = null;
    }
    if (activeIndex !== null) {
      const cell = getCell(activeIndex);
      if (cell) {
        cell.classList.remove('go', 'stop', 'hit');
      }
      activeIndex = null;
      activeType = null;
    }
  }

  // ─── Flash penalty ───
  function flashPenalty() {
    dom.screenFlash.classList.add('active');
    setTimeout(() => dom.screenFlash.classList.remove('active'), 120);
  }

  // ─── Spawn node ───
  function spawn() {
    if (!isRunning) return;

    cleanupActive();

    const idx = getRandomCell();
    const type = pickType();
    const cell = getCell(idx);
    if (!cell) { scheduleSpawn(); return; }

    activeIndex = idx;
    activeType = type;
    cell.classList.add(type);
    cell.classList.remove('locked');

    // Node lifetime — miss it and face penalty
    lifetimeTimer = setTimeout(() => {
      if (activeIndex === idx && isRunning) {
        // Missed a GO or STOP auto-pass (no penalty for missing STOP)
        if (type === 'go') {
          // Missed GO — penalty
          multiplier = 1;
          flashPenalty();
          dom.multiplier.textContent = '×1';
        }
        // Missed STOP — no penalty, just cleanup
        cleanupActive();
        totalGOs = 0;
        scheduleSpawn();
      }
    }, NODE_LIFETIME);

    scheduleSpawn();
  }

  function scheduleSpawn() {
    if (!isRunning) return;
    const delay = getSpawnInterval();
    spawnTimer = setTimeout(spawn, delay);
  }

  // ─── Handle click ───
  function handleCellClick(index) {
    if (!isRunning) return;
    if (index !== activeIndex) return;

    const cell = getCell(index);
    if (!cell) return;
    if (!cell.classList.contains('go') && !cell.classList.contains('stop')) return;

    if (activeType === 'go') {
      // Correct GO click
      const pts = POINTS_GO * multiplier;
      score += pts;
      totalGOs++;
      multiplier = Math.min(10, multiplier + 1);
      dom.multiplier.textContent = `×${multiplier}`;

      cell.classList.remove('go');
      cell.classList.add('hit');
      setTimeout(() => cell.classList.remove('hit'), 200);
    } else {
      // Wrong STOP click — penalty
      score = Math.max(0, score - PENALTY_STOP * multiplier);
      multiplier = 1;
      dom.multiplier.textContent = '×1';
      flashPenalty();

      cell.classList.remove('stop');
      cell.classList.add('hit');
      setTimeout(() => cell.classList.remove('hit'), 200);
    }

    dom.score.textContent = score;

    // Update high score
    if (score > highScore) {
      highScore = score;
      saveHigh();
      dom.highScore.textContent = highScore;
    }

    cleanupActive();
  }

  // ─── Start / Stop ───
  function startGame() {
    if (isRunning) return;

    // Clean any stale state
    stopGame();
    clearAllCells();

    isRunning = true;
    dom.btnStart.disabled = true;
    dom.btnStart.textContent = '● Running';
    unlockCells();

    spawn();
  }

  function stopGame() {
    isRunning = false;
    if (spawnTimer) {
      clearTimeout(spawnTimer);
      spawnTimer = null;
    }
    cleanupActive();
    dom.btnStart.disabled = false;
    dom.btnStart.textContent = '▶ Start Test';
    clearAllCells();
    unlockCells();
  }

  // ─── Reset ───
  function resetGame() {
    stopGame();
    score = 0;
    multiplier = 1;
    round = 1;
    totalGOs = 0;
    dom.score.textContent = '0';
    dom.multiplier.textContent = '×1';
    dom.round.textContent = '1';
    if (highScore === 0) {
      dom.highScore.textContent = '0';
    }
    clearAllCells();
    unlockCells();
  }

  // ─── Events ───
  function setupEvents() {
    dom.grid.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      handleCellClick(parseInt(cell.dataset.index, 10));
    });

    dom.btnStart.addEventListener('click', startGame);
    dom.btnReset.addEventListener('click', resetGame);
  }

  // ─── Init ───
  function init() {
    cacheDom();
    loadHigh();
    dom.highScore.textContent = highScore;
    clearAllCells();
    unlockCells();
    setupEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
