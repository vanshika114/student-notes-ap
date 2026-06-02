const display = document.getElementById('display');
const historyEl = document.getElementById('history');
let memory = parseFloat(localStorage.getItem('calc_memory')) || 0;
let history = JSON.parse(localStorage.getItem('calc_history') || '[]');

function renderHistory(){
  historyEl.textContent = history.slice(-5).join(' | ') || 'No history';
}

renderHistory();

document.querySelectorAll('.keys button').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.value;
    const a = btn.dataset.action;
    if (v !== undefined) {
      display.value = (display.value || '') + v.replace('*','×').replace('/','÷');
      return;
    }
    switch(a){
      case 'clear': display.value = ''; break;
      case 'back': display.value = display.value.slice(0,-1); break;
      case 'equals': evaluate(); break;
      case 'mc': memory = 0; localStorage.setItem('calc_memory', memory); break;
      case 'mr': display.value = String(memory); break;
      case 'mplus': memory += parseFloat(display.value || 0); localStorage.setItem('calc_memory', memory); break;
      case 'mminus': memory -= parseFloat(display.value || 0); localStorage.setItem('calc_memory', memory); break;
      case 'sqrt': applyUnary(Math.sqrt); break;
      case 'pow': display.value = (display.value || '') + '**'; break;
      case 'percent': applyUnary(x => x/100); break;
    }
  });
});

function sanitize(expr){
  return expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/[^0-9.+\-*/()%*]/g,'');
}

function evaluate(){
  try{
    const expr = sanitize(display.value);
    if(!expr) return;
    const result = Function('return ('+expr+')')();
    history.push(`${display.value} = ${result}`);
    localStorage.setItem('calc_history', JSON.stringify(history));
    display.value = String(result);
    renderHistory();
  }catch(e){
    display.value = 'Error';
    setTimeout(()=>display.value='',800);
  }
}

function applyUnary(fn){
  try{
    const val = parseFloat(sanitize(display.value) || 0);
    const r = fn(val);
    display.value = String(r);
    history.push(`${fn.name}(${val}) = ${r}`);
    localStorage.setItem('calc_history', JSON.stringify(history));
    renderHistory();
  }catch(e){ console.error(e); }
}

// keyboard support
window.addEventListener('keydown', (e)=>{
  if((e.key >= '0' && e.key <= '9') || '+-*/().'.includes(e.key)){
    display.value += e.key;
    return;
  }
  if(e.key === 'Enter') evaluate();
  if(e.key === 'Backspace') display.value = display.value.slice(0,-1);
  if(e.key.toLowerCase() === 'c') display.value = '';
});
