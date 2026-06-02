const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const successMessage = document.getElementById("success-message");
const forgotBtn = document.getElementById("forgot");

const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

const showError = (element, message) => {
  element.textContent = message;
};

const clearErrors = () => {
  emailError.textContent = "";
  passwordError.textContent = "";
  successMessage.textContent = "";
};

const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  let isValid = true;

  if (!validateEmail(emailInput.value)) {
    showError(emailError, "Enter a valid email address.");
    isValid = false;
  }

  if (!passwordInput.value) {
    showError(passwordError, "Enter your password.");
    isValid = false;
  }

  if (isValid) {
    successMessage.textContent = "Login successful. Welcome back!";
    form.reset();
  }
});

forgotBtn.addEventListener("click", () => {
  successMessage.textContent = "Password reset link sent to your email.";
});
