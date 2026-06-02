// Load transactions from localStorage or start empty
let transactions = JSON.parse(localStorage.getItem('et_transactions')) || [];

// Run on page load
window.onload = function () {
  renderAll();
};

// Add a new transaction
function addTransaction() {
  const desc   = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type   = document.querySelector('input[name="type"]:checked').value;

  // Validation
  if (!desc) {
    alert('Please enter a description.');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');
    return;
  }

  // Build transaction object
  const txn = {
    id: Date.now(),
    desc: desc,
    amount: amount,
    type: type,
    date: new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  };

  transactions.unshift(txn); // add to top
  saveToStorage();
  renderAll();
  clearForm();
}

// Delete one transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  renderAll();
}

// Clear all transactions
function clearAll() {
  if (transactions.length === 0) return;
  if (confirm('Clear all transactions? This cannot be undone.')) {
    transactions = [];
    saveToStorage();
    renderAll();
  }
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem('et_transactions', JSON.stringify(transactions));
}

// Render everything
function renderAll() {
  renderList();
  updateSummary();
}

// Render transaction list
function renderList() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.innerHTML = '<li class="empty-msg">No transactions yet.</li>';
    return;
  }

  transactions.forEach(txn => {
    const li = document.createElement('li');
    li.classList.add('transaction-item', txn.type);

    const sign   = txn.type === 'income' ? '+' : '-';
    const color  = txn.type === 'income' ? 'green' : 'red';

    li.innerHTML = `
      <div class="txn-left">
        <span class="txn-desc">${txn.desc}</span>
        <span class="txn-date">${txn.date}</span>
      </div>
      <div class="txn-right">
        <span class="txn-amount ${color}">${sign}₹${txn.amount.toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteTransaction(${txn.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Update balance, income, expense totals
function updateSummary() {
  let totalIncome  = 0;
  let totalExpense = 0;

  transactions.forEach(txn => {
    if (txn.type === 'income') totalIncome  += txn.amount;
    else                       totalExpense += txn.amount;
  });

  const balance = totalIncome - totalExpense;

  document.getElementById('balance').textContent       = `₹${balance.toFixed(2)}`;
  document.getElementById('total-income').textContent  = `+₹${totalIncome.toFixed(2)}`;
  document.getElementById('total-expense').textContent = `-₹${totalExpense.toFixed(2)}`;

  // Color balance based on positive/negative
  const balanceEl = document.getElementById('balance');
  balanceEl.style.color = balance >= 0 ? '#4ade80' : '#f87171';
}

// Clear the form inputs
function clearForm() {
  document.getElementById('desc').value   = '';
  document.getElementById('amount').value = '';
  document.querySelector('input[name="type"][value="income"]').checked = true;
}