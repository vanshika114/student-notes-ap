const images = [
  {
    src: "https://picsum.photos/id/1015/900/600",
    alt: "Mountain landscape with a lake",
  },
  {
    src: "https://picsum.photos/id/1025/900/600",
    alt: "Golden retriever close-up",
  },
  {
    src: "https://picsum.photos/id/1040/900/600",
    alt: "Forest trail in the morning light",
  },
  {
    src: "https://picsum.photos/id/1062/900/600",
    alt: "Ocean waves at sunset",
  },
];

const imageEl = document.getElementById("slide-image");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const dotsContainer = document.getElementById("dots");

let currentIndex = 0;

const renderDots = () => {
  dotsContainer.innerHTML = "";
  images.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => setSlide(index));
    dotsContainer.append(dot);
  });
};

const updateDots = () => {
  const dots = dotsContainer.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
    dot.setAttribute("aria-selected", index === currentIndex ? "true" : "false");
  });
};

const setSlide = (index) => {
  currentIndex = (index + images.length) % images.length;
  const current = images[currentIndex];
  imageEl.src = current.src;
  imageEl.alt = current.alt;
  updateDots();
};

prevBtn.addEventListener("click", () => setSlide(currentIndex - 1));
nextBtn.addEventListener("click", () => setSlide(currentIndex + 1));

renderDots();
setSlide(0);
