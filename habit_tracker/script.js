const habits = [
  { id: 'coding', name: 'Coding', description: 'Write code, solve problems, ship features.' },
  { id: 'reading', name: 'Reading', description: 'Read a book, article, or documentation.' },
  { id: 'water', name: 'Water', description: 'Drink enough water for the day.' },
];

const habitGrid = document.getElementById('habitGrid');
const currentDateLabel = document.getElementById('currentDate');
const today = new Date();
const dateKey = today.toISOString().slice(0, 10);
const storageKey = `habitTracker-${dateKey}`;

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse stored habit state', error);
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderHabits() {
  const state = loadState();
  habitGrid.innerHTML = '';

  habits.forEach((habit) => {
    const isChecked = Boolean(state[habit.id]);
    const item = document.createElement('article');
    item.className = `habit-item${isChecked ? ' checked' : ''}`;

    const content = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'habit-title';
    title.textContent = habit.name;

    const description = document.createElement('p');
    description.className = 'habit-description';
    description.textContent = habit.description;

    content.appendChild(title);
    content.appendChild(description);

    const button = document.createElement('button');
    button.className = 'habit-button';
    button.type = 'button';
    button.textContent = isChecked ? 'Done' : 'Mark Done';
    button.addEventListener('click', () => toggleHabit(habit.id));

    item.appendChild(content);
    item.appendChild(button);
    habitGrid.appendChild(item);
  });
}

function toggleHabit(habitId) {
  const state = loadState();
  state[habitId] = !state[habitId];
  saveState(state);
  renderHabits();
}

currentDateLabel.textContent = `${formatDate(today)} — Today`;
renderHabits();
