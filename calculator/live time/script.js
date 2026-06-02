const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const timezoneEl = document.getElementById("timezone");

const pad = (value) => String(value).padStart(2, "0");

const updateTime = () => {
  const now = new Date();
  hoursEl.textContent = pad(now.getHours());
  minutesEl.textContent = pad(now.getMinutes());
  secondsEl.textContent = pad(now.getSeconds());

  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  timezoneEl.textContent = `Timezone: ${timeZoneName}`;
};

updateTime();
setInterval(updateTime, 1000);
