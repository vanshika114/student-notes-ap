const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");

const pad = (value) => String(value).padStart(2, "0");

const updateClock = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const isPm = hours >= 12;

  hours = hours % 12 || 12;

  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  periodEl.textContent = isPm ? "PM" : "AM";
  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

updateClock();
setInterval(updateClock, 1000);
