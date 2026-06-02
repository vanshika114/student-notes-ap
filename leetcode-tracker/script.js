// Constants & Initial Data
const STORAGE_KEY = 'lc_tracker_data';
const MAX_EASY = 800;
const MAX_MEDIUM = 1600;
const MAX_HARD = 700;

const DEFAULT_DATA = {
  solved: { easy: 0, medium: 0, hard: 0 },
  topics: {
    'Arrays': 0, 'Strings': 0, 'Dynamic Programming': 0, 'Trees': 0,
    'Graphs': 0, 'Linked Lists': 0, 'Sorting': 0, 'Binary Search': 0,
    'Stack/Queue': 0, 'Greedy': 0
  },
  activity: [],
  lastActiveDate: null,
  streak: 0
};

let appData = null;
let currentActivityFilter = 'all';
let currentTopicSearch = '';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initUI();
  initQuotes();
  renderAll();
});

// Load & Save
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    appData = JSON.parse(stored);
    checkStreak();
  } else {
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function checkStreak() {
  const today = new Date().toDateString();
  if (appData.lastActiveDate) {
    const lastDate = new Date(appData.lastActiveDate);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      appData.streak = 0; // Reset streak
    }
  }
}

// UI Initialization
function initUI() {
  // Modal toggle
  const fab = document.getElementById('fab-add');
  const modal = document.getElementById('add-modal');
  const closeBtn = document.getElementById('close-modal');
  
  fab.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Form submit
  document.getElementById('add-form').addEventListener('submit', addProblem);

  // Topic search
  const topicSearch = document.getElementById('topic-search');
  if (topicSearch) {
    topicSearch.addEventListener('input', (e) => {
      currentTopicSearch = e.target.value.toLowerCase();
      renderTopics();
    });
  }

  // Activity filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentActivityFilter = e.target.getAttribute('data-filter');
      renderActivity();
    });
  });

  // Quick Add FABs
  document.querySelectorAll('.fab-mini').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const diff = e.target.getAttribute('data-diff');
      document.getElementById('difficulty').value = diff;
      modal.classList.add('active');
      document.getElementById('problem-name').focus();
    });
  });
}

// Daily Quotes Logic
const DEV_QUOTES = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Clean code always looks like it was written by someone who cares.", author: "Robert C. Martin" },
  { text: "Truth can only be found in one place: the code.", author: "Robert C. Martin" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In order to understand recursion, one must first understand recursion.", author: "Unknown" },
  { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "Dan Salomon" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "A good programmer is someone who always looks both ways before crossing a one-way street.", author: "Doug Linder" }
];

let currentQuoteIndex = 0;

function initQuotes() {
  const quoteText = document.getElementById('daily-quote');
  const quoteAuthor = document.getElementById('daily-author');
  const newQuoteBtn = document.getElementById('new-quote-btn');
  
  // Pick quote based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  currentQuoteIndex = dayOfYear % DEV_QUOTES.length;
  
  const displayQuote = () => {
    quoteText.style.opacity = '0';
    quoteAuthor.style.opacity = '0';
    
    setTimeout(() => {
      quoteText.innerText = `"${DEV_QUOTES[currentQuoteIndex].text}"`;
      quoteAuthor.innerText = `- ${DEV_QUOTES[currentQuoteIndex].author}`;
      quoteText.style.opacity = '1';
      quoteAuthor.style.opacity = '1';
    }, 300);
  };
  
  displayQuote();
  
  newQuoteBtn.addEventListener('click', () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * DEV_QUOTES.length);
    } while (nextIndex === currentQuoteIndex && DEV_QUOTES.length > 1);
    currentQuoteIndex = nextIndex;
    displayQuote();
  });
}

