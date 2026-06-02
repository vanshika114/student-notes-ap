const passwordInput = document.getElementById("password");
const lengthInput = document.getElementById("length");
const uppercaseInput = document.getElementById("uppercase");
const numbersInput = document.getElementById("numbers");
const symbolsInput = document.getElementById("symbols");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");
const statusEl = document.getElementById("status");

const sets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+[]{}<>?",
};

const getPool = () => {
  let pool = sets.lowercase;
  if (uppercaseInput.checked) {
    pool += sets.uppercase;
  }
  if (numbersInput.checked) {
    pool += sets.numbers;
  }
  if (symbolsInput.checked) {
    pool += sets.symbols;
  }
  return pool;
};

const generatePassword = () => {
  const length = Math.min(Math.max(parseInt(lengthInput.value, 10) || 12, 6), 24);
  lengthInput.value = length;
  const pool = getPool();

  if (!pool) {
    statusEl.textContent = "Select at least one character set.";
    return;
  }

  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    result += pool[index];
  }

  passwordInput.value = result;
  statusEl.textContent = "Password generated.";
};

const copyPassword = async () => {
  if (!passwordInput.value) {
    statusEl.textContent = "Generate a password first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordInput.value);
    statusEl.textContent = "Copied to clipboard.";
  } catch (error) {
    statusEl.textContent = "Copy failed. Please copy manually.";
  }
};

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

generatePassword();
