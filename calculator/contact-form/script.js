const form = document.getElementById("contact-form");
const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const subjectInput = document.getElementById("subject-input");
const messageInput = document.getElementById("message-input");
const statusEl = document.getElementById("status");

const updateStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#c62828" : "#1f3a86";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();

  if (!email) {
    updateStatus("Please enter a valid email address.", true);
    emailInput.focus();
    return;
  }

  if (!message) {
    updateStatus("Please enter a message.", true);
    messageInput.focus();
    return;
  }

  updateStatus(`Thanks ${name || "there"}! We'll reply about "${subject || "your message"}" soon.`);
  form.reset();
});
