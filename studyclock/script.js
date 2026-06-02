const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const buttons = document.querySelectorAll('[data-sound]');
const soundIds = ['rain', 'white-noise', 'cafe'];

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  timeEl.textContent = timeString;
  dateEl.textContent = dateString;
}

function stopAllSounds() {
  soundIds.forEach((id) => {
    const audio = document.getElementById(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

function setActiveButton(activeButton) {
  buttons.forEach((button) => {
    button.classList.toggle('active', button === activeButton);
  });
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const soundId = button.dataset.sound;
    const audio = document.getElementById(soundId);
    if (!audio) return;

    if (!button.classList.contains('active')) {
      stopAllSounds();
      audio.play();
      setActiveButton(button);
    } else {
      audio.pause();
      setActiveButton(null);
    }
  });
});

updateClock();
setInterval(updateClock, 1000);
