/* ── Canvas Setup ── */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 480;
const H = 640;

/* ── Constants ── */

const GRAVITY = 0.45;
const JUMP_FORCE = -7.5;
const PIPE_SPEED = 2.5;
const PIPE_W = 52;
const PIPE_GAP = 150;
const PIPE_SPACING = 230;
const GROUND_H = 70;
const GROUND_Y = H - GROUND_H;
const BIRD_R = 14;
const BIRD_X = 100;

/* ── DOM Refs ── */

const scoreDisplay = document.getElementById('scoreDisplay');
const bestDisplay = document.getElementById('bestDisplay');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');
const finalBest = document.getElementById('finalBest');

/* ── State ── */

let state = 'menu'; // menu | playing | gameOver
let score = 0;
let highScore = 0;
let bird = {};
let pipes = [];
let groundScroll = 0;
let animId = null;

/* ── Bird Init ── */

function resetBird() {
  bird = {
    x: BIRD_X,
    y: H / 2,
    r: BIRD_R,
    vy: 0,
  };
}

/* ── Pipe Factory ── */

function spawnPipe() {
  const minGapY = 80;
  const maxGapY = GROUND_Y - PIPE_GAP - 80;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);
  pipes.push({
    x: W,
    gapY,
    gapH: PIPE_GAP,
    w: PIPE_W,
    scored: false,
  });
}

function initPipes() {
  pipes = [];
  spawnPipe();
}

/* ── Game Loop ── */

function loop() {
  if (state === 'playing') {
    update();
    draw();
  } else if (state === 'menu' || state === 'gameOver') {
    draw();
  }
  animId = requestAnimationFrame(loop);
}

function update() {
  bird.vy += GRAVITY;
  bird.y += bird.vy;

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= PIPE_SPEED;
    if (pipes[i].x + pipes[i].w < 0) {
      pipes.splice(i, 1);
    }
  }

  if (pipes.length === 0 || pipes[pipes.length - 1].x < W - PIPE_SPACING) {
    spawnPipe();
  }

  for (const pipe of pipes) {
    if (!pipe.scored && pipe.x + pipe.w < bird.x) {
      pipe.scored = true;
      score++;
      updateHUD();
    }
  }

  groundScroll = (groundScroll - PIPE_SPEED) % 24;

  if (checkCollision()) {
    gameOver();
  }
}

/* ── Collision ── */

function checkCollision() {
  if (bird.y + bird.r >= GROUND_Y) return true;
  if (bird.y - bird.r <= 0) return true;

  for (const pipe of pipes) {
    if (bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipe.w) {
      if (bird.y - bird.r < pipe.gapY || bird.y + bird.r > pipe.gapY + pipe.gapH) {
        return true;
      }
    }
  }

  return false;
}

/* ── Drawing ── */

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#4dc9f6');
  grad.addColorStop(0.6, '#87CEEB');
  grad.addColorStop(1, '#b8e6b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function drawGround() {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, GROUND_Y, W, GROUND_H);

  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, GROUND_Y, W, 5);

  ctx.strokeStyle = '#6B3410';
  ctx.lineWidth = 2;
  for (let x = groundScroll; x < W; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 14);
    ctx.lineTo(x + 12, GROUND_Y + 14);
    ctx.stroke();
  }

  ctx.fillStyle = '#5a2d0c';
  ctx.fillRect(0, GROUND_Y + 5, W, 3);
}

function drawPipe(pipe) {
  const capOverhang = 5;
  const capH = 22;

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(pipe.x, 0, pipe.w, pipe.gapY);
  ctx.fillRect(pipe.x, pipe.gapY + pipe.gapH, pipe.w, GROUND_Y - pipe.gapY - pipe.gapH);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(pipe.x - capOverhang, pipe.gapY - capH, pipe.w + capOverhang * 2, capH);

  const bottomCapY = pipe.gapY + pipe.gapH;
  ctx.fillRect(pipe.x - capOverhang, bottomCapY, pipe.w + capOverhang * 2, capH);

  ctx.fillStyle = '#15803d';
  ctx.fillRect(pipe.x - capOverhang, pipe.gapY - capH, pipe.w + capOverhang * 2, 3);
  ctx.fillRect(pipe.x - capOverhang, bottomCapY, pipe.w + capOverhang * 2, 3);

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(pipe.x - capOverhang, pipe.gapY - capH, 3, capH);
  ctx.fillRect(pipe.x + pipe.w + capOverhang - 3, pipe.gapY - capH, 3, capH);
  ctx.fillRect(pipe.x - capOverhang, bottomCapY, 3, capH);
  ctx.fillRect(pipe.x + pipe.w + capOverhang - 3, bottomCapY, 3, capH);
}

function drawBird() {
  const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.08));

  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(angle);

  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.ellipse(-3, 3, 8, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(4, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(5.5, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(bird.r, 0);
  ctx.lineTo(bird.r + 9, 2);
  ctx.lineTo(bird.r, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawScore() {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(String(score), W / 2, 20);
}

function draw() {
  drawBackground();
  for (const pipe of pipes) drawPipe(pipe);
  drawGround();
  drawBird();
  if (state === 'playing') drawScore();
}

/* ── Flap ── */

function flap() {
  if (state !== 'playing') return;
  bird.vy = JUMP_FORCE;
}

/* ── Session ── */

function startGame() {
  score = 0;
  resetBird();
  initPipes();
  groundScroll = 0;

  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');

  updateHUD();
  state = 'playing';
}

function gameOver() {
  state = 'gameOver';

  canvas.classList.remove('hit-flash');
  void canvas.offsetWidth;
  canvas.classList.add('hit-flash');

  if (score > highScore) {
    highScore = score;
    saveBest();
  }

  finalScore.textContent = String(score);
  finalBest.textContent = String(highScore);
  bestDisplay.textContent = String(highScore);

  setTimeout(() => {
    gameOverOverlay.classList.remove('hidden');
  }, 400);
}

/* ── HUD ── */

function updateHUD() {
  scoreDisplay.textContent = String(score);
  bestDisplay.textContent = String(highScore);
}

/* ── High Score ── */

function loadBest() {
  try {
    const v = localStorage.getItem('flappyBirdBest');
    if (v !== null) highScore = parseInt(v, 10) || 0;
  } catch (_) {}
  bestDisplay.textContent = String(highScore);
}

function saveBest() {
  try { localStorage.setItem('flappyBirdBest', String(highScore)); } catch (_) {}
}

/* ── Input ── */

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state === 'playing') {
      flap();
    }
  }

  if (e.code === 'Enter') {
    if (state === 'menu') startGame();
    else if (state === 'gameOver') startGame();
  }
});

canvas.addEventListener('click', () => {
  if (state === 'playing') {
    flap();
  } else if (state === 'menu') {
    startGame();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (state === 'playing') {
    flap();
  } else if (state === 'menu') {
    startGame();
  }
}, { passive: false });

/* ── Events ── */

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

/* ── Boot ── */

loadBest();
resetBird();
initPipes();
updateHUD();
loop();
