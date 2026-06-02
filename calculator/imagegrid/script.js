const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".card");

const setActiveChip = (selected) => {
  chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip === selected);
  });
};

const applyFilter = (filter) => {
  cards.forEach((card) => {
    const matches = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !matches);
  });
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    setActiveChip(chip);
    applyFilter(filter);
  });
});
