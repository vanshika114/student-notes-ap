/* ============================================================
   GRID — Tic Tac Toe  |  app.js
   Features: 2-player + unbeatable AI (minimax), score tracking,
   win line animation, particle burst, ghost previews.
   ============================================================ */

"use strict";

// ─── State ───────────────────────────────────────────────────
const STATE = {
  board:       Array(9).fill(null),   // null | 'X' | 'O'
  current:     'X',
  mode:        'pvp',                 // 'pvp' | 'ai'
  scores:      { X: 0, O: 0, draw: 0 },
  gameOver:    false,
  aiThinking:  false,
};

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // cols
  [0,4,8],[2,4,6],           // diagonals
];

// Win line SVG coords: [x1,y1,x2,y2] in 3×3 grid space (0.5 = cell centre)
const WIN_LINE_COORDS = {
  '0,1,2': [0.5,0.5, 2.5,0.5],
  '3,4,5': [0.5,1.5, 2.5,1.5],
  '6,7,8': [0.5,2.5, 2.5,2.5],
  '0,3,6': [0.5,0.5, 0.5,2.5],
  '1,4,7': [1.5,0.5, 1.5,2.5],
  '2,5,8': [2.5,0.5, 2.5,2.5],
  '0,4,8': [0.5,0.5, 2.5,2.5],
  '2,4,6': [2.5,0.5, 0.5,2.5],
};

// ─── DOM ─────────────────────────────────────────────────────
const boardEl       = document.getElementById('board');
const winLineSvg    = document.getElementById('winLineSvg');
const winLineEl     = document.getElementById('winLine');
const turnIndicator = document.getElementById('turnIndicator');
const turnSym       = document.getElementById('turnSym');
const turnText      = document.getElementById('turnText');
const valX          = document.getElementById('valX');
const valO          = document.getElementById('valO');
const valDraw       = document.getElementById('valDraw');
const scoreBlockX   = document.getElementById('scoreX');
const scoreBlockO   = document.getElementById('scoreO');
const nameX         = document.getElementById('nameX');
const nameO         = document.getElementById('nameO');
const resultOverlay = document.getElementById('resultOverlay');
const resultSym     = document.getElementById('resultSym');
const resultLabel   = document.getElementById('resultLabel');
const resultSub     = document.getElementById('resultSub');
const resultGlitch  = document.getElementById('resultGlitch');
const nextRoundBtn  = document.getElementById('nextRoundBtn');
const resetRoundBtn = document.getElementById('resetRoundBtn');
const resetAllBtn   = document.getElementById('resetAllBtn');
const pvpBtn        = document.getElementById('pvpBtn');
const aiBtn         = document.getElementById('aiBtn');
const particleLayer = document.getElementById('particles');

// ─── Build Board UI ──────────────────────────────────────────
function buildBoard() {
  boardEl.innerHTML = '';
  winLineEl.removeAttribute('class');
  winLineEl.setAttribute('x1','0'); winLineEl.setAttribute('y1','0');
  winLineEl.setAttribute('x2','0'); winLineEl.setAttribute('y2','0');

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    // Ghost preview
    const ghost = document.createElement('span');
    ghost.className = 'ghost';
    ghost.textContent = STATE.current;
    ghost.style.color = STATE.current === 'X'
      ? 'var(--x-color)' : 'var(--o-color)';
    cell.appendChild(ghost);

    cell.addEventListener('click', () => onCellClick(i));
    boardEl.appendChild(cell);
  }
}

// ─── Render Board from State ──────────────────────────────────
function renderBoard() {
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    const val = STATE.board[i];
    // Clear old symbol
    const existing = cell.querySelector('.sym-x, .sym-o');
    if (existing) existing.remove();

    if (val) {
      cell.classList.add('taken');
      const sym = document.createElement('span');
      sym.className = val === 'X' ? 'sym-x' : 'sym-o';
      sym.textContent = val;
      cell.appendChild(sym);

      // Update ghost after placement
      const ghost = cell.querySelector('.ghost');
      if (ghost) ghost.style.display = 'none';
    }
  });

  // Update ghost text for empty cells
  cells.forEach(cell => {
    if (!cell.classList.contains('taken')) {
      const ghost = cell.querySelector('.ghost');
      if (ghost) {
        ghost.textContent = STATE.current;
        ghost.style.color = STATE.current === 'X'
          ? 'var(--x-color)' : 'var(--o-color)';
        ghost.style.display = '';
      }
    }
  });
}

