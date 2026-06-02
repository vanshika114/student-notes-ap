const backToTopButton = document.querySelector("#backToTop");

const toggleBackToTop = () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("show");
  } else {
    backToTopButton.classList.remove("show");
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

toggleBackToTop();
window.addEventListener("scroll", toggleBackToTop);
window.addEventListener("resize", toggleBackToTop);
backToTopButton.addEventListener("click", scrollToTop);
