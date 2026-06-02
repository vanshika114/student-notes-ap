let expression = '';

function updateDisplay() {
  document.getElementById('expression').textContent = expression;
}

function appendVal(val) {
  const last = expression.slice(-1);
  const operators = ['+', '-', '*', '/', '%'];

  if (operators.includes(val) && operators.includes(last)) return;
  if (val === '.' && expression.split(/[\+\-\*\/]/).pop().includes('.')) return;

  expression += val;
  updateDisplay();
}

function clearAll() {
  expression = '';
  document.getElementById('result').textContent = '0';
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (!expression) return;
  try {
    const evalExpr = expression.replace(/×/g, '*').replace(/÷/g, '/');
    const res = Function('"use strict"; return (' + evalExpr + ')')();
    document.getElementById('result').textContent = parseFloat(res.toFixed(10));
    document.getElementById('expression').textContent = expression + ' =';
    expression = String(parseFloat(res.toFixed(10)));
  } catch {
    document.getElementById('result').textContent = 'Error';
    expression = '';
  }
}

document.addEventListener('keydown', function(e) {
  if ('0123456789.+-*/%'.includes(e.key)) appendVal(e.key);
  else if (e.key === 'Enter') calculate();
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
});