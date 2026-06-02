const display = document.getElementById('display');
const keys = document.querySelector('.keys');
let expression = '';

function updateDisplay(val) {
	display.value = val;
}

function safeEvaluate(expr) {
	try {
		const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, '');
		const evalExpr = sanitized.replace(/%/g, '/100');
		// Use Function instead of eval for slightly safer evaluation
		// Wrap expression to ensure correct return
		// eslint-disable-next-line no-new-func
		const result = Function('return (' + evalExpr + ')')();
		return result;
	} catch (e) {
		return 'Error';
	}
}

keys.addEventListener('click', (e) => {
	const btn = e.target.closest('button');
	if (!btn) return;

	const value = btn.dataset.value;
	const action = btn.dataset.action;

	if (value) {
		expression += value;
		updateDisplay(expression);
		return;
	}

	if (action) {
		if (action === 'clear') {
			expression = '';
			updateDisplay('');
			return;
		}

		if (action === 'back') {
			expression = expression.slice(0, -1);
			updateDisplay(expression);
			return;
		}

		if (action === 'percent') {
			// append percent symbol which will be handled during evaluation
			expression += '%';
			updateDisplay(expression);
			return;
		}

		if (action === 'equals') {
			const res = safeEvaluate(expression);
			updateDisplay(res);
			expression = (res === 'Error') ? '' : String(res);
			return;
		}
	}
});

// Keyboard support
document.addEventListener('keydown', (e) => {
	if ((e.key >= '0' && e.key <= '9') || '+-*/().'.includes(e.key)) {
		expression += e.key;
		updateDisplay(expression);
		return;
	}

	if (e.key === 'Enter') {
		e.preventDefault();
		const res = safeEvaluate(expression);
		updateDisplay(res);
		expression = (res === 'Error') ? '' : String(res);
		return;
	}

	if (e.key === 'Backspace') {
		expression = expression.slice(0, -1);
		updateDisplay(expression);
		return;
	}

	if (e.key === 'Escape') {
		expression = '';
		updateDisplay('');
		return;
	}
});

