const progressBar = document.querySelector("#progressBar");

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageHeight ? (scrollTop / pageHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};

updateProgress();
window.addEventListener("scroll", updateProgress);
window.addEventListener("resize", updateProgress);
