const form = document.getElementById("signup-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const successMessage = document.getElementById("success-message");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmError = document.getElementById("confirm-error");

const showError = (element, message) => {
  element.textContent = message;
};

const clearErrors = () => {
  [nameError, emailError, passwordError, confirmError].forEach((element) => {
    element.textContent = "";
  });
  successMessage.textContent = "";
};

const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  let isValid = true;

  if (!nameInput.value.trim()) {
    showError(nameError, "Please enter your name.");
    isValid = false;
  }

  if (!validateEmail(emailInput.value)) {
    showError(emailError, "Enter a valid email address.");
    isValid = false;
  }

  if (passwordInput.value.length < 8) {
    showError(passwordError, "Password must be at least 8 characters.");
    isValid = false;
  }

  if (passwordInput.value !== confirmInput.value) {
    showError(confirmError, "Passwords do not match.");
    isValid = false;
  }

  if (isValid) {
    successMessage.textContent = "Signup complete! Welcome aboard.";
    form.reset();
  }
});
