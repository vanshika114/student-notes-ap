const display = document.getElementById("display");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const lapBtn = document.getElementById("lap");
const lapList = document.getElementById("lap-list");

let startTime = 0;
let elapsed = 0;
let timerId = null;

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const centiseconds = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}.${centiseconds}`;
};

const updateDisplay = () => {
  const now = Date.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  display.textContent = formatTime(total);
};

const startTimer = () => {
  if (timerId) {
    return;
  }
  startTime = Date.now();
  timerId = setInterval(updateDisplay, 50);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  lapBtn.disabled = false;
};

const pauseTimer = () => {
  if (!timerId) {
    return;
  }
  elapsed += Date.now() - startTime;
  clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  lapBtn.disabled = true;
};

const resetTimer = () => {
  clearInterval(timerId);
  timerId = null;
  startTime = 0;
  elapsed = 0;
  display.textContent = "00:00.00";
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
  lapBtn.disabled = true;
  lapList.innerHTML = "";
};

const addLap = () => {
  const now = Date.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  const item = document.createElement("li");
  item.textContent = formatTime(total);
  lapList.prepend(item);
};

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
lapBtn.addEventListener("click", addLap);

updateDisplay();
