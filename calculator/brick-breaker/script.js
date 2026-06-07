/* ── Canvas Setup ── */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

/* ── Constants ── */

const PADDLE_W = 100;
const PADDLE_H = 14;
const BALL_R = 8;
const BRICK_GAP = 6;
const BRICK_TOP = 55;
const BRICK_W = 82;
const BRICK_H = 24;
const COLS = 8;
const BASE_ROWS = 5;
const MAX_ROWS = 9;
const PADDLE_Y = H - 36;
const BALL_STUCK_Y = PADDLE_Y - BALL_R;
const BASE_SPEED = 4;
const SPEED_PER_LEVEL = 0.35;
const MAX_LIVES = 3;

/* ── DOM Refs ── */

const scoreDisplay = document.getElementById('scoreDisplay');
const highDisplay = document.getElementById('highDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const startOverlay = document.getElementById('startOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelOverlay = document.getElementById('levelOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const levelMsg = document.getElementById('levelMsg');
const finalScore = document.getElementById('finalScore');
const finalHigh = document.getElementById('finalHigh');
const finalLevel = document.getElementById('finalLevel');

/* ── Game State ── */

let state = 'menu';  // menu | playing | paused | levelClear | gameOver
let score = 0;
let highScore = 0;
let lives = MAX_LIVES;
let level = 1;
let animId = null;
let paddleDx = 0;

/* ── Objects ── */

const paddle = { x: W / 2 - PADDLE_W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };

const ball = {
  x: W / 2, y: BALL_STUCK_Y, r: BALL_R,
  dx: BASE_SPEED, dy: -BASE_SPEED,
  stuck: true, speed: BASE_SPEED,
};

let bricks = [];

/* ── Brick Helpers ── */

function brickRows() {
  return Math.min(BASE_ROWS + level - 1, MAX_ROWS);
}

function brickLeft() {
  const totalW = COLS * BRICK_W + (COLS - 1) * BRICK_GAP;
  return (W - totalW) / 2;
}

function brickDura(row) {
  if (level <= 2) return row < 3 ? 1 : 2;
  if (level <= 4) return row < 2 ? 1 : row < 5 ? 2 : 3;
  return row < 2 ? 1 : row < 5 ? 2 : 3;
}

function brickColor(durability) {
  if (durability === 3) return { fill: '#ef4444', stroke: '#dc2626', glow: 'rgba(239,68,68,0.4)' };
  if (durability === 2) return { fill: '#3b82f6', stroke: '#2563eb', glow: 'rgba(59,130,246,0.4)' };
  return { fill: '#eab308', stroke: '#ca8a04', glow: 'rgba(234,179,8,0.4)' };
}

/* ── Brick Grid ── */

function buildBricks() {
  const rows = brickRows();
  const left = brickLeft();
  bricks = [];
  for (let r = 0; r < rows; r++) {
    bricks[r] = [];
    for (let c = 0; c < COLS; c++) {
      const dur = brickDura(r);
      bricks[r][c] = {
        x: left + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W, h: BRICK_H,
        alive: true,
        durability: dur, maxDur: dur,
      };
    }
  }
}

/* ── Ball / Paddle Reset ── */

function resetPositions() {
  paddle.x = W / 2 - PADDLE_W / 2;
  ball.x = W / 2;
  ball.y = BALL_STUCK_Y;
  ball.dx = ball.speed;
  ball.dy = -ball.speed;
  ball.stuck = true;
  paddleDx = 0;
}

/* ── Collisions ── */

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  return cx + cr > rx && cx - cr < rx + rw && cy + cr > ry && cy - cr < ry + rh;
}

function collidePaddle() {
  if (ball.dy <= 0) return;
  if (!circleRect(ball.x, ball.y, ball.r, paddle.x, paddle.y, paddle.w, paddle.h)) return;

  const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
  const angle = hit * Math.PI * 0.38;
  const spd = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  ball.dx = spd * Math.sin(angle);
  ball.dy = -spd * Math.cos(angle);
  ball.y = paddle.y - ball.r;
}

function collideBricks() {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (!b.alive) continue;
      if (!circleRect(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h)) continue;

      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const dx = ball.x - cx, dy = ball.y - cy;
      const ox = b.w / 2 + ball.r - Math.abs(dx);
      const oy = b.h / 2 + ball.r - Math.abs(dy);

      if (ox < oy) ball.dx = -ball.dx;
      else ball.dy = -ball.dy;

      b.durability--;
      if (b.durability <= 0) {
        b.alive = false;
        score += 10 * level;
      }
      return;
    }
  }
}

