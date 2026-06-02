const valueEl = document.getElementById("value");
const increaseBtn = document.getElementById("increase");
const decreaseBtn = document.getElementById("decrease");
const resetBtn = document.getElementById("reset");

let count = 0;

const render = () => {
  valueEl.textContent = count;
};

increaseBtn.addEventListener("click", () => {
  count += 1;
  render();
});

decreaseBtn.addEventListener("click", () => {
  count -= 1;
  render();
});

resetBtn.addEventListener("click", () => {
  count = 0;
  render();
});

render();
