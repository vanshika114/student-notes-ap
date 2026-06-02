const inputs = {
    decimal: document.getElementById('decimal'),
    binary: document.getElementById('binary'),
    octal: document.getElementById('octal'),
    hex: document.getElementById('hex')
};

const errorMsg = document.getElementById('error-msg');
const clearBtn = document.getElementById('clear-btn');

/**
 * Core Conversion Logic
 * @param {string} value - The input value
 * @param {number} base - The base of the input value
 */
function convertValues(value, base) {
    errorMsg.textContent = '';
    
    if (value === '') {
        clearAll();
        return;
    }

    try {
        // Validate and Parse the input based on its base
        // We use BigInt to support larger bit conversions without precision loss
        let decimalValue;
        
        if (base === 16) {
            // Validate Hex characters
            if (!/^[0-9A-Fa-f]+$/.test(value)) throw new Error("Invalid Hexadecimal");
            decimalValue = BigInt(`0x${value}`);
        } else if (base === 2) {
            if (!/^[01]+$/.test(value)) throw new Error("Invalid Binary");
            decimalValue = BigInt(`0b${value}`);
        } else if (base === 8) {
            if (!/^[0-7]+$/.test(value)) throw new Error("Invalid Octal");
            decimalValue = BigInt(`0o${value}`);
        } else {
            if (!/^\d+$/.test(value)) throw new Error("Invalid Decimal");
            decimalValue = BigInt(value);
        }

        // Update other fields
        if (base !== 10) inputs.decimal.value = decimalValue.toString(10);
        if (base !== 2) inputs.binary.value = decimalValue.toString(2);
        if (base !== 8) inputs.octal.value = decimalValue.toString(8);
        if (base !== 16) inputs.hex.value = decimalValue.toString(16).toUpperCase();

    } catch (e) {
        errorMsg.textContent = e.message;
        // Don't clear other fields immediately so the user can correct their input
    }
}

function clearAll() {
    Object.values(inputs).forEach(input => input.value = '');
    errorMsg.textContent = '';
}

// Event Listeners for real-time conversion
inputs.decimal.addEventListener('input', (e) => {
    // Remove non-numeric characters for decimal
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val;
    convertValues(val, 10);
});

inputs.binary.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^01]/g, '');
    e.target.value = val;
    convertValues(val, 2);
});

inputs.octal.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^0-7]/g, '');
    e.target.value = val;
    convertValues(val, 8);
});

inputs.hex.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    e.target.value = val;
    convertValues(val, 16);
});

clearBtn.addEventListener('click', clearAll);

console.log("BitConverter Initialized");