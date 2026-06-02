const dropdown = document.querySelector("#dropdown");
const toggle = dropdown.querySelector(".dropdown__toggle");
const panel = dropdown.querySelector(".dropdown__panel");
const label = dropdown.querySelector(".dropdown__label");
const search = dropdown.querySelector(".dropdown__search");
const items = Array.from(dropdown.querySelectorAll(".dropdown__item"));

const openDropdown = () => {
  toggle.classList.add("is-open");
  panel.classList.add("is-open");
  toggle.setAttribute("aria-expanded", "true");
  panel.setAttribute("aria-hidden", "false");
  search.focus();
};

const closeDropdown = () => {
  toggle.classList.remove("is-open");
  panel.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
  search.value = "";
  filterItems("");
};

const filterItems = (value) => {
  const term = value.trim().toLowerCase();
  items.forEach((item) => {
    const matches = item.textContent.toLowerCase().includes(term);
    item.classList.toggle("is-hidden", !matches);
  });
};

const setActive = (target) => {
  items.forEach((item) => {
    item.classList.toggle("is-active", item === target);
  });
};

const selectItem = (item) => {
  label.textContent = item.textContent;
  setActive(item);
  closeDropdown();
  toggle.focus();
};

toggle.addEventListener("click", () => {
  const isOpen = toggle.classList.contains("is-open");
  if (isOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
});

search.addEventListener("input", (event) => {
  filterItems(event.target.value);
});

items.forEach((item) => {
  item.addEventListener("click", () => selectItem(item));
});

document.addEventListener("click", (event) => {
  if (!dropdown.contains(event.target)) {
    closeDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdown();
  }
});
