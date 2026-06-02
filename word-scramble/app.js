/* ── LEXIS — app.js ── */
"use strict";

const WORDS = [
  {word:"JOURNEY",  hint:"A long trip"},
  {word:"BRIDGE",   hint:"Connects two sides"},
  {word:"CURIOUS",  hint:"Eager to learn"},
  {word:"PLANET",   hint:"Orbits a star"},
  {word:"WINTER",   hint:"Coldest season"},
  {word:"BLANKET",  hint:"Keeps you warm"},
  {word:"MIRROR",   hint:"Shows your reflection"},
  {word:"FOREST",   hint:"Many trees together"},
  {word:"THUNDER",  hint:"Loud storm sound"},
  {word:"CANDLE",   hint:"Wax with a flame"},
  {word:"DIAMOND",  hint:"Hardest natural gemstone"},
  {word:"COMPASS",  hint:"Navigation tool"},
  {word:"LANTERN",  hint:"Portable light source"},
  {word:"MARBLE",   hint:"Smooth swirling stone"},
  {word:"FALCON",   hint:"A fast hunting bird"},
  {word:"GLACIER",  hint:"Slow-moving ice mass"},
  {word:"HORIZON",  hint:"Where sky meets earth"},
  {word:"LABYRINTH",hint:"A complex maze"},
  {word:"PHANTOM",  hint:"A ghost or spirit"},
  {word:"CRIMSON",  hint:"A deep shade of red"},
];

const TOTAL_ROUNDS = 10;
const TIME_PER_ROUND = 15;

let pool, roundIdx, score, correctCount, hintUsed;
let currentWord, scrambled, selectedTiles, timerInterval, timeLeft;

// DOM
const scrambleWordEl = document.getElementById('scrambleWord');
const hintTextEl     = document.getElementById('hintText');
const tilesInputEl   = document.getElementById('tilesInput');
const answerSlotsEl  = document.getElementById('answerSlots');
const feedbackEl     = document.getElementById('feedback');
const timerFillEl    = document.getElementById('timerFill');
const timeLeftEl     = document.getElementById('timeLeft');
const roundNumEl     = document.getElementById('roundNum');
const scorDispEl     = document.getElementById('scoreDisp');
const hintBtn        = document.getElementById('hintBtn');
const shuffleBtn     = document.getElementById('shuffleBtn');
const submitBtn      = document.getElementById('submitBtn');
const skipBtn        = document.getElementById('skipBtn');
const endCard        = document.getElementById('endCard');
const endScoreEl     = document.getElementById('endScore');
const endGradeEl     = document.getElementById('endGrade');
const endDetailEl    = document.getElementById('endDetail');
const playAgainBtn   = document.getElementById('playAgainBtn');

function shuffle(arr) {
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function scrambleWord(word) {
  let s;
  do { s = shuffle(word.split('')).join(''); } while(s === word);
  return s;
}

function startGame() {
  pool         = shuffle([...WORDS]).slice(0, TOTAL_ROUNDS);
  roundIdx     = 0;
  score        = 0;
  correctCount = 0;
  endCard.style.display = 'none';
  nextRound();
}

function nextRound() {
  if(roundIdx >= TOTAL_ROUNDS) return showEnd();
  const entry = pool[roundIdx];
  currentWord  = entry.word;
  scrambled    = scrambleWord(currentWord).split('');
  selectedTiles= Array(currentWord.length).fill(null); // tileIndex or null
  hintUsed     = false;

  roundNumEl.textContent = roundIdx + 1;
  hintTextEl.textContent = '';
  feedbackEl.textContent = '';
  feedbackEl.className   = 'feedback';
  hintBtn.disabled       = false;

  renderScrambled();
  renderSlots();
  startTimer();
  roundIdx++;
}

function renderScrambled() {
  tilesInputEl.innerHTML = '';
  scrambled.forEach((letter, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.dataset.idx = i;
    tile.addEventListener('click', () => onTileClick(i, tile));
    tilesInputEl.appendChild(tile);
  });
}

function renderSlots() {
  answerSlotsEl.innerHTML = '';
  selectedTiles.forEach((tileIdx, slotIdx) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slot = slotIdx;
    if(tileIdx !== null) slot.textContent = scrambled[tileIdx];
    slot.addEventListener('click', () => onSlotClick(slotIdx));
    answerSlotsEl.appendChild(slot);
  });
}

function onTileClick(tileIdx) {
  // Find first empty slot
  const emptySlot = selectedTiles.indexOf(null);
  if(emptySlot === -1) return;
  selectedTiles[emptySlot] = tileIdx;
  markTileUsed(tileIdx, true);
  renderSlots();
  checkAutoSubmit();
}

