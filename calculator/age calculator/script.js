const birthdateInput = document.getElementById("birthdate");
const asOfInput = document.getElementById("asof");
const resultEl = document.getElementById("result");

const formatParts = (years, months, days) =>
  `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}, ${days} day${days === 1 ? "" : "s"}`;

const calculateAge = () => {
  const birthValue = birthdateInput.value;
  const asOfValue = asOfInput.value;

  if (!birthValue || !asOfValue) {
    resultEl.textContent = "Select dates to calculate your age.";
    return;
  }

  const birthDate = new Date(birthValue);
  const asOfDate = new Date(asOfValue);

  if (asOfDate < birthDate) {
    resultEl.textContent = "The 'as of' date must be after the birth date.";
    return;
  }

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  resultEl.textContent = `You are ${formatParts(years, months, days)} old.`;
};

[birthdateInput, asOfInput].forEach((input) => {
  input.addEventListener("input", calculateAge);
});

asOfInput.valueAsDate = new Date();
calculateAge();
