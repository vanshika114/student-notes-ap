/**
 * hydration.js
 * Daily water intake tracker with glasses counter, goal progress,
 * a reminder interval timer, and full localStorage persistence.
 * Emits 'hydration:goal-reached' when daily goal is met.
 */

const Hydration = (() => {
  // ── State ────────────────────────────────────────────────────────────────
  let glasses = 0;
  let dailyGoal = 8;
  let reminderMinutes = 30;
  let reminderIntervalId = null;
  let goalReachedToday = false;

  const GLASS_ML = 250; // ml per glass

  // ── Persistence ──────────────────────────────────────────────────────────
  function save() {
    const today = new Date().toDateString();
    localStorage.setItem('hydro_data', JSON.stringify({
      date: today,
      glasses,
      dailyGoal,
      reminderMinutes,
      goalReachedToday,
    }));
  }

  function load() {
    const today = new Date().toDateString();
    try {
      const saved = JSON.parse(localStorage.getItem('hydro_data') || '{}');
      if (saved.date === today) {
        glasses = saved.glasses || 0;
        goalReachedToday = saved.goalReachedToday || false;
      } else {
        glasses = 0;
        goalReachedToday = false;
      }
      dailyGoal = saved.dailyGoal || 8;
      reminderMinutes = saved.reminderMinutes || 30;
    } catch (e) {
      glasses = 0;
      dailyGoal = 8;
      reminderMinutes = 30;
      goalReachedToday = false;
    }
  }

  // ── DOM render ────────────────────────────────────────────────────────────
  function render() {
    const countEl = document.getElementById('hydro-count');
    const goalEl = document.getElementById('hydro-goal-display');
    const mlEl = document.getElementById('hydro-ml');
    const percentEl = document.getElementById('hydro-percent');
    const barEl = document.getElementById('hydro-bar-fill');
    const glassGrid = document.getElementById('glass-grid');

    const pct = Math.min(100, Math.round((glasses / dailyGoal) * 100));
    const ml = glasses * GLASS_ML;

    if (countEl) countEl.textContent = glasses;
    if (goalEl) goalEl.textContent = dailyGoal;
    if (mlEl) mlEl.textContent = `${ml} ml`;
    if (percentEl) percentEl.textContent = `${pct}%`;
    if (barEl) {
      barEl.style.width = `${pct}%`;
      barEl.className = 'hydro-bar__fill' +
        (pct >= 100 ? ' hydro-bar__fill--complete' :
         pct >= 50 ? ' hydro-bar__fill--mid' : '');
    }

    // Update reminder input
    const remInput = document.getElementById('hydro-reminder-input');
    if (remInput) remInput.value = reminderMinutes;
    const goalInput = document.getElementById('hydro-goal-input');
    if (goalInput) goalInput.value = dailyGoal;

    // Render glass grid
    if (glassGrid) {
      glassGrid.innerHTML = '';
      for (let i = 0; i < dailyGoal; i++) {
        const g = document.createElement('div');
        g.className = 'glass-icon' + (i < glasses ? ' glass-icon--filled' : '');
        g.innerHTML = `<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2h16l-2 28H6L4 2z" stroke="currentColor" stroke-width="1.5" fill="${i < glasses ? 'currentColor' : 'none'}" opacity="${i < glasses ? 0.7 : 0.3}"/>
          <path d="M6 8h12" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        </svg>`;
        g.title = i < glasses ? `Glass ${i + 1} — drunk ✓` : `Glass ${i + 1} — not yet`;
        glassGrid.appendChild(g);
      }
    }

    // Update stat card
    const statEl = document.getElementById('hydro-stat');
    if (statEl) statEl.textContent = `${glasses}/${dailyGoal}`;
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  function addGlass() {
    if (glasses >= dailyGoal * 2) {
      Celebrations.showToast("You've already had a lot of water today! 😄", 'info');
      return;
    }
    glasses++;
    save();
    render();
    animateGlassAdd();
    checkGoal();
  }

  function removeGlass() {
    if (glasses <= 0) return;
    glasses--;
    goalReachedToday = false; // allow re-celebration
    save();
    render();
  }

  function checkGoal() {
    if (glasses >= dailyGoal && !goalReachedToday) {
      goalReachedToday = true;
      save();
      document.dispatchEvent(new CustomEvent('hydration:goal-reached', { detail: { glasses, dailyGoal } }));
    }
  }

  function animateGlassAdd() {
    const countEl = document.getElementById('hydro-count');
    if (!countEl) return;
    countEl.classList.remove('hydro-pop');
    void countEl.offsetWidth; // reflow
    countEl.classList.add('hydro-pop');
    setTimeout(() => countEl.classList.remove('hydro-pop'), 400);
  }

  // ── Reminder ──────────────────────────────────────────────────────────────
  function startReminder() {
    stopReminder();
    reminderIntervalId = setInterval(() => {
      if (typeof Celebrations !== 'undefined') {
        Celebrations.showToast(`💧 Time to drink water! (${glasses}/${dailyGoal} glasses today)`, 'reminder');
      }
    }, reminderMinutes * 60 * 1000);

    const statusEl = document.getElementById('reminder-status');
    if (statusEl) statusEl.textContent = `Reminder every ${reminderMinutes} min — active ✓`;
    Celebrations.showToast(`⏰ Water reminder set every ${reminderMinutes} minutes!`, 'info');
  }

  function stopReminder() {
    if (reminderIntervalId) {
      clearInterval(reminderIntervalId);
      reminderIntervalId = null;
    }
    const statusEl = document.getElementById('reminder-status');
    if (statusEl) statusEl.textContent = 'Reminder off';
  }

  function setGoal(newGoal) {
    dailyGoal = Math.max(1, Math.min(20, parseInt(newGoal) || 8));
    save();
    render();
  }

  function setReminder(mins) {
    reminderMinutes = Math.max(5, parseInt(mins) || 30);
    save();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    load();

    document.getElementById('hydro-add')?.addEventListener('click', addGlass);
    document.getElementById('hydro-remove')?.addEventListener('click', removeGlass);

    document.getElementById('hydro-set-goal')?.addEventListener('click', () => {
      const input = document.getElementById('hydro-goal-input');
      if (input) setGoal(input.value);
      Celebrations.showToast(`🎯 Daily goal set to ${dailyGoal} glasses!`, 'info');
    });

    document.getElementById('hydro-reminder-start')?.addEventListener('click', () => {
      const input = document.getElementById('hydro-reminder-input');
      if (input) setReminder(input.value);
      startReminder();
    });

    document.getElementById('hydro-reminder-stop')?.addEventListener('click', stopReminder);

    render();
  }

  return { init, addGlass, removeGlass, getGlasses: () => glasses, getGoal: () => dailyGoal };
})();
