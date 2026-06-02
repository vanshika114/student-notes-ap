function updateLength() {
  document.getElementById('len-val').textContent = document.getElementById('length').value;
}

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (document.getElementById('upper').checked) chars += upper;
  if (document.getElementById('lower').checked) chars += lower;
  if (document.getElementById('numbers').checked) chars += nums;
  if (document.getElementById('symbols').checked) chars += syms;

  if (!chars) { alert('Select at least one option!'); return; }

  const length = parseInt(document.getElementById('length').value);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  document.getElementById('password').textContent = password;
  updateStrength(password);
}

function updateStrength(pwd) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 20) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  if (score <= 2) {
    fill.style.width = '33%'; fill.style.background = '#e74c3c'; label.textContent = '⚠ Weak';
  } else if (score <= 4) {
    fill.style.width = '66%'; fill.style.background = '#f39c12'; label.textContent = '~ Medium';
  } else {
    fill.style.width = '100%'; fill.style.background = '#2ecc71'; label.textContent = '✓ Strong';
  }
}

function copyPassword() {
  const pwd = document.getElementById('password').textContent;
  if (pwd === 'Click Generate') return;
  navigator.clipboard.writeText(pwd).then(() => {
    const msg = document.getElementById('copy-msg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 1500);
  });
}