// ─── Update Turn UI ───────────────────────────────────────────
function updateTurnUI() {
  const isX = STATE.current === 'X';
  turnSym.textContent = STATE.current;
  turnIndicator.className = 'turn-indicator ' + (isX ? 'turn-x' : 'turn-o');

  if (STATE.aiThinking) {
    turnText.textContent = 'AI IS THINKING…';
    turnIndicator.classList.add('thinking');
  } else {
    turnIndicator.classList.remove('thinking');
    if (STATE.mode === 'ai' && STATE.current === 'O') {
      turnText.textContent = 'AI\'S TURN';
    } else {
      const num = isX ? '1' : '2';
      turnText.textContent = `PLAYER ${num}'S TURN`;
    }
  }

  // Active score block
  scoreBlockX.classList.toggle('active-turn', isX);
  scoreBlockO.classList.toggle('active-turn', !isX);
}

// ─── Cell Click ──────────────────────────────────────────────
function onCellClick(index) {
  if (STATE.gameOver || STATE.aiThinking) return;
  if (STATE.board[index]) return;
  if (STATE.mode === 'ai' && STATE.current === 'O') return;

  placeMove(index);
}

function placeMove(index) {
  STATE.board[index] = STATE.current;
  renderBoard();

  const result = checkResult(STATE.board);

  if (result) {
    resolveGame(result);
  } else {
    STATE.current = STATE.current === 'X' ? 'O' : 'X';
    updateTurnUI();
    if (STATE.mode === 'ai' && STATE.current === 'O' && !STATE.gameOver) {
      triggerAI();
    }
  }
}

// ─── AI with Minimax ─────────────────────────────────────────
function triggerAI() {
  STATE.aiThinking = true;
  updateTurnUI();

  const delay = 400 + Math.random() * 300;
  setTimeout(() => {
    const best = getBestMove(STATE.board);
    STATE.aiThinking = false;
    placeMove(best);
  }, delay);
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMove  = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximising, alpha, beta) {
  const result = checkResult(board);
  if (result) {
    if (result.winner === 'O')   return 10 - depth;
    if (result.winner === 'X')   return depth - 10;
    if (result.isDraw)           return 0;
  }

  if (isMaximising) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// ─── Check Result ────────────────────────────────────────────
function checkResult(board) {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { isDraw: true };
  }
  return null;
}

// ─── Resolve Game ────────────────────────────────────────────
function resolveGame(result) {
  STATE.gameOver = true;

  if (result.winner) {
    STATE.scores[result.winner]++;
    updateScoreUI(result.winner);
    highlightWinCells(result.pattern);
    drawWinLine(result.pattern, result.winner);
    burstParticles(result.winner);

    setTimeout(() => {
      const isAI = STATE.mode === 'ai' && result.winner === 'O';
      showResult(
        result.winner === 'X' ? '✕' : '○',
        result.winner,
        isAI ? 'AI WINS' : `PLAYER ${result.winner === 'X' ? '1' : '2'} WINS`,
        isAI ? 'Better luck next time.' : 'Well played!'
      );
    }, 700);
  } else {
    STATE.scores.draw++;
    updateScoreUI('draw');
    setTimeout(() => {
      showResult('=', null, 'DRAW', 'No one wins this round.');
    }, 400);
  }
}

// ─── Highlight Winning Cells ──────────────────────────────────
function highlightWinCells(pattern) {
  const cells = boardEl.querySelectorAll('.cell');
  pattern.forEach(i => cells[i].classList.add('win-cell'));
}

