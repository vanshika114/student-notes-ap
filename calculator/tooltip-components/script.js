const tooltips = document.querySelectorAll(".tooltip");

tooltips.forEach((tooltip) => {
  tooltip.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      tooltip.blur();
    }
  });
});
