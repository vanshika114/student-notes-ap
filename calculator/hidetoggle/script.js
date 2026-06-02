const toggleBtn = document.querySelector("#toggleBtn");
const statusText = document.querySelector("#statusText");
const infoPanel = document.querySelector("#infoPanel");

toggleBtn.addEventListener("click", () => {
  const isHidden = infoPanel.classList.toggle("hidden");
  toggleBtn.textContent = isHidden ? "Show details" : "Hide details";
  statusText.textContent = isHidden ? "Hidden" : "Visible";
});
