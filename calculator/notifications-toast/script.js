const toastContainer = document.querySelector("#toasts");
const buttons = document.querySelectorAll(".btn");

const messages = {
  success: {
    title: "Success",
    message: "Your changes were saved successfully.",
  },
  info: {
    title: "Info",
    message: "New updates are available in the dashboard.",
  },
  warning: {
    title: "Warning",
    message: "Your trial ends in 3 days. Consider upgrading.",
  },
  error: {
    title: "Error",
    message: "Something went wrong. Please try again.",
  },
};

const createToast = (type) => {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const title = document.createElement("div");
  title.className = "toast__title";
  title.textContent = messages[type].title;

  const message = document.createElement("div");
  message.className = "toast__message";
  message.textContent = messages[type].message;

  toast.appendChild(title);
  toast.appendChild(message);

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    createToast(type);
  });
});
