const stars = document.querySelectorAll(".star");
const ratingText = document.querySelector("#ratingText");

const labels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

let selectedValue = 0;

const updateSelection = (value) => {
  stars.forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("is-selected", starValue <= value);
  });
  ratingText.textContent = value ? `${value} / 5 - ${labels[value]}` : "Select a rating";
};

const setHover = (value) => {
  stars.forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("is-hovered", starValue <= value);
  });
};

stars.forEach((star) => {
  star.addEventListener("mouseenter", () => {
    setHover(Number(star.dataset.value));
  });

  star.addEventListener("mouseleave", () => {
    setHover(0);
  });

  star.addEventListener("click", () => {
    selectedValue = Number(star.dataset.value);
    updateSelection(selectedValue);
  });
});
