const swatchesEl = document.getElementById("swatches");
const generateBtn = document.getElementById("generate");
const hintEl = document.getElementById("hint");

const randomColor = () => {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`.toUpperCase();
};

const getTextColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1c1c1c" : "#ffffff";
};

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    hintEl.textContent = `${value} copied to clipboard!`;
  } catch (error) {
    hintEl.textContent = `Copy failed. Hex: ${value}`;
  }
};

const renderPalette = () => {
  hintEl.textContent = "Click a color to copy its hex value.";
  swatchesEl.innerHTML = "";

  for (let i = 0; i < 5; i += 1) {
    const color = randomColor();
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.style.color = getTextColor(color);
    swatch.textContent = color;
    swatch.addEventListener("click", () => copyToClipboard(color));
    swatchesEl.appendChild(swatch);
  }
};

generateBtn.addEventListener("click", renderPalette);

renderPalette();
