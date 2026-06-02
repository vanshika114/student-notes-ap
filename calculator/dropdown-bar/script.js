const dropdownItems = document.querySelectorAll(".nav__item--dropdown");

const closeAll = () => {
  dropdownItems.forEach((item) => {
    item.classList.remove("is-open");
    const toggle = item.querySelector(".nav__toggle");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
};

dropdownItems.forEach((item) => {
  const toggle = item.querySelector(".nav__toggle");

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains("is-open");
    closeAll();
    if (!isOpen) {
      item.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
});

document.addEventListener("click", () => {
  closeAll();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAll();
  }
});