/* ── Update ── */

function update() {
  paddle.x += paddleDx;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  if (ball.stuck) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = BALL_STUCK_Y;
    return;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.dx = Math.abs(ball.dx); }
  if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.dx = -Math.abs(ball.dx); }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.dy = Math.abs(ball.dy); }

  if (ball.y + ball.r > H) { loseLife(); return; }

  collidePaddle();
  collideBricks();

  if (allDead()) {
    state = 'levelClear';
    level++;
    updateHUD();
    levelMsg.textContent = `Preparing level ${level}...`;
    showOverlay(levelOverlay);
  }
}

function allDead() {
  for (let r = 0; r < bricks.length; r++)
    for (let c = 0; c < bricks[r].length; c++)
      if (bricks[r][c].alive) return false;
  return true;
}

/* ── Draw ── */

function draw() {
  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (!b.alive) continue;
      const clr = brickColor(b.durability);
      ctx.fillStyle = clr.fill;
      ctx.shadowColor = clr.glow;
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;
      if (b.durability < b.maxDur) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 3);
      }
    }
  }

  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 3);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.shadowColor = '#fafafa';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* ── Game Loop ── */

function loop() {
  if (state === 'playing') {
    update();
    draw();
  }
  animId = requestAnimationFrame(loop);
}

/* ── Lives & Game Over ── */

function loseLife() {
  lives--;
  if (lives <= 0) {
    state = 'gameOver';
    if (score > highScore) { highScore = score; saveHigh(); }
    finalScore.textContent = String(score);
    finalHigh.textContent = String(highScore);
    finalLevel.textContent = String(level);
    updateHUD();
    showOverlay(gameOverOverlay);
  } else {
    resetPositions();
    updateHUD();
  }
}

/* ── Level Progression ── */

function goNextLevel() {
  ball.speed = BASE_SPEED + (level - 1) * SPEED_PER_LEVEL;
  resetPositions();
  buildBricks();
  state = 'playing';
  hideAllOverlays();
  updateHUD();
}

/* ── HUD ── */

function updateHUD() {
  scoreDisplay.textContent = String(score);
  highDisplay.textContent = String(highScore);
  livesDisplay.textContent = String(lives);
  levelDisplay.textContent = String(level);
}

/* ── Overlay Helpers ── */

function hideAllOverlays() {
  startOverlay.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
  levelOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
}

function showOverlay(el) {
  hideAllOverlays();
  el.classList.remove('hidden');
}

/* ── Game Start / Restart ── */

function startGame() {
  score = 0;
  lives = MAX_LIVES;
  level = 1;
  ball.speed = BASE_SPEED;
  buildBricks();
  resetPositions();
  state = 'playing';
  hideAllOverlays();
  updateHUD();
}

/* ── Input ── */

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') { paddleDx = -6; e.preventDefault(); }
  if (e.key === 'ArrowRight' || e.key === 'd') { paddleDx = 6; e.preventDefault(); }

  if (e.key === ' ' && state === 'playing' && ball.stuck) {
    ball.stuck = false;
    e.preventDefault();
  }

  if ((e.key === 'p' || e.key === 'P') && (state === 'playing' || state === 'paused')) {
    state = state === 'playing' ? 'paused' : 'playing';
    if (state === 'paused') showOverlay(pauseOverlay);
    else hideAllOverlays();
  }

  if (e.key === 'Enter') {
    if (state === 'menu') startGame();
    else if (state === 'levelClear') goNextLevel();
    else if (state === 'gameOver') startGame();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
    paddleDx = 0;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (state !== 'playing' && state !== 'paused') return;
  const rect = canvas.getBoundingClientRect();
  const sx = W / rect.width;
  const mx = (e.clientX - rect.left) * sx;
  paddle.x = Math.max(0, Math.min(W - paddle.w, mx - paddle.w / 2));
  if (ball.stuck) ball.x = paddle.x + paddle.w / 2;
});

canvas.addEventListener('click', () => {
  if (state === 'playing' && ball.stuck) ball.stuck = false;
});

/* ── High Score ── */

function loadHigh() {
  try {
    const v = localStorage.getItem('brickBreakerHigh');
    if (v !== null) highScore = parseInt(v, 10) || 0;
  } catch (_) {}
}

function saveHigh() {
  try { localStorage.setItem('brickBreakerHigh', String(highScore)); } catch (_) {}
}

/* ── Boot ── */

loadHigh();
updateHUD();
buildBricks();
draw();
loop();