// Animation helpers
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // easeOutQuart
    const ease = 1 - Math.pow(1 - progress, 4);
    obj.innerHTML = Math.floor(ease * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Render Functions
function renderAll() {
  renderStats();
  renderProgress();
  renderTopics();
  renderActivity();
  renderHeatmap();
}

function renderStats() {
  const total = appData.solved.easy + appData.solved.medium + appData.solved.hard;
  const todayStr = new Date().toDateString();
  const todayCount = appData.activity.filter(a => new Date(a.timestamp).toDateString() === todayStr).length;
  
  const targetTotal = MAX_EASY + MAX_MEDIUM + MAX_HARD;
  const acceptance = total === 0 ? 0 : Math.round((total / targetTotal) * 100);

  animateValue(document.getElementById('stat-total'), 0, total, 1500);
  animateValue(document.getElementById('stat-today'), 0, todayCount, 1500);
  animateValue(document.getElementById('stat-streak'), 0, appData.streak, 1500);
  animateValue(document.getElementById('stat-acceptance'), 0, acceptance, 1500);
  animateValue(document.getElementById('header-streak'), 0, appData.streak, 1500);
}

function renderProgress() {
  const { easy, medium, hard } = appData.solved;
  const total = easy + medium + hard;
  
  animateValue(document.getElementById('count-easy'), 0, easy, 1500);
  animateValue(document.getElementById('count-medium'), 0, medium, 1500);
  animateValue(document.getElementById('count-hard'), 0, hard, 1500);
  animateValue(document.getElementById('donut-total'), 0, total, 1500);

  const pEasy = total === 0 ? 0 : Math.round((easy / total) * 100);
  const pMedium = total === 0 ? 0 : Math.round((medium / total) * 100);
  const pHard = total === 0 ? 0 : Math.round((hard / total) * 100);

  setTimeout(() => {
    document.getElementById('fill-easy').style.width = `${Math.min((easy / MAX_EASY) * 100, 100)}%`;
    document.getElementById('fill-medium').style.width = `${Math.min((medium / MAX_MEDIUM) * 100, 100)}%`;
    document.getElementById('fill-hard').style.width = `${Math.min((hard / MAX_HARD) * 100, 100)}%`;
  }, 100);

  // Set Tooltips on Progress Tracks
  document.getElementById('fill-easy').parentElement.setAttribute('data-tooltip', `${pEasy}% of solved • ${MAX_EASY - easy} to goal`);
  document.getElementById('fill-medium').parentElement.setAttribute('data-tooltip', `${pMedium}% of solved • ${MAX_MEDIUM - medium} to goal`);
  document.getElementById('fill-hard').parentElement.setAttribute('data-tooltip', `${pHard}% of solved • ${MAX_HARD - hard} to goal`);

  // Update Donut Chart
  if (total > 0) {
    const pEasy = (easy / total) * 100;
    const pMedium = (medium / total) * 100;
    const donut = document.getElementById('donut-chart');
    donut.style.background = `conic-gradient(
      var(--color-easy) 0% ${pEasy}%,
      var(--color-medium) ${pEasy}% ${pEasy + pMedium}%,
      var(--color-hard) ${pEasy + pMedium}% 100%
    )`;
  } else {
    const donut = document.getElementById('donut-chart');
    donut.style.background = `conic-gradient(
      var(--color-easy) 0% 0%,
      var(--color-medium) 0% 0%,
      var(--color-hard) 0% 0%
    )`;
  }
}

function renderTopics() {
  const list = document.getElementById('topic-list');
  list.innerHTML = '';
  const maxTopicVal = Math.max(...Object.values(appData.topics), 50); // Min 50 for scale

  Object.entries(appData.topics).forEach(([topic, count]) => {
    if (currentTopicSearch && !topic.toLowerCase().includes(currentTopicSearch)) {
      return; // Filter out by search
    }

    const item = document.createElement('div');
    item.className = 'topic-item';
    
    const pct = (count / maxTopicVal) * 100;
    
    item.innerHTML = `
      <div class="topic-label">${topic}</div>
      <div class="topic-progress-track">
        <div class="topic-progress-fill" style="width: 0%"></div>
      </div>
      <div class="topic-count" data-topic="${topic}">
        <span>${count} / ${maxTopicVal}</span>
        <input type="number" class="topic-edit" value="${count}" min="0">
      </div>
    `;
    list.appendChild(item);

    setTimeout(() => {
      item.querySelector('.topic-progress-fill').style.width = `${pct}%`;
    }, 100);

    // Inline edit logic
    const countDiv = item.querySelector('.topic-count');
    const input = countDiv.querySelector('.topic-edit');
    
    countDiv.addEventListener('click', (e) => {
      if(e.target !== input) {
        countDiv.classList.add('editing');
        input.focus();
        input.select();
      }
    });

    input.addEventListener('blur', () => {
      updateTopic(topic, parseInt(input.value) || 0);
      countDiv.classList.remove('editing');
    });
    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') input.blur();
    });
  });
}

