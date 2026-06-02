const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');

const icons = ['🌙', '⭐', '🍀', '🔥', '🍉', '⚡', '🎈', '🎧'];
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval = null;
let started = false;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function updateStats() {
  movesEl.textContent = moves;
  matchesEl.textContent = matches;
  timerEl.textContent = formatTime(timer);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer += 1;
    updateStats();
  }, 1000);
}

function setMessage(text) {
  messageEl.textContent = text;
}

function createBoard() {
  board.innerHTML = '';
  const pairIcons = shuffle([...icons, ...icons]);

  cards = pairIcons.map((icon, index) => {
    const button = document.createElement('button');
    button.className = 'card';
    button.type = 'button';
    button.setAttribute('aria-label', 'Memory card');
    button.dataset.icon = icon;
    button.dataset.index = index;

    button.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">?</div>
        <div class="card-face card-back"><span class="symbol">${icon}</span></div>
      </div>
    `;

    button.addEventListener('click', () => handleFlip(button));
    board.appendChild(button);
    return button;
  });
}

function resetRound() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matches = 0;
  timer = 0;
  started = false;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  updateStats();
  setMessage('Click any card to begin.');
  createBoard();
}

function finishRound() {
  if (matches === icons.length) {
    clearInterval(timerInterval);
    timerInterval = null;
    setMessage(`You matched all pairs in ${moves} moves and ${formatTime(timer)}!`);
  }
}

function checkMatch() {
  const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches += 1;
    matchesEl.textContent = matches;
    setMessage('Nice match! Keep going.');
    resetTurn();
    finishRound();
    return;
  }

  setMessage('Not a match. Try again.');
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetTurn();
  }, 850);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function handleFlip(card) {
  if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  if (!started) {
    started = true;
    startTimer();
    setMessage('Find its pair.');
  }

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  movesEl.textContent = moves;
  checkMatch();
}

restartBtn.addEventListener('click', resetRound);

resetRound();
