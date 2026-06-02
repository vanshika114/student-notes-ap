const overlay = document.querySelector("#overlay");
const openBtn = document.querySelector("#openPopup");
const laterBtn = document.querySelector("#laterBtn");
const installBtn = document.querySelector("#installBtn");

const openPopup = () => {
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
};

const closePopup = () => {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
};

openBtn.addEventListener("click", openPopup);
laterBtn.addEventListener("click", closePopup);
installBtn.addEventListener("click", closePopup);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    closePopup();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePopup();
  }
});
