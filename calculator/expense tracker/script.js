const form = document.getElementById("expense-form");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categorySelect = document.getElementById("expense-category");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const countEl = document.getElementById("count");

const state = {
  expenses: [],
};

const formatCurrency = (value) => `₹${value.toFixed(2)}`;

const updateSummary = () => {
  const total = state.expenses.reduce((sum, item) => sum + item.amount, 0);
  totalEl.textContent = formatCurrency(total);
  countEl.textContent = state.expenses.length;
};

const renderExpenses = () => {
  list.innerHTML = "";
  state.expenses.forEach((expense, index) => {
    const item = document.createElement("li");
    item.className = "expense-item";

    const info = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = expense.name;
    const meta = document.createElement("p");
    meta.textContent = `${expense.category} · ${expense.date}`;
    info.append(title, meta);

    const actions = document.createElement("div");
    const amount = document.createElement("strong");
    amount.textContent = formatCurrency(expense.amount);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", () => {
      state.expenses.splice(index, 1);
      renderExpenses();
      updateSummary();
    });

    actions.append(amount, removeBtn);
    item.append(info, actions);
    list.append(item);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (!name || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  const expense = {
    name,
    amount,
    category: categorySelect.value,
    date: new Date().toLocaleDateString(),
  };

  state.expenses.unshift(expense);
  form.reset();
  nameInput.focus();
  renderExpenses();
  updateSummary();
});

updateSummary();
