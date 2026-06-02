const modeEl = document.getElementById("mode");
const displayEl = document.getElementById("display");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const focusInput = document.getElementById("focus-input");
const breakInput = document.getElementById("break-input");

let isRunning = false;
let isFocus = true;
let remainingSeconds = 25 * 60;
let timerId = null;

const clamp = (value, min, max, fallback) => {
  const number = parseInt(value, 10);
  if (Number.isNaN(number)) {
    return fallback;
  }
  return Math.min(Math.max(number, min), max);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
};

const updateDisplay = () => {
  modeEl.textContent = isFocus ? "Focus" : "Break";
  displayEl.textContent = formatTime(remainingSeconds);
};

const applyDurations = () => {
  const focusMinutes = clamp(focusInput.value, 5, 60, 25);
  const breakMinutes = clamp(breakInput.value, 1, 30, 5);
  focusInput.value = focusMinutes;
  breakInput.value = breakMinutes;
  remainingSeconds = (isFocus ? focusMinutes : breakMinutes) * 60;
  updateDisplay();
};

const tick = () => {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateDisplay();
    return;
  }

  isFocus = !isFocus;
  applyDurations();
};

const startTimer = () => {
  if (isRunning) {
    return;
  }
  isRunning = true;
  timerId = setInterval(tick, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
};

const pauseTimer = () => {
  if (!isRunning) {
    return;
  }
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
};

const resetTimer = () => {
  pauseTimer();
  isFocus = true;
  applyDurations();
};

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
focusInput.addEventListener("change", applyDurations);
breakInput.addEventListener("change", applyDurations);

applyDurations();
