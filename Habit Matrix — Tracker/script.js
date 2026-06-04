/* ═══════════════════════════════════════════════════════
   HABIT MATRIX — Client-Side Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── State ───
  let habits = [];
  let undoQueue = null;
  let undoTimeout = null;

  const STORAGE_KEY = 'habitMatrixData';
  const UNDO_DURATION = 4000;

  const QUOTES = [
    'Small daily improvements over time lead to stunning results.',
    'The secret of getting ahead is getting started.',
    'You don\'t have to be extreme, just consistent.',
    'Success is the sum of small efforts repeated day in and day out.',
    'The habit of persistence is the habit of victory.',
    'Motivation gets you started. Habit keeps you going.',
    'Every action you take is a vote for the type of person you wish to become.',
    'Be the designer of your world and not merely the consumer of it.',
    'Discipline is choosing between what you want now and what you want most.',
    'Your habits shape your identity. Your identity shapes your life.',
  ];

  const CATEGORY_COLORS = {
    Health: '#10b981',
    Mind: '#8b5cf6',
    Fitness: '#f59e0b',
    Productivity: '#06b6d4',
    Social: '#ec4899',
    Creative: '#f97316',
  };

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ─── DOM refs ───
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.form = $('#habit-form');
    dom.titleInput = $('#habit-title');
    dom.freqSelect = $('#habit-frequency');
    dom.catSelect = $('#habit-category');
    dom.grid = $('#habit-grid');
    dom.emptyState = $('#empty-state');
    dom.dayLabels = $('#day-labels');
    dom.statTotal = $('#stat-total');
    dom.statRate = $('#stat-today-rate');
    dom.quoteText = $('#quote-text');
    dom.quoteRefresh = $('#quote-refresh');
    dom.modalOverlay = $('#modal-overlay');
    dom.modalClose = $('#modal-close');
    dom.modalBody = $('#modal-body');
    dom.modalTitle = $('#modal-title');
    dom.toast = $('#toast');
    dom.toastMsg = $('#toast-msg');
    dom.toastUndo = $('#toast-undo');
    dom.toastContainer = $('#toast-container');
  }

  // ─── Storage ───
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        habits = JSON.parse(raw);
        if (!Array.isArray(habits)) habits = [];
      }
    } catch {
      habits = [];
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch {
      /* quota exceeded — silently degrade */
    }
  }

  // ─── Date helpers ───
  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push({
        date: `${y}-${m}-${dd}`,
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ─── Metrics ───
  function calculateStreak(logs) {
    let streak = 0;
    const d = new Date();
    while (true) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${dd}`;
      if (logs[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function calculateRate(logs) {
    const days = getLast7Days();
    const total = days.length;
    if (total === 0) return 0;
    const checked = days.filter((d) => logs[d.date]).length;
    return Math.round((checked / total) * 100);
  }

  function getTodayRate() {
    const today = todayStr();
    if (habits.length === 0) return 0;
    const checked = habits.filter((h) => h.logs[today]).length;
    return Math.round((checked / habits.length) * 100);
  }

  function getRateColor(rate) {
    if (rate >= 70) return 'high';
    if (rate >= 40) return 'mid';
    return 'low';
  }

  function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push({
        date: `${y}-${m}-${dd}`,
        dayNum: d.getDate(),
        isFuture: i < 0,
        isToday: i === 0,
      });
    }
    return days;
  }

  // ─── Quotes ───
  let currentQuoteIdx = -1;

  function getRandomQuote() {
    let idx;
    do {
      idx = Math.floor(Math.random() * QUOTES.length);
    } while (idx === currentQuoteIdx && QUOTES.length > 1);
    currentQuoteIdx = idx;
    return QUOTES[idx];
  }

  function updateQuote() {
    dom.quoteText.textContent = getRandomQuote();
  }

  // ─── Toast / Undo ───
  function showToast(msg, onUndo) {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      undoTimeout = null;
    }

    dom.toastMsg.textContent = msg;
    dom.toast.classList.add('active');

    const handleUndo = () => {
      dom.toast.classList.remove('active');
      if (onUndo) onUndo();
      if (undoTimeout) {
        clearTimeout(undoTimeout);
        undoTimeout = null;
      }
      dom.toastUndo.removeEventListener('click', handleUndo);
    };

    dom.toastUndo.addEventListener('click', handleUndo, { once: true });

    undoTimeout = setTimeout(() => {
      dom.toast.classList.remove('active');
      dom.toastUndo.removeEventListener('click', handleUndo);
      undoTimeout = null;
    }, UNDO_DURATION);
  }

  function hideToast() {
    dom.toast.classList.remove('active');
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      undoTimeout = null;
    }
  }

  // ─── CRUD ───
  function addHabit(title, frequency, category) {
    const habit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: title.trim(),
      frequency,
      category,
      createdAt: new Date().toISOString(),
      logs: {},
    };
    habits.push(habit);
    saveState();
    render();
    dom.titleInput.value = '';
    dom.titleInput.focus();
  }

  function deleteHabit(id) {
    const idx = habits.findIndex((h) => h.id === id);
    if (idx === -1) return;
    const removed = habits[idx];
    habits.splice(idx, 1);
    saveState();
    render();

    showToast(`"${removed.title}" deleted`, () => {
      habits.splice(idx, 0, removed);
      saveState();
      render();
    });
  }

  function toggleDay(id, dateStr) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    habit.logs[dateStr] = !habit.logs[dateStr];
    saveState();
    render();
  }

  function clearProgress(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const oldLogs = { ...habit.logs };
    habit.logs = {};
    saveState();
    render();

    showToast(`Progress for "${habit.title}" cleared`, () => {
      habit.logs = oldLogs;
      saveState();
      render();
    });
  }

  // ─── Render ───
  function render() {
    renderDayLabels();
    renderHabits();
    renderStats();
  }

  function renderDayLabels() {
    const days = getLast7Days();
    dom.dayLabels.innerHTML = days
      .map(
        (d) =>
          `<span class="day-node" style="cursor:default;gap:2px">
            <span class="day-label">${d.dayName}</span>
            <span class="day-num">${d.dayNum}</span>
          </span>`
      )
      .join('');
  }

  function renderHabits() {
    if (habits.length === 0) {
      dom.grid.innerHTML = '';
      dom.emptyState.classList.remove('hidden');
      return;
    }
    dom.emptyState.classList.add('hidden');

    dom.grid.innerHTML = habits
      .map((habit) => renderCard(habit))
      .join('');

    // attach data attributes for category colors
    habits.forEach((h) => {
      const card = dom.grid.querySelector(`[data-id="${h.id}"]`);
      if (card) {
        const dot = card.querySelector('.category-dot');
        if (dot) dot.style.color = CATEGORY_COLORS[h.category] || '#94a3b8';
        const fill = card.querySelector('.rate-bar-fill');
        if (fill) fill.style.width = `${calculateRate(h.logs)}%`;
      }
    });
  }

  function renderCard(habit) {
    const days = getLast7Days();
    const streak = calculateStreak(habit.logs);
    const rate = calculateRate(habit.logs);
    const rateColor = getRateColor(rate);

    const dayNodes = days
      .map((d) => {
        const checked = !!habit.logs[d.date];
        const broken = false; // no longer tracking broken streaks per node
        const classes = ['day-circle'];
        if (checked) classes.push('checked');
        if (d.isToday) classes.push('today');

        return `<div class="day-node" data-date="${d.date}" data-habit="${habit.id}">
          <div class="${classes.join(' ')}">${checked ? '✓' : ''}</div>
        </div>`;
      })
      .join('');

    const streakDisplay =
      streak > 0
        ? `<span class="streak-fire">🔥</span> ${streak}`
        : `<span class="streak-zero">—</span>`;

    return `<div class="habit-card" data-id="${habit.id}" data-category="${habit.category}">
      <div class="habit-title-block">
        <span class="category-dot"></span>
        <span class="habit-title">${escapeHtml(habit.title)}</span>
        <span class="habit-freq">${habit.frequency}</span>
      </div>
      <div class="habit-streak">${streakDisplay}</div>
      <div class="habit-rate">
        ${rate}%
        <div class="rate-bar-bg">
          <div class="rate-bar-fill ${rateColor}" style="width:0%"></div>
        </div>
      </div>
      <div class="day-nodes">${dayNodes}</div>
      <div class="habit-actions">
        <button class="btn-action info" data-action="insights" data-id="${habit.id}">📊</button>
        <button class="btn-action" data-action="clear" data-id="${habit.id}" title="Clear progress">↺</button>
        <button class="btn-action danger" data-action="delete" data-id="${habit.id}" title="Delete habit">✕</button>
      </div>
    </div>`;
  }

  function renderStats() {
    dom.statTotal.textContent = habits.length;
    dom.statRate.textContent = getTodayRate() + '%';
  }

  // ─── Modal ───
  function openInsights(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    dom.modalTitle.textContent = habit.title;
    const streak = calculateStreak(habit.logs);
    const rate = calculateRate(habit.logs);
    const totalDays = Object.keys(habit.logs).length;
    const checkedDays = Object.keys(habit.logs).filter((d) => habit.logs[d]).length;
    const today = todayStr();
    const todayDone = habit.logs[today] ? 'Yes ✓' : 'Not yet';

    // 30-day mini grid
    const last30 = getLast30Days();
    const miniGrid = last30
      .map((d) => {
        const checked = !!habit.logs[d.date];
        const cls = ['mini-node'];
        if (checked) cls.push('checked');
        if (d.isFuture) cls.push('future');
        return `<span class="${cls.join(' ')}">${checked ? '✓' : '·'}</span>`;
      })
      .join('');

    dom.modalBody.innerHTML = `
      <div class="insight-row">
        <span class="insight-label">Category</span>
        <span class="insight-value" style="color:${CATEGORY_COLORS[habit.category] || '#94a3b8'}">${habit.category}</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">Frequency</span>
        <span class="insight-value">${habit.frequency}</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">Current Streak</span>
        <span class="insight-value">${streak > 0 ? '🔥 ' + streak : '—'}</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">7-Day Rate</span>
        <span class="insight-value">${rate}%</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">Total Tracked Days</span>
        <span class="insight-value">${totalDays} (${checkedDays} checked)</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">Today</span>
        <span class="insight-value">${todayDone}</span>
      </div>
      <div class="insight-row">
        <span class="insight-label">Created</span>
        <span class="insight-value">${formatDate(habit.createdAt.split('T')[0])}</span>
      </div>
      <div style="margin-top:4px">
        <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px">Last 30 Days</div>
        <div class="insight-grid">${miniGrid}</div>
      </div>
    `;

    dom.modalOverlay.classList.add('active');
  }

  function closeModal() {
    dom.modalOverlay.classList.remove('active');
  }

  // ─── Helpers ───
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Event listeners ───
  function setupEvents() {
    // Form submit
    dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = dom.titleInput.value.trim();
      if (!title) return;
      addHabit(title, dom.freqSelect.value, dom.catSelect.value);
    });

    // Quote refresh
    dom.quoteRefresh.addEventListener('click', updateQuote);

    // Modal close
    dom.modalClose.addEventListener('click', closeModal);
    dom.modalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Grid event delegation (clicks)
    dom.grid.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (target) {
        e.stopPropagation();
        const action = target.dataset.action;
        const id = target.dataset.id;
        if (action === 'delete') deleteHabit(id);
        else if (action === 'clear') clearProgress(id);
        else if (action === 'insights') openInsights(id);
        return;
      }

      // Day node toggle
      const dayNode = e.target.closest('.day-node');
      if (dayNode && dayNode.dataset.date && dayNode.dataset.habit) {
        const circle = dayNode.querySelector('.day-circle');
        if (circle) {
          circle.classList.remove('pop');
          // force reflow for animation replay
          void circle.offsetWidth;
          circle.classList.add('pop');
        }
        toggleDay(dayNode.dataset.habit, dayNode.dataset.date);
      }
    });
  }

  // ─── Init ───
  function init() {
    cacheDom();
    loadState();
    render();
    setupEvents();
    updateQuote();
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