function onSlotClick(slotIdx) {
  const tileIdx = selectedTiles[slotIdx];
  if(tileIdx === null) return;
  markTileUsed(tileIdx, false);
  selectedTiles[slotIdx] = null;
  renderSlots();
}

function markTileUsed(tileIdx, used) {
  const tile = tilesInputEl.querySelector(`[data-idx="${tileIdx}"]`);
  if(tile) tile.classList.toggle('used', used);
}

function checkAutoSubmit() {
  if(selectedTiles.every(t => t !== null)) submitAnswer();
}

function submitAnswer() {
  const answer = selectedTiles.map(i => scrambled[i]).join('');
  if(selectedTiles.some(t => t === null)) {
    showFeedback('Fill all letters first!', 'wrong'); return;
  }
  if(answer === currentWord) {
    const pts = hintUsed ? 5 : 10;
    const timeBonus = Math.floor(timeLeft / 3);
    const total = pts + timeBonus;
    score += total;
    correctCount++;
    scorDispEl.textContent = score;
    stopTimer();
    showFeedback(`✓ Correct! +${total} pts`, 'correct');
    answerSlotsEl.querySelectorAll('.slot').forEach(s=>s.classList.add('correct-slot'));
    setTimeout(nextRound, 1200);
  } else {
    showFeedback('✗ Not quite — try again', 'wrong');
    shakSlots();
  }
}

function shakSlots() {
  answerSlotsEl.style.animation = 'none';
  answerSlotsEl.offsetHeight;
  answerSlotsEl.style.animation = 'shakeSlots 0.4s ease';
  if(!document.getElementById('shakeKf')) {
    const s=document.createElement('style');s.id='shakeKf';
    s.textContent=`@keyframes shakeSlots{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`;
    document.head.appendChild(s);
  }
}

function showFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className   = 'feedback ' + type;
}

function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_ROUND;
  timeLeftEl.textContent = timeLeft;
  timerFillEl.style.transition = 'none';
  timerFillEl.style.width = '100%';
  timerFillEl.classList.remove('danger');
  timerFillEl.offsetHeight;
  timerFillEl.style.transition = `width ${TIME_PER_ROUND}s linear`;
  setTimeout(()=>{ timerFillEl.style.width='0%'; }, 50);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    if(timeLeft <= 5) timerFillEl.classList.add('danger');
    if(timeLeft <= 0) { stopTimer(); timeUp(); }
  }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

function timeUp() {
  showFeedback(`Time's up! The word was: ${currentWord}`, 'wrong');
  scrambleWordEl.textContent = currentWord;
  setTimeout(nextRound, 1600);
}

function useHint() {
  if(hintUsed) return;
  hintUsed = true;
  hintTextEl.textContent = `Hint: ${pool[roundIdx-1].hint}`;
  hintBtn.disabled = true;
}

function reshuffleLetters() {
  // Reset selections
  selectedTiles = Array(currentWord.length).fill(null);
  scrambled = scrambleWord(currentWord).split('');
  renderScrambled();
  renderSlots();
}

function showEnd() {
  stopTimer();
  endScoreEl.textContent = score;
  const pct = (correctCount / TOTAL_ROUNDS) * 100;
  let grade, detail;
  if(pct === 100) { grade='Lexical Genius ✦'; detail='Perfect round!'; }
  else if(pct >= 80) { grade='Word Wizard'; detail='Excellent work!'; }
  else if(pct >= 60) { grade='Decent Scrambler'; detail='Not bad at all.'; }
  else if(pct >= 40) { grade='Keep Practicing'; detail='You\'ll get better!'; }
  else { grade='Lost in Letters'; detail='Try again!'; }
  endGradeEl.textContent  = grade;
  endDetailEl.textContent = `${correctCount}/${TOTAL_ROUNDS} correct · ${score} points`;
  endCard.style.display   = 'flex';
}

hintBtn.addEventListener('click', useHint);
shuffleBtn.addEventListener('click', reshuffleLetters);
submitBtn.addEventListener('click', submitAnswer);
skipBtn.addEventListener('click', () => { stopTimer(); showFeedback(`Skipped. Answer: ${currentWord}`, 'wrong'); setTimeout(nextRound, 1200); });
playAgainBtn.addEventListener('click', startGame);

// Keyboard input
document.addEventListener('keydown', e => {
  if(e.key === 'Enter') submitAnswer();
  if(e.key === 'Backspace') {
    const last = [...selectedTiles].reverse().findIndex(t => t !== null);
    if(last !== -1) {
      const slotIdx = selectedTiles.length - 1 - last;
      onSlotClick(slotIdx);
    }
  }
});

startGame();
