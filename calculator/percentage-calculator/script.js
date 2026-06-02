const percentInput = document.getElementById("percent-input");
const ofInput = document.getElementById("of-input");
const percentLabel = document.getElementById("percent-label");
const ofLabel = document.getElementById("of-label");
const basicResult = document.getElementById("basic-result");

const valueInput = document.getElementById("value-input");
const changeInput = document.getElementById("change-input");
const changeResult = document.getElementById("change-result");
const differenceResult = document.getElementById("difference-result");

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "0";
  return Number(value.toFixed(2)).toString();
};

const updateBasic = () => {
  const percent = parseFloat(percentInput.value);
  const base = parseFloat(ofInput.value);
  const percentValue = Number.isFinite(percent) ? percent : 0;
  const baseValue = Number.isFinite(base) ? base : 0;

  percentLabel.textContent = percentValue || 0;
  ofLabel.textContent = baseValue || 0;

  const result = (percentValue / 100) * baseValue;
  basicResult.textContent = formatNumber(result);
};

const updateChange = () => {
  const base = parseFloat(valueInput.value);
  const change = parseFloat(changeInput.value);
  const baseValue = Number.isFinite(base) ? base : 0;
  const changeValue = Number.isFinite(change) ? change : 0;

  const difference = (changeValue / 100) * baseValue;
  const updated = baseValue + difference;

  changeResult.textContent = formatNumber(updated);
  differenceResult.textContent = `${difference >= 0 ? "+" : ""}${formatNumber(difference)}`;
};

const wireInput = (input, handler) => {
  input.addEventListener("input", handler);
};

wireInput(percentInput, updateBasic);
wireInput(ofInput, updateBasic);
wireInput(valueInput, updateChange);
wireInput(changeInput, updateChange);

updateBasic();
updateChange();
