const typeEl = document.getElementById('type');
const fromEl = document.getElementById('fromUnit');
const toEl = document.getElementById('toUnit');
const valueEl = document.getElementById('value');
const convertBtn = document.getElementById('convert');
const swapBtn = document.getElementById('swap');
const clearBtn = document.getElementById('clear');
const resultEl = document.getElementById('result');

// Unit definitions and conversion helpers
const UNITS = {
  temperature: ['Celsius','Fahrenheit','Kelvin'],
  length: ['Meters','Kilometers','Centimeters','Miles','Inches'],
  weight: ['Kilograms','Grams','Pounds','Ounces'],
  currency: ['USD','EUR','GBP','INR','JPY']
};

const LENGTH_FACTORS_TO_M = {
  Meters: 1,
  Kilometers: 1000,
  Centimeters: 0.01,
  Miles: 1609.344,
  Inches: 0.0254
};

const WEIGHT_FACTORS_TO_KG = {
  Kilograms: 1,
  Grams: 0.001,
  Pounds: 0.45359237,
  Ounces: 0.0283495231
};

// Fixed sample currency rates (relative to USD)
const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 140
};

function populateUnits(type){
  const units = UNITS[type];
  fromEl.innerHTML = '';
  toEl.innerHTML = '';
  units.forEach(u => {
    const o1 = document.createElement('option'); o1.value = u; o1.textContent = u;
    const o2 = document.createElement('option'); o2.value = u; o2.textContent = u;
    fromEl.appendChild(o1); toEl.appendChild(o2);
  });
  if(units.length>1){ toEl.selectedIndex = 1; }
}

function convert(){
  const type = typeEl.value;
  const from = fromEl.value;
  const to = toEl.value;
  const raw = parseFloat(valueEl.value);
  if(isNaN(raw)) { resultEl.textContent = 'Enter a numeric value'; return; }

  let output = raw;

  if(type === 'temperature'){
    // convert from -> Celsius
    let c = 0;
    if(from === 'Celsius') c = raw;
    if(from === 'Fahrenheit') c = (raw - 32) * (5/9);
    if(from === 'Kelvin') c = raw - 273.15;
    // Celsius -> target
    if(to === 'Celsius') output = c;
    if(to === 'Fahrenheit') output = (c * 9/5) + 32;
    if(to === 'Kelvin') output = c + 273.15;
  }

  if(type === 'length'){
    const meters = raw * (LENGTH_FACTORS_TO_M[from] || 1);
    output = meters / (LENGTH_FACTORS_TO_M[to] || 1);
  }

  if(type === 'weight'){
    const kgs = raw * (WEIGHT_FACTORS_TO_KG[from] || 1);
    output = kgs / (WEIGHT_FACTORS_TO_KG[to] || 1);
  }

  if(type === 'currency'){
    const usd = raw / (CURRENCY_RATES[from] || 1);
    output = usd * (CURRENCY_RATES[to] || 1);
  }

  resultEl.textContent = `${raw} ${from} = ${Number(output.toFixed(6))} ${to}`;
}

function swap(){
  const a = fromEl.selectedIndex;
  const b = toEl.selectedIndex;
  fromEl.selectedIndex = b; toEl.selectedIndex = a;
  convert();
}

function clearAll(){ valueEl.value=''; resultEl.textContent = '—'; }

// Wire up
typeEl.addEventListener('change', () => populateUnits(typeEl.value));
convertBtn.addEventListener('click', convert);
swapBtn.addEventListener('click', swap);
clearBtn.addEventListener('click', clearAll);

// init
populateUnits(typeEl.value);
valueEl.value = '';
