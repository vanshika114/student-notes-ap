const grid = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const difficultyEl = document.getElementById('difficulty');

let lastHole;
let timeUp = false;
let score = 0;
let gameTime = 30; // seconds default
let countdownInterval;
let peepTimeout;
let activeMoleTimeout;
let activeRound = 0;

const DIFFICULTY = {
  easy: { min: 900, max: 1400 },
  medium: { min: 500, max: 1100 },
  hard: { min: 280, max: 700 }
};

// create 9 holes
const HOLE_COUNT = 9;
for(let i=0;i<HOLE_COUNT;i++){
  const hole = document.createElement('div');
  hole.className = 'hole';

  const mole = document.createElement('div');
  mole.className = 'mole';
  mole.innerHTML = `
    <span class="ear left"></span>
    <span class="ear right"></span>
    <span class="body"></span>
    <span class="eye left"></span>
    <span class="eye right"></span>
    <span class="nose"></span>
    <span class="whisker left"></span>
    <span class="whisker right"></span>
  `;
  hole.appendChild(mole);
  grid.appendChild(hole);
}
const holes = Array.from(document.querySelectorAll('.hole'));

function randomTime(min,max){ return Math.round(Math.random()*(max-min)+min); }
function randomHole(){
  const idx = Math.floor(Math.random()*holes.length);
  const hole = holes[idx];
  if(hole === lastHole) return randomHole();
  lastHole = hole;
  return hole;
}

function peep(){
  const diff = DIFFICULTY[difficultyEl ? difficultyEl.value : 'medium'] || DIFFICULTY.medium;
  const time = randomTime(diff.min, diff.max);
  const hole = randomHole();
  const mole = hole.querySelector('.mole');

  hole.classList.add('up');
  if(mole){
    mole.classList.remove('pop');
    // force reflow
    void mole.offsetWidth;
    mole.classList.add('pop');
  }
  clearTimeout(activeMoleTimeout);
  activeMoleTimeout = setTimeout(()=>{
    hole.classList.remove('up');
    if(!timeUp) peep();
  }, time);
}

function startGame(){
  resetGameState();
  activeRound += 1;
  score = 0; scoreEl.textContent = score;
  timeEl.textContent = gameTime;
  timeUp = false;
  peep();
  // countdown
  let timeLeft = gameTime;
  countdownInterval = setInterval(()=>{
    timeLeft -= 1;
    timeEl.textContent = timeLeft;
    if(timeLeft <= 0){
      clearInterval(countdownInterval);
      timeUp = true;
      clearTimeout(peepTimeout);
      clearTimeout(activeMoleTimeout);
      // ensure all holes closed
      holes.forEach(h=>h.classList.remove('up'));
      startBtn.disabled = false;
    }
  },1000);
  startBtn.disabled = true;
}

function resetGameState(){
  clearInterval(countdownInterval);
  clearTimeout(peepTimeout);
  clearTimeout(activeMoleTimeout);
  holes.forEach(h=>h.classList.remove('up'));
  startBtn.disabled = false;
  score = 0; scoreEl.textContent = score;
  timeEl.textContent = gameTime;
}

// mole click handler
holes.forEach(hole => {
  hole.addEventListener('click', (e)=>{
    if(!hole.classList.contains('up')) return;
    score += 1;
    scoreEl.textContent = score;
    // playful feedback
    const mole = hole.querySelector('.mole');
    if(mole){
      mole.classList.add('caught');
      setTimeout(()=>{ mole.classList.remove('caught'); }, 140);
    }
    hole.classList.remove('up');
  });
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGameState);
// allow difficulty change while idle
if(difficultyEl){
  difficultyEl.addEventListener('change', ()=>{
    // small visual cue: flash timer
    timeEl.style.transition = 'transform 120ms';
    timeEl.style.transform = 'scale(1.06)';
    setTimeout(()=> timeEl.style.transform = '', 140);
  });
}

