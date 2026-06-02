const form = document.getElementById("bmi-form");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const resultEl = document.getElementById("result");
const valueEl = document.getElementById("bmi-value");
const categoryEl = document.getElementById("bmi-category");

const getCategory = (bmi) => {
  if (bmi < 18.5) {
    return "Underweight";
  }
  if (bmi < 25) {
    return "Normal weight";
  }
  if (bmi < 30) {
    return "Overweight";
  }
  return "Obesity";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const height = parseFloat(heightInput.value) / 100;
  const weight = parseFloat(weightInput.value);

  if (!height || !weight) {
    return;
  }

  const bmi = weight / (height * height);
  valueEl.textContent = bmi.toFixed(1);
  categoryEl.textContent = getCategory(bmi);
  resultEl.hidden = false;
});
