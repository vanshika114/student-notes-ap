/* ── SNEK — app.js ── */
"use strict";

const COLS = 20, ROWS = 20, CELL = 20;
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
canvas.width  = COLS * CELL;
canvas.height = ROWS * CELL;

const scoreEl   = document.getElementById('score');
const bestEl    = document.getElementById('best');
const levelEl   = document.getElementById('level');
const overlay   = document.getElementById('overlay');
const oTag      = document.getElementById('overlayTag');
const oTitle    = document.getElementById('overlayTitle');
const oMsg      = document.getElementById('overlayMsg');
const oScoreWrap= document.getElementById('overlayScoreWrap');
const oFinal    = document.getElementById('overlayFinalScore');

// State
let snake, dir, nextDir, food, special, score, best, level, running, paused, loop, frame;
best = +localStorage.getItem('snek_best') || 0;
bestEl.textContent = best;

const SPEEDS = [160, 140, 120, 100, 85, 70, 58, 48, 38, 30];

// Colors
const GREEN  = '#39ff14';
const GREEN2 = '#00c900';
const HEAD   = '#ffffff';
const RED    = '#ff3c3c';
const GOLD   = '#ffd700';

function init() {
  snake   = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir     = {x:1,y:0};
  nextDir = {x:1,y:0};
  score   = 0;
  level   = 1;
  frame   = 0;
  special = null;
  scoreEl.textContent = 0;
  levelEl.textContent = 1;
  spawnFood();
}

function spawnFood() {
  const empty = [];
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) {
    if(!snake.some(s=>s.x===x&&s.y===y)) empty.push({x,y});
  }
  food = empty[Math.floor(Math.random()*empty.length)];
}

function spawnSpecial() {
  if(special) return;
  const empty = [];
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) {
    if(!snake.some(s=>s.x===x&&s.y===y)&&!(food.x===x&&food.y===y)) empty.push({x,y});
  }
  special = {...empty[Math.floor(Math.random()*empty.length)], timer: 80};
}

function update() {
  dir = {...nextDir};
  const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};

  // Wall collision
  if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS) return gameOver();
  // Self collision
  if(snake.some(s=>s.x===head.x&&s.y===head.y)) return gameOver();

  snake.unshift(head);

  let ate = false;
  if(head.x===food.x&&head.y===food.y) {
    score += 10 * level;
    ate = true;
    spawnFood();
    if(score % 50 === 0 && level < 10) { level = Math.min(10, Math.floor(score/50)+1); levelEl.textContent=level; }
    if(score > 0 && score % 80 === 0) spawnSpecial();
  } else if(special && head.x===special.x&&head.y===special.y) {
    score += 50 * level;
    special = null;
    ate = true;
  } else {
    snake.pop();
  }

  if(special) { special.timer--; if(special.timer<=0) special=null; }

  if(ate) {
    scoreEl.textContent = score;
    if(score > best) { best = score; bestEl.textContent = best; localStorage.setItem('snek_best',best); }
  }
}

function draw() {
  // Background
  ctx.fillStyle = '#020502';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Grid dots
  ctx.fillStyle = 'rgba(57,255,20,0.04)';
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) {
    ctx.fillRect(x*CELL+CELL/2-0.5, y*CELL+CELL/2-0.5, 1, 1);
  }

  // Food
  const ft = (Date.now()/400);
  const pulse = 0.5 + 0.5*Math.sin(ft);
  ctx.save();
  ctx.shadowBlur = 12 + pulse*10;
  ctx.shadowColor = RED;
  ctx.fillStyle = RED;
  const fs = CELL-6 + pulse*2;
  ctx.fillRect(food.x*CELL+(CELL-fs)/2, food.y*CELL+(CELL-fs)/2, fs, fs);
  ctx.restore();

  // Special (gold)
  if(special) {
    const sp = (Date.now()/300);
    const alpha = 0.4 + 0.6*(special.timer/80);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 18;
    ctx.shadowColor = GOLD;
    ctx.fillStyle = GOLD;
    const ss = CELL-4;
    ctx.fillRect(special.x*CELL+(CELL-ss)/2, special.y*CELL+(CELL-ss)/2, ss, ss);
    // Timer bar
    ctx.fillStyle = 'rgba(255,215,0,0.3)';
    ctx.fillRect(special.x*CELL, (special.y+1)*CELL-2, CELL*(special.timer/80), 2);
    ctx.restore();
  }

  // Snake
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const ratio  = 1 - i/snake.length;
    const pad    = isHead ? 1 : 2 + (1-ratio)*2;
    const size   = CELL - pad*2;

    ctx.save();
    if(isHead) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = GREEN;
      ctx.fillStyle = HEAD;
    } else {
      ctx.shadowBlur = 8*ratio;
      ctx.shadowColor = GREEN2;
      ctx.fillStyle = `rgba(57,${Math.floor(180*ratio+40)},20,${0.5+ratio*0.5})`;
    }
    ctx.fillRect(seg.x*CELL+pad, seg.y*CELL+pad, size, size);
    ctx.restore();
  });
}