// ─── Draw Win Line ────────────────────────────────────────────
function drawWinLine(pattern, winner) {
  const key = pattern.join(',');
  const coords = WIN_LINE_COORDS[key];
  if (!coords) return;

  const [x1, y1, x2, y2] = coords;
  winLineEl.setAttribute('x1', x1);
  winLineEl.setAttribute('y1', y1);
  winLineEl.setAttribute('x2', x2);
  winLineEl.setAttribute('y2', y2);

  const color = winner === 'X' ? 'var(--x-color)' : 'var(--o-color)';
  winLineEl.style.stroke = color;
  winLineEl.style.filter = `drop-shadow(0 0 4px ${winner === 'X' ? '#ff2d78' : '#00e5ff'})`;
  winLineEl.style.strokeDasharray = '10';
  winLineEl.style.strokeDashoffset = '10';

  // Force reflow
  winLineEl.getBoundingClientRect();
  winLineEl.classList.add('animate');
}

// ─── Update Score UI ─────────────────────────────────────────
function updateScoreUI(winner) {
  const map = { X: valX, O: valO, draw: valDraw };
  const el = map[winner];
  el.textContent = STATE.scores[winner === 'draw' ? 'draw' : winner];
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// ─── Show Result Overlay ─────────────────────────────────────
function showResult(sym, winner, label, sub) {
  resultSym.textContent = sym;
  resultSym.style.color = winner === 'X'
    ? 'var(--x-color)'
    : winner === 'O'
    ? 'var(--o-color)'
    : 'var(--draw-color)';

  if (winner) {
    const glow = winner === 'X' ? 'var(--x-glow)' : 'var(--o-glow)';
    resultSym.style.textShadow = `0 0 20px ${glow}, 0 0 50px ${glow}`;
  } else {
    resultSym.style.textShadow = `0 0 20px var(--draw-glow)`;
  }

  resultLabel.textContent = label;
  resultSub.textContent   = sub;
  resultOverlay.classList.add('visible');
}

// ─── Particle Burst ───────────────────────────────────────────
function burstParticles(winner) {
  const colors = winner === 'X'
    ? ['#ff2d78','#ff6699','#ff99bb','#ffcc44']
    : ['#00e5ff','#33eeff','#66f3ff','#99f8ff'];

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'px';
    const size  = Math.random() * 8 + 3;
    const angle = (Math.PI * 2 / 28) * i + (Math.random() - 0.5) * 0.4;
    const dist  = Math.random() * 120 + 60;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;
    const dur   = (Math.random() * 0.5 + 0.5).toFixed(2) + 's';
    const rot   = (Math.random() * 720 - 360) + 'deg';
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      left:${cx}px; top:${cy}px;
      width:${size}px; height:${size}px;
      background:${color};
      box-shadow: 0 0 6px ${color};
      --tx:${tx}px; --ty:${ty}px;
      --d:${dur}; --r:${rot};
    `;
    particleLayer.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

// ─── Reset Round ─────────────────────────────────────────────
function resetRound() {
  STATE.board    = Array(9).fill(null);
  STATE.current  = 'X';
  STATE.gameOver = false;
  STATE.aiThinking = false;
  resultOverlay.classList.remove('visible');
  buildBoard();
  updateTurnUI();
}

// ─── Reset All ───────────────────────────────────────────────
function resetAll() {
  STATE.scores = { X: 0, O: 0, draw: 0 };
  valX.textContent    = '0';
  valO.textContent    = '0';
  valDraw.textContent = '0';
  resetRound();
}

// ─── Mode Switch ─────────────────────────────────────────────
function setMode(mode) {
  STATE.mode = mode;
  pvpBtn.classList.toggle('active', mode === 'pvp');
  aiBtn.classList.toggle('active', mode === 'ai');
  nameO.textContent = mode === 'ai' ? 'AI' : 'PLAYER 2';
  resetAll();
}

// ─── Event Bindings ──────────────────────────────────────────
nextRoundBtn.addEventListener('click', resetRound);
resetRoundBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetAll);
pvpBtn.addEventListener('click', () => setMode('pvp'));
aiBtn.addEventListener('click', () => setMode('ai'));

// Close overlay on backdrop click
resultOverlay.addEventListener('click', e => {
  if (e.target === resultOverlay) resetRound();
});

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') resetRound();
  if (e.key === 'Escape') resultOverlay.classList.remove('visible');
});

// ─── Boot ────────────────────────────────────────────────────
buildBoard();
updateTurnUI();
