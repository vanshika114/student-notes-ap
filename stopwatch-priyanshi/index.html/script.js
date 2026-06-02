let startTime, elapsed = 0, timerInterval;
let running = false;
let lapCount = 0;

function format(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function pad(n) { return n.toString().padStart(2, '0'); }

function toggleStartStop() {
  const btn = document.getElementById('startStop');
  if (!running) {
    startTime = Date.now() - elapsed;
    timerInterval = setInterval(() => {
      elapsed = Date.now() - startTime;
      document.getElementById('display').textContent = format(elapsed);
    }, 10);
    running = true;
    btn.textContent = 'Stop';
    btn.classList.add('running');
  } else {
    clearInterval(timerInterval);
    running = false;
    btn.textContent = 'Start';
    btn.classList.remove('running');
  }
}

function recordLap() {
  if (!running && elapsed === 0) return;
  lapCount++;
  const li = document.createElement('li');
  li.innerHTML = `<span>Lap ${lapCount}</span><span>${format(elapsed)}</span>`;
  const laps = document.getElementById('laps');
  laps.insertBefore(li, laps.firstChild);
}

function resetWatch() {
  clearInterval(timerInterval);
  running = false;
  elapsed = 0;
  lapCount = 0;
  document.getElementById('display').textContent = '00:00:00.00';
  document.getElementById('laps').innerHTML = '';
  const btn = document.getElementById('startStop');
  btn.textContent = 'Start';
  btn.classList.remove('running');
}