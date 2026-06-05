/**
 * todo.js
 * To-do list with add/complete/delete, Pomodoro linking, localStorage
 * persistence, and 'todo:task-completed' events for stats + celebrations.
 */

const Todo = (() => {
  // ── State ────────────────────────────────────────────────────────────────
  let tasks = [];

  // ── Persistence ──────────────────────────────────────────────────────────
  function save() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }

  function load() {
    try {
      tasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');
    } catch (e) {
      tasks = [];
    }
  }

  // ── Task CRUD ─────────────────────────────────────────────────────────────
  function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  function addTask(text, priority = 'medium') {
    if (!text.trim()) return;
    const task = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
      pomodoroSessions: 0,
    };
    tasks.unshift(task);
    save();
    render();
    updatePomodoroTaskSelect();
    Celebrations.showToast(`📝 Task added: "${task.text}"`, 'info');
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    if (task.completed) {
      task.completedAt = Date.now();
      save();
      render();
      updatePomodoroTaskSelect();
      document.dispatchEvent(new CustomEvent('todo:task-completed', { detail: { task } }));
    } else {
      task.completedAt = null;
      save();
      render();
      updatePomodoroTaskSelect();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
    updatePomodoroTaskSelect();
  }

  function incrementPomodoro(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.pomodoroSessions = (task.pomodoroSessions || 0) + 1;
      save();
      render();
    }
  }

  function getById(id) {
    return tasks.find(t => t.id === id) || null;
  }

  function getCompleted() {
    return tasks.filter(t => t.completed);
  }

  function getAll() {
    return [...tasks];
  }

  // ── Priority helpers ──────────────────────────────────────────────────────
  const PRIORITY_ICONS = { high: '🔴', medium: '🟡', low: '🟢' };
  const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    const filter = document.querySelector('.todo-filter-btn.active')?.dataset.filter || 'all';
    const search = document.getElementById('todo-search')?.value.toLowerCase() || '';

    const filtered = tasks.filter(t => {
      if (filter === 'active' && t.completed) return false;
      if (filter === 'completed' && !t.completed) return false;
      if (search && !t.text.toLowerCase().includes(search)) return false;
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div class="todo-empty">
        <span class="todo-empty__icon">✅</span>
        <p>${filter === 'completed' ? 'No completed tasks yet.' : 'No tasks here. Add one above!'}</p>
      </div>`;
      updateCounts();
      return;
    }

    list.innerHTML = filtered.map(task => `
      <div class="todo-item ${task.completed ? 'todo-item--done' : ''} priority--${task.priority}"
           data-id="${task.id}">
        <button class="todo-check" onclick="Todo.toggleTask('${task.id}')"
                aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
          ${task.completed ? '✓' : ''}
        </button>
        <span class="todo-priority-dot">${PRIORITY_ICONS[task.priority] || '🟡'}</span>
        <span class="todo-text">${escapeHtml(task.text)}</span>
        ${task.pomodoroSessions > 0 ? `<span class="todo-pomo-badge" title="${task.pomodoroSessions} Pomodoro sessions">🍅×${task.pomodoroSessions}</span>` : ''}
        <div class="todo-actions">
          <button class="todo-link-btn ${isLinked(task.id) ? 'todo-link-btn--active' : ''}"
                  onclick="Todo.linkToPomodoro('${task.id}')"
                  title="Link to Pomodoro" aria-label="Link task to Pomodoro">
            ⏱
          </button>
          <button class="todo-delete-btn" onclick="Todo.deleteTask('${task.id}')"
                  aria-label="Delete task">✕</button>
        </div>
      </div>
    `).join('');

    updateCounts();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function updateCounts() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const active = total - done;

    const totalEl = document.getElementById('todo-total-count');
    const doneEl = document.getElementById('todo-done-count');
    const activeEl = document.getElementById('todo-active-count');
    const statEl = document.getElementById('tasks-completed-stat');

    if (totalEl) totalEl.textContent = total;
    if (doneEl) doneEl.textContent = done;
    if (activeEl) activeEl.textContent = active;
    if (statEl) statEl.textContent = done;
  }

  // ── Pomodoro link ──────────────────────────────────────────────────────────
  let currentLinkedId = null;

  function isLinked(id) {
    return currentLinkedId === id;
  }

  function linkToPomodoro(id) {
    if (currentLinkedId === id) {
      currentLinkedId = null;
      if (typeof Pomodoro !== 'undefined') Pomodoro.unlinkTask();
      Celebrations.showToast('🔗 Task unlinked from Pomodoro', 'info');
    } else {
      currentLinkedId = id;
      if (typeof Pomodoro !== 'undefined') Pomodoro.linkTask(id);
      const task = getById(id);
      if (task) Celebrations.showToast(`🔗 Linked: "${task.text}"`, 'info');
    }
    render();
  }

  function updatePomodoroTaskSelect() {
    const select = document.getElementById('pomo-task-select');
    if (!select) return;
    const activeTasks = tasks.filter(t => !t.completed);
    select.innerHTML = `<option value="">— No linked task —</option>` +
      activeTasks.map(t => `<option value="${t.id}">${escapeHtml(t.text)}</option>`).join('');
    if (currentLinkedId) select.value = currentLinkedId;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    load();

    // Add task
    const addBtn = document.getElementById('todo-add-btn');
    const input = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('todo-priority');

    function handleAdd() {
      if (input && input.value.trim()) {
        addTask(input.value.trim(), prioritySelect?.value || 'medium');
        input.value = '';
        input.focus();
      }
    }

    addBtn?.addEventListener('click', handleAdd);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') handleAdd(); });

    // Filter buttons
    document.querySelectorAll('.todo-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.todo-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });

    // Search
    document.getElementById('todo-search')?.addEventListener('input', render);

    // Pomodoro task select
    document.getElementById('pomo-task-select')?.addEventListener('change', e => {
      if (e.target.value) linkToPomodoro(e.target.value);
      else {
        currentLinkedId = null;
        if (typeof Pomodoro !== 'undefined') Pomodoro.unlinkTask();
      }
    });

    // Listen for pomodoro complete to increment session count
    document.addEventListener('pomodoro:complete', e => {
      if (currentLinkedId) incrementPomodoro(currentLinkedId);
    });

    render();
    updatePomodoroTaskSelect();
  }

  return { init, addTask, toggleTask, deleteTask, getById, getCompleted, getAll, linkToPomodoro };
})();
