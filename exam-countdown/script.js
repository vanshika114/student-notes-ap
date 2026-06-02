const countdownData = [
  {
    title: 'Linear Algebra Final',
    type: 'Exam',
    deadline: '2026-06-10T09:00:00',
    description: 'Exact in-person exam slot, highest priority for review.'
  },
  {
    title: 'Mobile App Submission',
    type: 'Project',
    deadline: '2026-06-03T23:59:00',
    description: 'Final deployment and documentation due at midnight.'
  },
  {
    title: 'Physics Lab Report',
    type: 'Assignment',
    deadline: '2026-06-01T17:30:00',
    description: 'Upload formatted PDF and data attachments.'
  },
  {
    title: 'Capstone Proposal',
    type: 'Deadline',
    deadline: '2026-07-01T12:00:00',
    description: 'Proposal acceptance window closes at noon.'
  }
];

const countdownGrid = document.getElementById('countdownGrid');

function createCard(item) {
  const card = document.createElement('article');
  card.className = 'countdown-card';

  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div>
      <p class="card-type">${item.type}</p>
      <h2 class="card-title">${item.title}</h2>
    </div>
    <span class="status-pill status-normal" aria-live="polite">Syncing...</span>
  `;

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="countdown-value">
      <div class="value-item"><p class="value-label">Days</p><p class="value-number" data-unit="days">--</p></div>
      <div class="value-item"><p class="value-label">Hours</p><p class="value-number" data-unit="hours">--</p></div>
      <div class="value-item"><p class="value-label">Minutes</p><p class="value-number" data-unit="minutes">--</p></div>
      <div class="value-item"><p class="value-label">Seconds</p><p class="value-number" data-unit="seconds">--</p></div>
    </div>
    <p class="countdown-meta">${item.description}<br>Due: ${new Date(item.deadline).toLocaleString()}</p>
  `;

  card.append(header, body);
  return card;
}

function getTimeOffset() {
  const serverTime = new Date();
  const clientTime = new Date();
  return serverTime.getTime() - clientTime.getTime();
}

function updateCountdown(card, item, offset) {
  const now = new Date(Date.now() + offset);
  const target = new Date(item.deadline);
  const delta = target - now;
  const values = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (delta > 0) {
    values.days = Math.floor(delta / (1000 * 60 * 60 * 24));
    values.hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
    values.minutes = Math.floor((delta / (1000 * 60)) % 60);
    values.seconds = Math.floor((delta / 1000) % 60);
  }

  for (const unit in values) {
    const node = card.querySelector(`[data-unit="${unit}"]`);
    if (node) {
      node.textContent = String(values[unit]).padStart(2, '0');
    }
  }

  const status = card.querySelector('.status-pill');
  const urgentThreshold = 24 * 60 * 60 * 1000;
  if (delta <= 0) {
    status.textContent = 'Deadline reached';
    status.className = 'status-pill status-urgent';
    card.style.borderColor = 'rgba(249, 115, 22, 0.5)';
  } else if (delta <= urgentThreshold) {
    status.textContent = 'Urgent - under 24h';
    status.className = 'status-pill status-urgent';
    card.style.borderColor = 'rgba(249, 115, 22, 0.5)';
  } else {
    status.textContent = 'On track';
    status.className = 'status-pill status-normal';
    card.style.borderColor = 'rgba(34, 197, 94, 0.4)';
  }
}

function initializeCountdowns() {
  const offset = getTimeOffset();

  countdownData.forEach(item => {
    const card = createCard(item);
    countdownGrid.appendChild(card);
    updateCountdown(card, item, offset);

    setInterval(() => updateCountdown(card, item, offset), 1000);
  });
}

initializeCountdowns();
