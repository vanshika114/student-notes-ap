/**
 * app.js
 * Main orchestrator — initializes all modules, wires cross-module events,
 * handles theme toggle, navigation, and daily streak on load.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Init all modules ───────────────────────────────────────────────────
  Quotes.display();
  Pomodoro.init();
  Hydration.init();
  Todo.init();
  Stats.init();

  // ── Theme ──────────────────────────────────────────────────────────────
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ── Mobile nav ─────────────────────────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.section;
      document.querySelectorAll('.section').forEach(s => {
        s.classList.toggle('section--active', s.id === target);
      });
    });
  });

  // Activate first section by default on mobile
  const firstNav = document.querySelector('.nav-btn');
  if (firstNav) firstNav.click();

  // ── Cross-module event wiring ──────────────────────────────────────────

  // Pomodoro session complete → celebrate
  document.addEventListener('pomodoro:complete', e => {
    const { sessionCount } = e.detail;
    Celebrations.showModal('pomodoro', `Session #${sessionCount} complete!`);
    Stats.refresh();
  });

  // Task completed → celebrate
  document.addEventListener('todo:task-completed', e => {
    const { task } = e.detail;
    Celebrations.showModal('task', `"${task.text}"`);
    Stats.refresh();
  });

  // Hydration goal → celebrate
  document.addEventListener('hydration:goal-reached', e => {
    Celebrations.showModal('hydration', `${e.detail.glasses} glasses! Daily goal met! 🎉`);
    Stats.refresh();
  });

  // ── Celebration modal close ────────────────────────────────────────────
  document.getElementById('celebration-close')?.addEventListener('click', () => {
    Celebrations.closeModal();
  });
  document.getElementById('celebration-modal')?.addEventListener('click', e => {
    if (e.target.id === 'celebration-modal') Celebrations.closeModal();
  });

  // ── New quote button ───────────────────────────────────────────────────
  document.getElementById('new-quote-btn')?.addEventListener('click', Quotes.display);

  // ── Settings panel toggle ──────────────────────────────────────────────
  document.getElementById('pomo-settings-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('pomo-settings-panel');
    if (panel) {
      panel.classList.toggle('pomo-settings--open');
      const isOpen = panel.classList.contains('pomo-settings--open');
      document.getElementById('pomo-settings-toggle').textContent = isOpen ? '✕ Close' : '⚙ Settings';
    }
  });

  // ── Daily greeting ────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.getElementById('greeting');
  if (greetEl) greetEl.textContent = greeting + '!';

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); Pomodoro.start(); }
    if (e.code === 'KeyP' && e.ctrlKey) { e.preventDefault(); Pomodoro.pause(); }
    if (e.code === 'KeyR' && e.ctrlKey) { e.preventDefault(); Pomodoro.reset(); }
  });

  // ── Today's date display ──────────────────────────────────────────────
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  console.log('%c🚀 Focus Dashboard loaded!', 'color:#00f5d4;font-size:16px;font-weight:bold;');
  console.log('%c⌨️ Shortcuts: Space=Start, Ctrl+P=Pause, Ctrl+R=Reset', 'color:#f5a623;');
});