function updateTopic(topic, newVal) {
  appData.topics[topic] = newVal;
  saveData();
  renderTopics();
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  list.innerHTML = '';
  
  // Last 10 items based on filter
  let filteredActivity = appData.activity;
  if (currentActivityFilter !== 'all') {
    filteredActivity = filteredActivity.filter(a => a.difficulty === currentActivityFilter);
  }
  const recent = [...filteredActivity].reverse().slice(0, 10);
  
  if (recent.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted); font-size: 0.875rem; text-align:center; padding: 1rem;">No recent activity</div>';
    return;
  }

  recent.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    const date = new Date(item.timestamp);
    const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    div.innerHTML = `
      <div class="activity-main">
        <div class="activity-name">${item.name}</div>
        <div class="activity-meta">
          <span class="badge ${item.difficulty}">${item.difficulty}</span>
          <span>${item.topic}</span>
          <span>•</span>
          <span>${dateStr}</span>
        </div>
      </div>
      <div class="activity-actions">
        <button class="btn-delete" data-id="${item.id}" aria-label="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    list.appendChild(div);

    div.querySelector('.btn-delete').addEventListener('click', () => deleteProblem(item.id));
  });
}

function deleteProblem(id) {
  const index = appData.activity.findIndex(a => a.id === id);
  if (index > -1) {
    const item = appData.activity[index];
    appData.solved[item.difficulty] = Math.max(0, appData.solved[item.difficulty] - 1);
    appData.topics[item.topic] = Math.max(0, appData.topics[item.topic] - 1);
    appData.activity.splice(index, 1);
    saveData();
    renderAll();
  }
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  container.innerHTML = '';
  
  // Generate last 180 days (approx 26 weeks)
  const days = 180;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Group activity by date string
  const activityByDate = {};
  appData.activity.forEach(a => {
    const dStr = new Date(a.timestamp).toDateString();
    activityByDate[dStr] = (activityByDate[dStr] || 0) + 1;
  });

  const columns = Math.ceil(days / 7);
  let currentDate = new Date(today);
  currentDate.setDate(today.getDate() - days + 1);

  // Adjust to start on a Sunday
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  const msPerDay = 24 * 60 * 60 * 1000;

  for (let c = 0; c < columns + 1; c++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'heatmap-column';
    
    for (let r = 0; r < 7; r++) {
      if (currentDate > today) break;
      
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      
      const dStr = currentDate.toDateString();
      const count = activityByDate[dStr] || 0;
      
      if (count === 1) cell.classList.add('level-1');
      else if (count === 2) cell.classList.add('level-2');
      else if (count === 3) cell.classList.add('level-3');
      else if (count >= 4) cell.classList.add('level-4');

      const formattedDate = currentDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      cell.setAttribute('data-tooltip', `${count} problems on ${formattedDate}`);
      
      colDiv.appendChild(cell);
      currentDate = new Date(currentDate.getTime() + msPerDay);
    }
    container.appendChild(colDiv);
  }
}

function addProblem(e) {
  e.preventDefault();
  
  const name = document.getElementById('problem-name').value.trim();
  const diff = document.getElementById('difficulty').value;
  const topic = document.getElementById('topic').value;
  const notes = document.getElementById('notes').value.trim();
  
  if (!name) return;

  const todayStr = new Date().toDateString();
  
  // Check streak update
  if (appData.lastActiveDate) {
    const lastStr = new Date(appData.lastActiveDate).toDateString();
    if (lastStr !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastStr === yesterday.toDateString()) {
        appData.streak++;
      } else {
        appData.streak = 1; // Reset if missed a day
      }
    }
  } else {
    appData.streak = 1;
  }
  
  appData.lastActiveDate = new Date().toISOString();
  
  // Update counts
  appData.solved[diff]++;
  appData.topics[topic] = (appData.topics[topic] || 0) + 1;
  
  // Add to activity
  appData.activity.push({
    id: Date.now().toString(),
    name,
    difficulty: diff,
    topic,
    notes,
    timestamp: new Date().toISOString()
  });

  saveData();
  
  // Reset and close modal
  document.getElementById('add-form').reset();
  document.getElementById('add-modal').classList.remove('active');
  
  // Re-render
  renderAll();
}
