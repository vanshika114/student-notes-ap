/**
 * stats.js
 * Reads from localStorage and other modules to build:
 * - Daily summary stats
 * - Weekly productivity chart (pure CSS/SVG)
 * - Streak counter
 * - Achievement badges display
 */

const Stats = (() => {
  // ── Streak ────────────────────────────────────────────────────────────────
  function updateStreak() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('stats_streak') || '{}');

    if (data.lastActive === today) {
      // Already counted today
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (data.lastActive === yesterday.toDateString()) {
        data.count = (data.count || 0) + 1;
      } else {
        data.count = 1; // streak broken
      }
      data.lastActive = today;
      localStorage.setItem('stats_streak', JSON.stringify(data));
    }

    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = data.count || 1;
    const streakEl2 = document.getElementById('streak-stat');
    if (streakEl2) streakEl2.textContent = `${data.count || 1} day${(data.count || 1) !== 1 ? 's' : ''}`;
    return data.count || 1;
  }

  // ── Focus time display ─────────────────────────────────────────────────────
  function updateFocusTime() {
    const data = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    const today = new Date().toDateString();
    const mins = data.date === today ? (data.focusMins || 0) : 0;
    const el = document.getElementById('focus-time-stat');
    if (el) el.textContent = `${mins} min`;

    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    const el2 = document.getElementById('focus-time-display');
    if (el2) el2.textContent = hrs > 0 ? `${hrs}h ${rem}m` : `${mins}m`;
  }

  // ── Weekly chart ─────────────────────────────────────────────────────────
  function buildWeeklyData() {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `weekly_${d.toDateString()}`;
      const val = JSON.parse(localStorage.getItem(key) || '{"sessions":0,"tasks":0,"glasses":0}');
      result.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        sessions: val.sessions || 0,
        tasks: val.tasks || 0,
        glasses: val.glasses || 0,
      });
    }
    return result;
  }

  function saveToday() {
    const today = new Date().toDateString();
    const key = `weekly_${today}`;
    const pomoData = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    const hydroData = JSON.parse(localStorage.getItem('hydro_data') || '{}');
    const todoTasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');

    const sessions = pomoData.date === today ? (pomoData.sessions || 0) : 0;
    const glasses = hydroData.date === today ? (hydroData.glasses || 0) : 0;
    const tasks = todoTasks.filter(t => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt).toDateString() === today;
    }).length;

    localStorage.setItem(key, JSON.stringify({ sessions, tasks, glasses }));
  }

  function renderWeeklyChart() {
    const chartEl = document.getElementById('weekly-chart');
    if (!chartEl) return;
    const data = buildWeeklyData();
    const maxSessions = Math.max(1, ...data.map(d => d.sessions));
    const maxTasks = Math.max(1, ...data.map(d => d.tasks));

    chartEl.innerHTML = `
      <div class="weekly-chart__inner">
        ${data.map((day, i) => {
          const sessionH = Math.round((day.sessions / maxSessions) * 100);
          const taskH = Math.round((day.tasks / maxTasks) * 100);
          const isToday = i === 6;
          return `
            <div class="weekly-col ${isToday ? 'weekly-col--today' : ''}">
              <div class="weekly-bars">
                <div class="weekly-bar weekly-bar--sessions" style="height:${sessionH}%"
                     title="${day.sessions} sessions"></div>
                <div class="weekly-bar weekly-bar--tasks" style="height:${taskH}%"
                     title="${day.tasks} tasks"></div>
              </div>
              <span class="weekly-label">${day.label}</span>
            </div>`;
        }).join('')}
      </div>
      <div class="weekly-legend">
        <span class="legend-dot legend-dot--sessions"></span> Sessions
        <span class="legend-dot legend-dot--tasks"></span> Tasks
      </div>`;
  }

  // ── Productivity score ────────────────────────────────────────────────────
  function calcProductivityScore() {
    const pomoData = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    const hydroData = JSON.parse(localStorage.getItem('hydro_data') || '{}');
    const todoTasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');
    const today = new Date().toDateString();

    const sessions = pomoData.date === today ? (pomoData.sessions || 0) : 0;
    const glasses = hydroData.date === today ? (hydroData.glasses || 0) : 0;
    const goal = hydroData.dailyGoal || 8;
    const doneTasks = todoTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;

    // Score: sessions(40%) + hydration(30%) + tasks(30%)
    const sessionScore = Math.min(40, sessions * 8);
    const hydroScore = Math.min(30, Math.round((glasses / goal) * 30));
    const taskScore = Math.min(30, doneTasks * 6);
    const total = sessionScore + hydroScore + taskScore;

    const scoreEl = document.getElementById('productivity-score');
    if (scoreEl) scoreEl.textContent = total;
    const scoreFill = document.getElementById('productivity-score-fill');
    if (scoreFill) scoreFill.style.width = `${total}%`;
    const scoreLabel = document.getElementById('productivity-score-label');
    if (scoreLabel) {
      scoreLabel.textContent = total >= 80 ? '🔥 Excellent' :
        total >= 55 ? '💪 Good' :
        total >= 30 ? '📈 Building' : '🌱 Just Starting';
    }

    return total;
  }

  // ── Badges ────────────────────────────────────────────────────────────────
  const ALL_BADGES = [
    { id: 'first_pomo', icon: '🍅', name: 'First Focus', desc: 'Complete your first Pomodoro' },
    { id: 'five_pomos', icon: '🔥', name: 'On Fire', desc: '5 Pomodoros in a day' },
    { id: 'ten_pomos', icon: '⚡', name: 'Lightning', desc: '10 total Pomodoros' },
    { id: 'hydration_hero', icon: '💧', name: 'Hydration Hero', desc: 'Reach daily water goal' },
    { id: 'task_master', icon: '✅', name: 'Task Master', desc: 'Complete 10 tasks' },
    { id: 'streak_3', icon: '📅', name: 'Consistent', desc: '3-day streak' },
    { id: 'streak_7', icon: '🏆', name: 'Week Warrior', desc: '7-day streak' },
    { id: 'early_bird', icon: '🌅', name: 'Early Bird', desc: 'Start a session before 8 AM' },
    { id: 'night_owl', icon: '🦉', name: 'Night Owl', desc: 'Complete a session after 10 PM' },
  ];

  function renderBadges() {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;
    const earned = JSON.parse(localStorage.getItem('stats_badges') || '[]');

    grid.innerHTML = ALL_BADGES.map(b => `
      <div class="badge-card ${earned.includes(b.id) ? 'badge-card--earned' : 'badge-card--locked'}"
           title="${b.desc}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        ${!earned.includes(b.id) ? '<span class="badge-lock">🔒</span>' : ''}
      </div>
    `).join('');
  }

  // ── Check badge conditions ────────────────────────────────────────────────
  function checkBadges() {
    const pomoData = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    const today = new Date().toDateString();
    const todaySessions = pomoData.date === today ? (pomoData.sessions || 0) : 0;
    const totalTasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]').filter(t => t.completed).length;
    const streak = JSON.parse(localStorage.getItem('stats_streak') || '{}').count || 1;
    const hour = new Date().getHours();

    if (todaySessions >= 1) Celebrations.awardBadge('first_pomo', 'First Focus', '🍅');
    if (todaySessions >= 5) Celebrations.awardBadge('five_pomos', 'On Fire', '🔥');
    if (totalTasks >= 10) Celebrations.awardBadge('task_master', 'Task Master', '✅');
    if (streak >= 3) Celebrations.awardBadge('streak_3', 'Consistent', '📅');
    if (streak >= 7) Celebrations.awardBadge('streak_7', 'Week Warrior', '🏆');
    if (hour < 8) Celebrations.awardBadge('early_bird', 'Early Bird', '🌅');
    if (hour >= 22) Celebrations.awardBadge('night_owl', 'Night Owl', '🦉');
  }

  // ── Full refresh ──────────────────────────────────────────────────────────
  function refresh() {
    saveToday();
    updateStreak();
    updateFocusTime();
    calcProductivityScore();
    renderWeeklyChart();
    renderBadges();
    checkBadges();
  }

  function init() {
    refresh();
    // Refresh stats every minute
    setInterval(refresh, 60000);

    // Listen to module events
    document.addEventListener('pomodoro:complete', () => { saveToday(); refresh(); });
    document.addEventListener('todo:task-completed', () => { saveToday(); refresh(); });
    document.addEventListener('hydration:goal-reached', () => { saveToday(); refresh(); });
  }

  return { init, refresh, renderBadges, calcProductivityScore };
})();
