const form = document.getElementById("recipe-form");
const nameInput = document.getElementById("recipe-name");
const ingredientInput = document.getElementById("recipe-ingredient");
const stepsInput = document.getElementById("recipe-steps");
const searchInput = document.getElementById("search-input");
const list = document.getElementById("recipe-list");
const emptyEl = document.getElementById("empty");

const recipes = [];

const updateEmpty = () => {
  emptyEl.hidden = recipes.length > 0;
};

const renderRecipes = () => {
  const query = searchInput.value.trim().toLowerCase();
  list.innerHTML = "";

  recipes
    .filter((recipe) =>
      query ? recipe.ingredient.toLowerCase().includes(query) : true
    )
    .forEach((recipe, index) => {
      const item = document.createElement("li");
      item.className = "recipe-card";

      const title = document.createElement("h3");
      title.textContent = recipe.name;

      const steps = document.createElement("p");
      steps.textContent = recipe.steps;

      const meta = document.createElement("div");
      meta.className = "recipe-meta";

      const ingredient = document.createElement("span");
      ingredient.textContent = `Ingredient: ${recipe.ingredient}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Delete";
      removeBtn.addEventListener("click", () => {
        recipes.splice(index, 1);
        renderRecipes();
        updateEmpty();
      });

      meta.append(ingredient, removeBtn);
      item.append(title, steps, meta);
      list.append(item);
    });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const ingredient = ingredientInput.value.trim();
  const steps = stepsInput.value.trim();

  if (!name || !ingredient || !steps) {
    return;
  }

  recipes.unshift({ name, ingredient, steps });
  form.reset();
  nameInput.focus();
  renderRecipes();
  updateEmpty();
});

searchInput.addEventListener("input", renderRecipes);

updateEmpty();
