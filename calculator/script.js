const display = document.getElementById('display');

function appendValue(val) {
    if (display.value === '0' && val !== '.') {
        display.value = val;
    } else {
        display.value += val;
    }
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        if (display.value) {
            // Using a simple evaluation strategy for a basic mini-project
            display.value = eval(display.value);
        }
    } catch (error) {
        display.value = 'Error';
    }
}