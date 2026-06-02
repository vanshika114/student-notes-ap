const crumbs = Array.from(document.querySelectorAll(".crumb"));
const activeTitle = document.getElementById("active-title");
const activePath = document.getElementById("active-path");

const setActive = (index) => {
  crumbs.forEach((crumb, idx) => {
    crumb.classList.toggle("active", idx === index);
  });

  const labels = crumbs.slice(0, index + 1).map((crumb) => crumb.textContent);
  activeTitle.textContent = labels[labels.length - 1] || "Breadcrumb";
  activePath.textContent = labels.join(" / ");
};

crumbs.forEach((crumb) => {
  crumb.addEventListener("click", () => {
    const index = Number(crumb.dataset.index);
    setActive(index);
  });
});

setActive(crumbs.length - 1);
