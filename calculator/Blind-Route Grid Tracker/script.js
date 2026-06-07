/* ═══════════════════════════════════════════════════════
   Blind-Route Grid Tracker — Game Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Constants ───
  const GRID_SIZE = 5;
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
  const FLASH_INTERVAL = 200; // ms per flash step (2s total / pathLength)
  const BEST_KEY = 'blindRouteBest';

  // ─── State ───
  let level = 1;
  let best = 0;
  let path = [];
  let obstacles = [];
  let userInput = [];
  let phase = 'idle'; // idle | flash | recall | result
  let flashTimer = null;

  // ─── DOM ───
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.level = $('#level');
    dom.best = $('#best');
    dom.status = $('#status');
    dom.grid = $('#grid');
    dom.btnStart = $('#btn-start');
    dom.btnReset = $('#btn-reset');
  }

  // ─── Storage ───
  function loadBest() {
    try {
      const v = localStorage.getItem(BEST_KEY);
      if (v) best = parseInt(v, 10) || 0;
    } catch { best = 0; }
  }

  function saveBest() {
    try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* ignore */ }
  }

  // ─── Helpers ───
  function idx(row, col) { return row * GRID_SIZE + col; }
  function rowOf(i) { return Math.floor(i / GRID_SIZE); }
  function colOf(i) { return i % GRID_SIZE; }

  function areAdjacent(a, b) {
    const r1 = rowOf(a), c1 = colOf(a);
    const r2 = rowOf(b), c2 = colOf(b);
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // ─── Obstacle Generator (Level 5+) ───
  function generateObstacles() {
    obstacles = [];
    if (level < 5) return;
    const count = 2;
    const available = [];
    for (let i = 0; i < TOTAL_CELLS; i++) available.push(i);
    // Shuffle and pick
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    obstacles = available.slice(0, count);
  }

  // ─── Path Generator ───
  function generatePath() {
    const length = level + 2; // Level 1 → 3 tiles, Level 2 → 4, etc.
    const pathCells = [];

    // Pick random start (not on obstacle)
    let start;
    do {
      start = Math.floor(Math.random() * TOTAL_CELLS);
    } while (obstacles.includes(start));
    pathCells.push(start);

    while (pathCells.length < length) {
      const last = pathCells[pathCells.length - 1];
      const r = rowOf(last), c = colOf(last);
      const neighbors = [];
      if (r > 0) neighbors.push(idx(r - 1, c));
      if (r < GRID_SIZE - 1) neighbors.push(idx(r + 1, c));
      if (c > 0) neighbors.push(idx(r, c - 1));
      if (c < GRID_SIZE - 1) neighbors.push(idx(r, c + 1));

      // Filter out obstacles and already-used cells
      const valid = neighbors.filter(
        (n) => !obstacles.includes(n) && !pathCells.includes(n)
      );

      if (valid.length === 0) {
        // Dead end — restart
        pathCells.length = 0;
        do { start = Math.floor(Math.random() * TOTAL_CELLS); }
        while (obstacles.includes(start));
        pathCells.push(start);
        continue;
      }

      const next = valid[Math.floor(Math.random() * valid.length)];
      pathCells.push(next);
    }

    return pathCells;
  }

  // ─── Render Grid ───
  function renderGrid() {
    dom.grid.innerHTML = '';
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.index = i;
      if (obstacles.includes(i)) tile.classList.add('obstacle', 'locked');
      dom.grid.appendChild(tile);
    }
  }

  function getTile(index) {
    return dom.grid.querySelector(`[data-index="${index}"]`);
  }

  function resetTiles() {
    dom.grid.querySelectorAll('.tile').forEach((t) => {
      t.className = 'tile';
      const i = parseInt(t.dataset.index, 10);
      if (obstacles.includes(i)) t.classList.add('obstacle', 'locked');
    });
  }

  // ─── Set Phase ───
  function setPhase(p) {
    phase = p;
    dom.btnStart.disabled = (p === 'flash' || p === 'recall');
  }

  // ─── Flash Phase ───
  function runFlash() {
    setPhase('flash');
    dom.status.textContent = 'Watch the path...';
    dom.status.className = 'status-msg flash';
    resetTiles();

    // Lock all tiles during flash
    dom.grid.querySelectorAll('.tile').forEach((t) => t.classList.add('flash-locked'));

    let step = 0;
    const totalSteps = path.length;
    const interval = Math.max(60, Math.floor(2000 / totalSteps));

    flashTimer = setInterval(() => {
      // Clear previous
      dom.grid.querySelectorAll('.tile.flash').forEach((t) => t.classList.remove('flash'));

      if (step >= totalSteps) {
        clearInterval(flashTimer);
        flashTimer = null;
        // Unlock tiles and start recall
        dom.grid.querySelectorAll('.tile').forEach((t) => {
          t.classList.remove('flash-locked');
        });
        startRecall();
        return;
      }

      const tile = getTile(path[step]);
      if (tile && !tile.classList.contains('obstacle')) {
        tile.classList.add('flash');
      }
      step++;
    }, interval);
  }

  // ─── Recall Phase ───
  function startRecall() {
    setPhase('recall');
    dom.status.textContent = 'Repeat the path';
    dom.status.className = 'status-msg recall';
    userInput = [];
  }

  // ─── Handle Tile Click ───
  function handleTileClick(index) {
    if (phase !== 'recall') return;
    if (obstacles.includes(index)) return;

    const tile = getTile(index);
    if (!tile || tile.classList.contains('correct') || tile.classList.contains('wrong')) return;

    const expected = path[userInput.length];

    if (index === expected) {
      // Correct
      tile.classList.remove('flash');
      tile.classList.add('correct');
      userInput.push(index);

      if (userInput.length === path.length) {
        // Level complete
        setPhase('result');
        dom.status.textContent = '✓ Level clear!';
        dom.status.className = 'status-msg recall';
        dom.btnStart.disabled = false;

        if (level > best) {
          best = level;
          saveBest();
          dom.best.textContent = best;
        }

        level++;
        dom.level.textContent = level;
      }
    } else {
      // Wrong
      tile.classList.remove('flash');
      tile.classList.add('wrong');
      setPhase('result');
      dom.status.textContent = '✕ Wrong tile!';
      dom.status.className = 'status-msg wrong';

      // Reveal correct path as learning guide
      path.forEach((i, idx) => {
        const t = getTile(i);
        if (t) {
          if (idx < userInput.length) {
            t.classList.add('correct');
          } else {
            t.classList.add('path-reveal');
          }
        }
      });

      // Flash the tile that should have been clicked
      const missed = getTile(expected);
      if (missed) {
        missed.classList.add('wrong');
        setTimeout(() => missed.classList.remove('wrong'), 600);
      }

      dom.btnStart.disabled = false;
    }
  }

  // ─── Start Round ───
  function startRound() {
    if (flashTimer) {
      clearInterval(flashTimer);
      flashTimer = null;
    }

    generateObstacles();
    path = generatePath();
    userInput = [];
    renderGrid();
    resetTiles();
    dom.status.textContent = '';

    runFlash();
  }

  // ─── Reset Game ───
  function resetGame() {
    if (flashTimer) {
      clearInterval(flashTimer);
      flashTimer = null;
    }
    level = 1;
    obstacles = [];
    path = [];
    userInput = [];
    phase = 'idle';
    dom.level.textContent = level;
    dom.best.textContent = best;
    dom.status.textContent = 'Press Start';
    dom.status.className = 'status-msg';
    dom.btnStart.disabled = false;
    renderGrid();
    resetTiles();
  }

  // ─── Events ───
  function setupEvents() {
    dom.grid.addEventListener('click', (e) => {
      const tile = e.target.closest('.tile');
      if (!tile) return;
      handleTileClick(parseInt(tile.dataset.index, 10));
    });

    dom.btnStart.addEventListener('click', startRound);
    dom.btnReset.addEventListener('click', resetGame);
  }

  // ─── Init ───
  function init() {
    cacheDom();
    loadBest();
    dom.best.textContent = best;
    renderGrid();
    setupEvents();
    dom.status.textContent = 'Press Start';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
