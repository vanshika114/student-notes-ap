const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("count");

const updateCount = () => {
  const remaining = list.querySelectorAll(
    ".todo-item input[type='checkbox']:not(:checked)"
  ).length;
  countEl.textContent = remaining;
};

const createTodo = (text) => {
  const li = document.createElement("li");
  li.className = "todo-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = text;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Delete";

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    updateCount();
  });

  removeBtn.addEventListener("click", () => {
    li.remove();
    updateCount();
  });

  li.append(checkbox, span, removeBtn);
  return li;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    return;
  }

  list.append(createTodo(value));
  input.value = "";
  input.focus();
  updateCount();
});

updateCount();
