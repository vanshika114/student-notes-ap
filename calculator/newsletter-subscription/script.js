const form = document.getElementById("subscribe-form");
const emailInput = document.getElementById("email-input");
const statusEl = document.getElementById("status");

const updateStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#c62828" : "#1f3a86";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();

  if (!email) {
    updateStatus("Please enter an email address.", true);
    emailInput.focus();
    return;
  }

  updateStatus(`Thanks! We'll send updates to ${email}.`);
  form.reset();
});
