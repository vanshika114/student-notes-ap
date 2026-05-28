const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const toggleBtn = document.getElementById("toggle");

let is24Hour = false;

const pad = (value) => String(value).padStart(2, "0");

const updateTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  if (is24Hour) {
    timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    periodEl.textContent = "";
    return;
  }

  const isPm = hours >= 12;
  hours = hours % 12 || 12;
  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  periodEl.textContent = isPm ? "PM" : "AM";
};

const syncToggleLabel = () => {
  toggleBtn.textContent = is24Hour ? "Use 12-hour" : "Use 24-hour";
};

toggleBtn.addEventListener("click", () => {
  is24Hour = !is24Hour;
  syncToggleLabel();
  updateTime();
});

syncToggleLabel();
updateTime();
setInterval(updateTime, 1000);
