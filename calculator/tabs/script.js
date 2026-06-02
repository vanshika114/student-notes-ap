const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

const activateTab = (targetId) => {
  tabs.forEach((tab) => {
    const isActive = tab.getAttribute("aria-controls") === targetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.getAttribute("aria-controls"));
  });
});