function gameLoop() {
  if(!running || paused) return;
  frame++;
  const speed = SPEEDS[Math.min(level-1, SPEEDS.length-1)];
  if(frame % Math.ceil(speed/16) === 0) update();
  draw();
  loop = requestAnimationFrame(gameLoop);
}

function startGame() {
  overlay.classList.add('hidden');
  oScoreWrap.style.display = 'none';
  init();
  running = true;
  paused  = false;
  if(loop) cancelAnimationFrame(loop);
  loop = requestAnimationFrame(gameLoop);
}

function gameOver() {
  running = false;
  cancelAnimationFrame(loop);
  draw();

  // Flash effect
  ctx.save();
  ctx.fillStyle = 'rgba(255,60,60,0.15)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();

  setTimeout(() => {
    oTag.textContent   = '[ GAME OVER ]';
    oTitle.textContent = 'DEAD';
    oMsg.textContent   = 'Press SPACE or tap to retry';
    oFinal.innerHTML   = `SCORE: ${score}<br>BEST: ${best}<br>LEVEL: ${level}`;
    oScoreWrap.style.display = 'block';
    overlay.classList.remove('hidden');
  }, 350);
}

function togglePause() {
  if(!running) return;
  paused = !paused;
  if(!paused) { loop = requestAnimationFrame(gameLoop); }
}

// Controls
const DIRS = {
  ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
  w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
  W:{x:0,y:-1}, S:{x:0,y:1}, A:{x:-1,y:0}, D:{x:1,y:0},
};

document.addEventListener('keydown', e => {
  if(e.key === ' ') {
    e.preventDefault();
    if(!running || overlay.classList.contains('hidden')===false) startGame();
    else togglePause();
    return;
  }
  const d = DIRS[e.key];
  if(d && !(d.x===-dir.x&&d.y===-dir.y)) { nextDir=d; e.preventDefault(); }
});

// D-Pad
const btns = {dUp:{x:0,y:-1},dDown:{x:0,y:1},dLeft:{x:-1,y:0},dRight:{x:1,y:0}};
Object.entries(btns).forEach(([id,d])=>{
  document.getElementById(id).addEventListener('click',()=>{
    if(!running) return;
    if(!(d.x===-dir.x&&d.y===-dir.y)) nextDir=d;
  });
});
document.getElementById('dCenter').addEventListener('click',()=>{
  if(!running || !overlay.classList.contains('hidden')) startGame();
  else togglePause();
});

// Swipe
let tx=0,ty=0;
canvas.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
canvas.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
  if(!running) return startGame();
  if(Math.abs(dx)<10&&Math.abs(dy)<10) return togglePause();
  const d=Math.abs(dx)>Math.abs(dy)
    ? (dx>0?{x:1,y:0}:{x:-1,y:0})
    : (dy>0?{x:0,y:1}:{x:0,y:-1});
  if(!(d.x===-dir.x&&d.y===-dir.y)) nextDir=d;
},{passive:true});

// Click overlay
overlay.addEventListener('click', startGame);

// Draw idle screen
init();
draw();
