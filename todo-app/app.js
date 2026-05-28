/* ============================================================
   FOCUS — Task Manager  |  app.js
   ============================================================ */

"use strict";

// ─── State ──────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem("focus_tasks") || "[]");
let currentFilter = "all";
let toastTimer = null;

// ─── DOM Refs ────────────────────────────────────────────────
const taskList      = document.getElementById("task-list");
const taskInput     = document.getElementById("todo-input");
const addBtn        = document.getElementById("add-btn");
const emptyState    = document.getElementById("empty-state");
const totalCount    = document.getElementById("total-tasks");
const doneCount     = document.getElementById("completed-tasks");
const activeCount   = document.getElementById("remaining-count");
const progressFill  = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const actionsBar    = document.getElementById("actions-bar");
const clearBtn      = document.getElementById("clear-completed");
const currentDate   = document.getElementById("current-date");
const toast         = document.getElementById("toast");
const filterBtns    = document.querySelectorAll(".filter-btn");

// ─── Init ────────────────────────────────────────────────────
function init() {
  setDate();
  render();
  bindEvents();
}

// ─── Date ────────────────────────────────────────────────────
function setDate() {
  const now = new Date();
  const opts = { weekday: "long", month: "long", day: "numeric" };
  currentDate.textContent = now.toLocaleDateString("en-US", opts);
}

// ─── Save ────────────────────────────────────────────────────
function save() {
  localStorage.setItem("focus_tasks", JSON.stringify(tasks));
}

// ─── Render ──────────────────────────────────────────────────
function render() {
  const filtered = getFiltered();

  // Clear existing task nodes (keep emptyState)
  const existingItems = taskList.querySelectorAll(".task-item");
  existingItems.forEach(el => el.remove());

  // Stats
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const active = total - done;

  totalCount.textContent = total;
  doneCount.textContent  = done;

  // Progress
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width   = pct + "%";
  progressLabel.textContent  = pct + "% complete";

  // Actions bar
  if (total > 0) {
    actionsBar.style.display = "flex";
    activeCount.textContent  = active === 0
      ? "All tasks done 🎉"
      : `${active} task${active !== 1 ? "s" : ""} left`;
  } else {
    actionsBar.style.display = "none";
  }

  // Empty state
  if (filtered.length === 0) {
    emptyState.style.display = "flex";
    if (total > 0 && currentFilter !== "all") {
      emptyState.querySelector(".empty-state__msg").textContent =
        currentFilter === "completed"
          ? "No completed tasks yet."
          : "No active tasks — well done!";
    } else {
      emptyState.querySelector(".empty-state__msg").innerHTML =
        "Your list is clear.<br/>Add something below.";
    }
  } else {
    emptyState.style.display = "none";
  }

  // Render items
  filtered.forEach((task, idx) => {
    const li = buildTaskEl(task);
    li.style.animationDelay = (idx * 0.04) + "s";
    taskList.appendChild(li);
  });
}

// ─── Get Filtered ────────────────────────────────────────────
function getFiltered() {
  switch (currentFilter) {
    case "active":    return tasks.filter(t => !t.done);
    case "completed": return tasks.filter(t => t.done);
    default:          return [...tasks];
  }
}

// ─── Build Task Element ──────────────────────────────────────
function buildTaskEl(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.done ? " done" : "");
  li.dataset.id = task.id;

  li.innerHTML = `
    <button class="task-check ${task.done ? "checked" : ""}" aria-label="Toggle task" data-action="toggle">
      <span class="check-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <span class="task-text">${escapeHtml(task.text)}</span>
    <div class="task-actions">
      <button class="task-btn task-btn--delete" aria-label="Delete task" data-action="delete">
        <svg viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  `;

  return li;
}

// ─── Add Task ────────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    shakeInput();
    return;
  }

  const task = {
    id:   crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  };

  tasks.unshift(task);
  save();
  taskInput.value = "";
  render();
  showToast("Task added ✦");
}

// ─── Toggle Task ─────────────────────────────────────────────
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;
  save();

  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add("completing");
    li.addEventListener("animationend", () => {
      li.classList.remove("completing");
      render();
    }, { once: true });
  } else {
    render();
  }

  if (task.done) showToast("Task complete ✓");
}

// ─── Delete Task ─────────────────────────────────────────────
function deleteTask(id) {
  const li = taskList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add("removing");
    li.addEventListener("animationend", () => {
      tasks = tasks.filter(t => t.id !== id);
      save();
      render();
    }, { once: true });
  } else {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }
  showToast("Task removed");
}

// ─── Clear Completed ─────────────────────────────────────────
function clearCompleted() {
  const completed = tasks.filter(t => t.done);
  if (completed.length === 0) return;

  completed.forEach(task => {
    const li = taskList.querySelector(`[data-id="${task.id}"]`);
    if (li) li.classList.add("removing");
  });

  setTimeout(() => {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
    showToast(`Cleared ${completed.length} task${completed.length !== 1 ? "s" : ""}`);
  }, 310);
}

// ─── Toast ───────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ─── Shake Input ─────────────────────────────────────────────
function shakeInput() {
  const wrap = document.querySelector(".input-wrap");
  wrap.style.animation = "none";
  wrap.offsetHeight; // reflow
  wrap.style.animation = "shake 0.4s cubic-bezier(0.4,0,0.2,1)";
  // Inject shake keyframes if not present
  if (!document.getElementById("shake-kf")) {
    const style = document.createElement("style");
    style.id = "shake-kf";
    style.textContent = `@keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }`;
    document.head.appendChild(style);
  }
}

// ─── Escape HTML ─────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Events ──────────────────────────────────────────────────
function bindEvents() {
  // Handle form submission (handles both button click and Enter key)
  const todoForm = document.getElementById("todo-form");
  todoForm.addEventListener("submit", e => {
    e.preventDefault();
    addTask();
  });

  // Task list delegation
  taskList.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const li = btn.closest(".task-item");
    if (!li) return;
    const id = li.dataset.id;

    if (btn.dataset.action === "toggle") toggleTask(id);
    if (btn.dataset.action === "delete") deleteTask(id);
  });

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // Clear completed
  clearBtn.addEventListener("click", clearCompleted);

  // Keyboard shortcut: Ctrl/Cmd + / to focus input
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      taskInput.focus();
    }
  });
}

// ─── Boot ────────────────────────────────────────────────────
init();
