const copyBtn = document.querySelector("#copyBtn");
const copyStatus = document.querySelector("#copyStatus");
const copyTarget = document.querySelector("#copyTarget");
const customText = document.querySelector("#customText");
const copyCustomBtn = document.querySelector("#copyCustomBtn");
const clearBtn = document.querySelector("#clearBtn");

const setStatus = (message) => {
  copyStatus.textContent = message;
};

const copyText = async (text) => {
  if (!text) {
    setStatus("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard!");
  } catch (error) {
    setStatus("Clipboard access failed. Try again.");
  }
};

copyBtn.addEventListener("click", () => {
  copyText(copyTarget.textContent.trim());
});

copyCustomBtn.addEventListener("click", () => {
  copyText(customText.value.trim());
});

clearBtn.addEventListener("click", () => {
  customText.value = "";
  setStatus("Cleared.");
});
