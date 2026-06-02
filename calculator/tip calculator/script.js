const billInput = document.getElementById("bill");
const tipInput = document.getElementById("tip");
const peopleInput = document.getElementById("people");
const tipAmountEl = document.getElementById("tip-amount");
const totalAmountEl = document.getElementById("total-amount");
const perPersonEl = document.getElementById("per-person");

const parseNumber = (value) => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) => value.toFixed(2);

const calculate = () => {
  const bill = Math.max(0, parseNumber(billInput.value));
  const tipPercent = Math.max(0, parseNumber(tipInput.value));
  const people = Math.max(1, parseNumber(peopleInput.value));

  const tipAmount = (bill * tipPercent) / 100;
  const totalAmount = bill + tipAmount;
  const perPerson = totalAmount / people;

  tipAmountEl.textContent = formatMoney(tipAmount);
  totalAmountEl.textContent = formatMoney(totalAmount);
  perPersonEl.textContent = formatMoney(perPerson);
};

[billInput, tipInput, peopleInput].forEach((input) => {
  input.addEventListener("input", calculate);
});

calculate();
