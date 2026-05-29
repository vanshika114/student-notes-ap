const rippleButtons = document.querySelectorAll(".btn-ripple");
const loadBtn = document.querySelector("#loadBtn");
const loadHint = document.querySelector("#loadHint");

rippleButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const { left, top } = button.getBoundingClientRect();
    const rippleX = event.clientX - left;
    const rippleY = event.clientY - top;

    button.style.setProperty("--ripple-x", `${rippleX}px`);
    button.style.setProperty("--ripple-y", `${rippleY}px`);
    button.classList.remove("rippling");

    void button.offsetWidth;
    button.classList.add("rippling");
  });
});

loadBtn.addEventListener("click", () => {
  if (loadBtn.classList.contains("loading")) {
    return;
  }

  loadBtn.classList.add("loading");
  loadHint.textContent = "Uploading... please wait.";

  window.setTimeout(() => {
    loadBtn.classList.remove("loading");
    loadHint.textContent = "Upload complete.";
  }, 1400);
});
