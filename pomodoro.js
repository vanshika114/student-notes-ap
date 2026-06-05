/**
 * pomodoro.js
 * Full Pomodoro timer with work/short-break/long-break cycles,
 * session counter, sound notifications, and customizable durations.
 * Emits custom DOM events consumed by stats.js and app.js.
 */

const Pomodoro = (() => {
  // ── State ────────────────────────────────────────────────────────────────
  const STATE = {
    WORK: 'work',
    SHORT_BREAK: 'short_break',
    LONG_BREAK: 'long_break',
  };

  let settings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  };

  let currentState = STATE.WORK;
  let timeLeft = settings.work * 60;
  let isRunning = false;
  let intervalId = null;
  let sessionCount = 0;        // completed work sessions today
  let cycleCount = 0;          // work sessions since last long break
  let totalFocusSeconds = 0;   // accumulated focus seconds this session

  // Linked task
  let linkedTaskId = null;

  // ── Audio (Web Audio API beep) ────────────────────────────────────────────
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playBeep(freq = 880, duration = 0.3, type = 'sine', volume = 0.4) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* audio blocked */ }
  }

  function playSessionEndSound() {
    playBeep(660, 0.2, 'sine');
    setTimeout(() => playBeep(880, 0.2, 'sine'), 250);
    setTimeout(() => playBeep(1100, 0.4, 'sine'), 500);
  }

  function playBreakEndSound() {
    playBeep(1100, 0.2, 'sine');
    setTimeout(() => playBeep(880, 0.2, 'sine'), 250);
    setTimeout(() => playBeep(660, 0.4, 'sine'), 500);
  }

  function playTickSound() {
    playBeep(1200, 0.05, 'square', 0.05);
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }

  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = `${pad(mins)}:${pad(secs)}`;

    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.textContent = display;

    // Update page title
    document.title = isRunning ? `${display} — Focus Dashboard` : 'Focus Dashboard';

    // Update progress ring
    const totalTime = getDuration(currentState) * 60;
    const progress = (totalTime - timeLeft) / totalTime;
    const ring = document.getElementById('timer-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 54; // r=54
      ring.style.strokeDashoffset = circumference * (1 - progress);
    }

    // Mode label
    const modeEl = document.getElementById('timer-mode-label');
    if (modeEl) {
      const labels = {
        [STATE.WORK]: '🎯 FOCUS',
        [STATE.SHORT_BREAK]: '☕ SHORT BREAK',
        [STATE.LONG_BREAK]: '🌿 LONG BREAK',
      };
      modeEl.textContent = labels[currentState];
    }

    // Session dots
    renderSessionDots();
  }

  function renderSessionDots() {
    const dotsEl = document.getElementById('session-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const interval = settings.longBreakInterval;
    for (let i = 0; i < interval; i++) {
      const dot = document.createElement('span');
      dot.className = 'session-dot' + (i < cycleCount ? ' session-dot--filled' : '');
      dotsEl.appendChild(dot);
    }
  }

  function updateSessionCounter() {
    const el = document.getElementById('session-count');
    if (el) el.textContent = sessionCount;
    const totalEl = document.getElementById('total-sessions-stat');
    if (totalEl) totalEl.textContent = sessionCount;
  }

  function updateTimerButtons() {
    const startBtn = document.getElementById('pomo-start');
    const pauseBtn = document.getElementById('pomo-pause');
    if (startBtn) startBtn.style.display = isRunning ? 'none' : 'flex';
    if (pauseBtn) pauseBtn.style.display = isRunning ? 'flex' : 'none';
  }

  function setTimerCardClass(state) {
    const card = document.getElementById('pomodoro-card');
    if (!card) return;
    card.classList.remove('mode--work', 'mode--short-break', 'mode--long-break');
    const map = {
      [STATE.WORK]: 'mode--work',
      [STATE.SHORT_BREAK]: 'mode--short-break',
      [STATE.LONG_BREAK]: 'mode--long-break',
    };
    card.classList.add(map[state]);
  }

  // ── Core timer logic ─────────────────────────────────────────────────────
  function getDuration(state) {
    if (state === STATE.WORK) return settings.work;
    if (state === STATE.SHORT_BREAK) return settings.shortBreak;
    return settings.longBreak;
  }

  function tick() {
    if (timeLeft > 0) {
      timeLeft--;
      if (currentState === STATE.WORK) totalFocusSeconds++;
      // Subtle tick in last 10 seconds
      if (timeLeft <= 10 && timeLeft > 0) playTickSound();
      updateDisplay();
    } else {
      onSessionEnd();
    }
  }

  function onSessionEnd() {
    clearInterval(intervalId);
    isRunning = false;
    updateTimerButtons();

    if (currentState === STATE.WORK) {
      // Completed a work session
      sessionCount++;
      cycleCount++;
      saveSessionData();
      updateSessionCounter();
      playSessionEndSound();

      // Emit event for stats + celebrations
      document.dispatchEvent(new CustomEvent('pomodoro:complete', {
        detail: { sessionCount, totalFocusSeconds, linkedTaskId }
      }));

      // Switch to break
      if (cycleCount >= settings.longBreakInterval) {
        cycleCount = 0;
        switchState(STATE.LONG_BREAK);
      } else {
        switchState(STATE.SHORT_BREAK);
      }
      // New quote on break
      if (typeof Quotes !== 'undefined') Quotes.display();

    } else {
      // Break ended → back to work
      playBreakEndSound();
      document.dispatchEvent(new CustomEvent('pomodoro:break-end'));
      switchState(STATE.WORK);
      if (typeof Quotes !== 'undefined') Quotes.display();
    }
  }

  function switchState(newState) {
    currentState = newState;
    timeLeft = getDuration(newState) * 60;
    isRunning = false;
    setTimerCardClass(newState);
    updateDisplay();
    updateTimerButtons();
  }

  // ── Public controls ──────────────────────────────────────────────────────
  function start() {
    if (isRunning) return;
    // Resume AudioContext on user gesture
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    isRunning = true;
    intervalId = setInterval(tick, 1000);
    updateTimerButtons();
    if (currentState === STATE.WORK) {
      if (typeof Quotes !== 'undefined') Quotes.display();
      document.dispatchEvent(new CustomEvent('pomodoro:start'));
    }
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(intervalId);
    updateTimerButtons();
  }

  function reset() {
    clearInterval(intervalId);
    isRunning = false;
    currentState = STATE.WORK;
    timeLeft = settings.work * 60;
    totalFocusSeconds = 0;
    updateDisplay();
    updateTimerButtons();
    setTimerCardClass(STATE.WORK);
  }

  function skipSession() {
    clearInterval(intervalId);
    isRunning = false;
    onSessionEnd();
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  function applySettings() {
    const workInput = document.getElementById('setting-work');
    const shortInput = document.getElementById('setting-short-break');
    const longInput = document.getElementById('setting-long-break');
    const intervalInput = document.getElementById('setting-interval');

    if (workInput) settings.work = Math.max(1, parseInt(workInput.value) || 25);
    if (shortInput) settings.shortBreak = Math.max(1, parseInt(shortInput.value) || 5);
    if (longInput) settings.longBreak = Math.max(1, parseInt(longInput.value) || 15);
    if (intervalInput) settings.longBreakInterval = Math.max(2, parseInt(intervalInput.value) || 4);

    localStorage.setItem('pomo_settings', JSON.stringify(settings));
    reset();
    Celebrations.showToast('⚙️ Timer settings updated!', 'info');
  }

  function loadSettings() {
    const saved = localStorage.getItem('pomo_settings');
    if (saved) {
      try {
        settings = { ...settings, ...JSON.parse(saved) };
      } catch(e) {}
    }
    // Populate fields
    const map = {
      'setting-work': settings.work,
      'setting-short-break': settings.shortBreak,
      'setting-long-break': settings.longBreak,
      'setting-interval': settings.longBreakInterval,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }

  // ── localStorage ─────────────────────────────────────────────────────────
  function saveSessionData() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    if (saved.date !== today) {
      saved.date = today;
      saved.sessions = 0;
      saved.focusMins = 0;
    }
    saved.sessions = (saved.sessions || 0) + 1;
    saved.focusMins = (saved.focusMins || 0) + settings.work;
    localStorage.setItem('pomo_data', JSON.stringify(saved));
  }

  function loadSessionData() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('pomo_data') || '{}');
    if (saved.date === today) {
      sessionCount = saved.sessions || 0;
    } else {
      sessionCount = 0;
    }
    updateSessionCounter();
  }

  // ── Task linking ─────────────────────────────────────────────────────────
  function linkTask(taskId) {
    linkedTaskId = taskId;
    const el = document.getElementById('linked-task-display');
    if (el) {
      const task = Todo ? Todo.getById(taskId) : null;
      el.textContent = task ? `🔗 ${task.text}` : '';
    }
  }

  function unlinkTask() {
    linkedTaskId = null;
    const el = document.getElementById('linked-task-display');
    if (el) el.textContent = '';
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    loadSettings();
    loadSessionData();

    document.getElementById('pomo-start')?.addEventListener('click', start);
    document.getElementById('pomo-pause')?.addEventListener('click', pause);
    document.getElementById('pomo-reset')?.addEventListener('click', reset);
    document.getElementById('pomo-skip')?.addEventListener('click', skipSession);
    document.getElementById('pomo-settings-apply')?.addEventListener('click', applySettings);

    setTimerCardClass(STATE.WORK);
    updateDisplay();
    updateTimerButtons();
  }

  return { init, start, pause, reset, skipSession, linkTask, unlinkTask, getSessionCount: () => sessionCount };
})();
