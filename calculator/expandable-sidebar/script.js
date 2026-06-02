const sidebar = document.querySelector("#sidebar");
const toggleBtn = document.querySelector("#toggleBtn");

toggleBtn.addEventListener("click", () => {
  const isCollapsed = sidebar.classList.toggle("collapsed");
  toggleBtn.querySelector(".toggle-text").textContent = isCollapsed
    ? "Expand"
    : "Collapse";
});
