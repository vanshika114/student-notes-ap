const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskPriority = document.getElementById('taskPriority');
const searchInput = document.getElementById('searchInput');
const taskList = document.getElementById('taskList');
const clearCompletedButton = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasks = document.getElementById('totalTasks');
const activeTasks = document.getElementById('activeTasks');
const doneTasks = document.getElementById('doneTasks');
const resultsSummary = document.getElementById('resultsSummary');

const storageKey = 'advanced-todo-items';

let tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
let currentFilter = 'all';
let searchTerm = '';

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateValue));
}

function priorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function updateStats() {
  totalTasks.textContent = tasks.length;
  activeTasks.textContent = tasks.filter((task) => !task.completed).length;
  doneTasks.textContent = tasks.filter((task) => task.completed).length;
}

function getFilteredTasks() {
  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);

    const haystack = `${task.title} ${task.priority} ${task.dueDate || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}

function setActiveFilter(nextFilter) {
  currentFilter = nextFilter;
  filterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === nextFilter);
  });
  renderTasks();
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = `task-item ${task.completed ? 'is-completed' : ''}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.className = 'task-check';
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', 'Mark task as completed');

  const content = document.createElement('div');
  content.className = 'task-content';

  const title = document.createElement('p');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const priority = document.createElement('span');
  priority.className = `task-pill ${task.priority}`;
  priority.textContent = `${priorityLabel(task.priority)} priority`;

  const dueDate = document.createElement('span');
  dueDate.className = 'task-pill';
  dueDate.textContent = `Due ${formatDate(task.dueDate)}`;

  const status = document.createElement('span');
  status.className = 'task-pill';
  status.textContent = task.completed ? 'Completed' : 'In progress';

  meta.append(priority, dueDate, status);
  content.append(title, meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.className = 'action-btn';
  editButton.type = 'button';
  editButton.dataset.action = 'edit';
  editButton.textContent = 'Edit';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'action-btn delete';
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete';
  deleteButton.textContent = 'Delete';

  actions.append(editButton, deleteButton);
  item.append(checkbox, content, actions);

  checkbox.addEventListener('change', () => toggleTask(task.id));
  editButton.addEventListener('click', () => editTask(task.id));
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  return item;
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();
  taskList.innerHTML = '';

  if (visibleTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = tasks.length === 0
      ? 'No tasks yet. Add your first task above and start building momentum.'
      : 'No tasks match your current filter. Try another filter or clear your search.';
    taskList.appendChild(empty);
    resultsSummary.textContent = tasks.length === 0 ? 'Your task list is empty.' : `Showing 0 of ${tasks.length} tasks.`;
    updateStats();
    return;
  }

  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  resultsSummary.textContent = `Showing ${visibleTasks.length} of ${tasks.length} tasks.`;

  updateStats();
}

function addTask(title, dueDate, priority) {
  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    dueDate,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  const updatedTitle = window.prompt('Update task title:', task.title);
  if (updatedTitle === null) {
    return;
  }

  const nextTitle = updatedTitle.trim();
  if (!nextTitle) {
    return;
  }

  const updatedPriority = window.prompt('Update priority: low, medium, or high', task.priority);
  if (updatedPriority === null) {
    return;
  }

  const normalizedPriority = updatedPriority.trim().toLowerCase();
  const allowedPriorities = ['low', 'medium', 'high'];
  const nextPriority = allowedPriorities.includes(normalizedPriority) ? normalizedPriority : task.priority;

  const updatedDate = window.prompt('Update due date (YYYY-MM-DD) or leave blank:', task.dueDate || '');
  if (updatedDate === null) {
    return;
  }

  const trimmedDate = updatedDate.trim();
  const nextDate = trimmedDate ? trimmedDate : '';

  tasks = tasks.map((item) =>
    item.id === id
      ? {
          ...item,
          title: nextTitle,
          priority: nextPriority,
          dueDate: nextDate
        }
      : item
  );

  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }

  addTask(title, taskDate.value, taskPriority.value);
  taskForm.reset();
  taskPriority.value = 'medium';
  taskInput.focus();
});

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value;
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveFilter(button.dataset.filter);
  });
});

clearCompletedButton.addEventListener('click', clearCompleted);

renderTasks();
