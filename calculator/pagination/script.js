const itemList = document.querySelector("#itemList");
const pageButtons = document.querySelector("#pageButtons");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const pageMeta = document.querySelector("#pageMeta");

const items = Array.from({ length: 18 }, (_, index) => ({
  title: `Lesson ${index + 1}`,
  description: "Explore curated lessons with concise summaries and actions.",
}));

const pageSize = 4;
let currentPage = 1;

const totalPages = Math.ceil(items.length / pageSize);

const renderItems = () => {
  itemList.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const currentItems = items.slice(start, start + pageSize);

  currentItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `<h3>${item.title}</h3><p>${item.description}</p>`;
    itemList.appendChild(card);
  });
};

const renderPagination = () => {
  pageButtons.innerHTML = "";
  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-btn";
    button.textContent = page;
    button.setAttribute("aria-label", `Go to page ${page}`);
    button.classList.toggle("active", page === currentPage);
    button.addEventListener("click", () => {
      currentPage = page;
      updatePagination();
    });
    pageButtons.appendChild(button);
  }
};

const updateControls = () => {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  pageMeta.textContent = `Page ${currentPage} of ${totalPages}`;
};

const updatePagination = () => {
  renderItems();
  renderPagination();
  updateControls();
};

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    updatePagination();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage += 1;
    updatePagination();
  }
});

updatePagination();
