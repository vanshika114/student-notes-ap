/* -------------------------------------------------------------
   AuraHabit - Core Logic & Application Engine
------------------------------------------------------------- */

// Static Achievements Definition
const BADGES_DATABASE = [
  {
    id: 'first_habit',
    name: 'First Step',
    desc: 'Complete your first habit check-in.',
    xpReward: 100,
    icon: 'fa-solid fa-baby-carriage',
    color: '#00B4D8',
    glowColor: 'rgba(0, 180, 216, 0.3)'
  },
  {
    id: 'streak_3',
    name: 'Triple Threat',
    desc: 'Achieve a 3-day streak on any active habit.',
    xpReward: 200,
    icon: 'fa-solid fa-bolt',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.3)'
  },
  {
    id: 'streak_7',
    name: 'Consistency King',
    desc: 'Achieve a 7-day streak on any active habit.',
    xpReward: 500,
    icon: 'fa-solid fa-fire',
    color: '#FF007F',
    glowColor: 'rgba(255, 0, 127, 0.3)'
  },
  {
    id: 'well_rounded',
    name: 'Well-Rounded Life',
    desc: 'Track active habits in Health, Mind, and Productivity simultaneously.',
    xpReward: 300,
    icon: 'fa-solid fa-yin-yang',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.3)'
  },
  {
    id: 'perfect_week',
    name: 'Perfect Routine',
    desc: 'Complete all scheduled habits for today.',
    xpReward: 400,
    icon: 'fa-solid fa-crown',
    color: '#9D4EDD',
    glowColor: 'rgba(157, 78, 221, 0.3)'
  },
  {
    id: 'hundred_club',
    name: 'Century Club',
    desc: 'Complete 100 total habit check-ins.',
    xpReward: 1000,
    icon: 'fa-solid fa-award',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)'
  }
];

// Motivational Quotes Database
const MOTIVATION_QUOTES = [
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "All big things come from small beginnings. The seed of every habit is a single, tiny decision.", author: "James Clear" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "You will never change your life until you change something you do daily.", author: "John C. Maxwell" }
];

// App Global State
let state = {
  habits: [],
  userStats: {
    points: 0,
    xp: 0,
    level: 1,
    profileName: 'Elite Achiever'
  },
  settings: {
    soundOn: true,
    notificationsOn: false,
    theme: 'dark'
  },
  unlockedAchievements: []
};

// Chart.js references for updating
let charts = {
  weekly: null,
  category: null,
  monthly: null
};

// Selected weekday tracking in form
let formSelectedDays = new Set([1, 2, 3, 4, 5]); // Mon-Fri default
let formSelectedColor = '#FFD700'; // Default gold
let activeTab = 'dashboard';
let currentCalendarDate = new Date(); // Dynamic calendar view tracker

// Audio Context Helper
let audioCtx = null;
function playWebSound(type) {
  if (!state.settings.soundOn) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'check') {
      // Ping check
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'uncheck') {
      // Slur down
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'level_up' || type === 'achievement') {
      // Fanfare
      const now = audioCtx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start();
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn("Audio Context blocked or failed to initialize:", e);
  }
}

// -------------------------------------------------------------
// App Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  applyTheme();
  setupEventListeners();
  updateGreeting();
  updateStatsDashboard();
  renderTodayHabits();
  renderAllHabitsGrid();
  renderHeatmap();
  renderCalendarView();
  renderAchievements();
  renderInsights();
  populateSettingsForm();
  
  // Set up random motivational quote
  setQuote();
  
  // Create colorpicker grid elements
  generateColorPicker();
});

// Load state from LocalStorage
function loadData() {
  const stored = localStorage.getItem('aurahabit_state');
  if (stored) {
    try {
      state = JSON.parse(stored);
      // Backwards compatibility fixes if key fields are missing
      if (!state.unlockedAchievements) state.unlockedAchievements = [];
      if (!state.userStats.xp) state.userStats.xp = 0;
      if (!state.userStats.level) state.userStats.level = 1;
      if (!state.settings) {
        state.settings = { soundOn: true, notificationsOn: false, theme: 'dark' };
      }
    } catch (e) {
      console.error("Failed to parse LocalStorage data. Resetting state.", e);
    }
  }
}

// Sync state to LocalStorage
function saveData() {
  localStorage.setItem('aurahabit_state', JSON.stringify(state));
}

// -------------------------------------------------------------
// UI Layout Helpers
// -------------------------------------------------------------
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  const themeToggleText = document.getElementById('themeToggleText');
  if (themeToggleText) {
    themeToggleText.textContent = state.settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

// Update time text
function updateGreeting() {
  const hours = new Date().getHours();
  let greet = "Good morning";
  if (hours >= 12 && hours < 17) greet = "Good afternoon";
  else if (hours >= 17) greet = "Good evening";
  
  const greetEl = document.getElementById('greetingText');
  if (greetEl) {
    greetEl.innerHTML = `${greet}, <span class="gradient-text">${state.userStats.profileName}</span>`;
  }
  
  const dateEl = document.getElementById('currentDateText');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

function setQuote() {
  const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  const textEl = document.getElementById('motivationQuote');
  const authEl = document.getElementById('motivationAuthor');
  if (textEl && authEl) {
    textEl.textContent = `"${quote.text}"`;
    authEl.textContent = `— ${quote.author}`;
  }
}

// -------------------------------------------------------------
// Interactive Setup
// -------------------------------------------------------------
function setupEventListeners() {
  // Navigation Tabs switching
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
      
      // Close sidebar on mobile clicking links
      document.getElementById('sidebar').classList.remove('active');
      document.getElementById('sidebarOverlay').classList.remove('active');
    });
  });
  
  // Theme Toggle Button
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveData();
    // Redraw charts if analytics tab is rendered (fixes canvas labels scaling)
    if (activeTab === 'analytics') {
      renderCharts();
    }
  });

  // Mobile sidebar burger toggler
  document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
  });
  
  document.getElementById('sidebarCloseBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
  });

  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
  });
  
  // Create / Edit modal elements
  const habitForm = document.getElementById('habitForm');
  habitForm.addEventListener('submit', handleHabitFormSubmit);
  
  // Quick Add Habit Top Navbar click
  document.getElementById('quickAddHabitBtn').addEventListener('click', () => {
    openHabitModal();
  });
  
  // View achievements list redirect
  document.getElementById('viewAllBadgesLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('achievements');
  });

  // Filters listener on Habits list tab
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAllHabitsGrid();
    });
  });

  document.getElementById('categoryFilter').addEventListener('change', renderAllHabitsGrid);
  document.getElementById('habitSearchInput').addEventListener('input', renderAllHabitsGrid);
  document.getElementById('timeFilter').addEventListener('change', renderTodayHabits);

  // Settings Save profile name
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('settingsProfileName');
    if (nameInput && nameInput.value.trim()) {
      state.userStats.profileName = nameInput.value.trim();
      saveData();
      updateGreeting();
      document.getElementById('profileName').textContent = state.userStats.profileName;
      // Initials update
      const parts = state.userStats.profileName.split(' ');
      const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
      document.getElementById('profileInitials').textContent = initials || 'AH';
      alert("Profile updated successfully!");
    }
  });

  // Sound and notifications checkboxes
  document.getElementById('soundToggle').addEventListener('change', (e) => {
    state.settings.soundOn = e.target.checked;
    saveData();
  });

  document.getElementById('notificationsToggle').addEventListener('change', (e) => {
    state.settings.notificationsOn = e.target.checked;
    saveData();
    if (state.settings.notificationsOn) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  });

  // Settings mock generator
  document.getElementById('generateMockDataBtn').addEventListener('click', () => {
    if (confirm("This will overwrite your current progress with 30 days of mock history. Proceed?")) {
      generateMockHistory();
    }
  });

  // Settings Export Data
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurahabit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Settings Import Data
  document.getElementById('importDataFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.habits)) {
          state = parsed;
          saveData();
          alert("Backup imported successfully! Reloading page.");
          window.location.reload();
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  });

  // Settings Reset data
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm("ARE YOU SURE? This will permanently delete all habits, streak histories, and unlocked levels! This cannot be undone.")) {
      localStorage.removeItem('aurahabit_state');
      window.location.reload();
    }
  });

  // Modal frequency tabs switching
  document.querySelectorAll('.freq-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.freq-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const freq = tab.getAttribute('data-freq');
      const weeklyContainer = document.getElementById('weeklyTargetContainer');
      const specificContainer = document.getElementById('specificDaysContainer');
      
      weeklyContainer.classList.add('hidden');
      specificContainer.classList.add('hidden');
      
      if (freq === 'weekly') {
        weeklyContainer.classList.remove('hidden');
      } else if (freq === 'specific') {
        specificContainer.classList.remove('hidden');
      }
    });
  });

  // Modal specific weekdays picking
  document.querySelectorAll('.day-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = parseInt(btn.getAttribute('data-day'));
      if (formSelectedDays.has(day)) {
        formSelectedDays.delete(day);
        btn.classList.remove('active');
      } else {
        formSelectedDays.add(day);
        btn.classList.add('active');
      }
    });
  });

  // Calendar prev/next navigation
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendarView();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendarView();
  });
}

// -------------------------------------------------------------
// Tab Router Engine
// -------------------------------------------------------------
function switchTab(tabId) {
  activeTab = tabId;
  
  // Hide all sections
  document.querySelectorAll('.tab-content').forEach(sect => {
    sect.classList.remove('active');
  });
  
  // Show target section
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('active');
  }
  
  // Update sidebar links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    }
  });

  // Tab specific re-render triggers
  if (tabId === 'dashboard') {
    renderTodayHabits();
    updateStatsDashboard();
  } else if (tabId === 'habits') {
    renderAllHabitsGrid();
  } else if (tabId === 'analytics') {
    renderCharts();
    renderInsights();
  } else if (tabId === 'calendar') {
    renderHeatmap();
    renderCalendarView();
  } else if (tabId === 'achievements') {
    renderAchievements();
  }
}

// -------------------------------------------------------------
// Level, Points and Experience Systems
// -------------------------------------------------------------
function addXP(amount) {
  let prevLevel = state.userStats.level;
  state.userStats.xp += amount;
  state.userStats.points += amount; // 1 XP = 1 Point reward

  // XP requirement formula: 100 * level
  let xpNeeded = state.userStats.level * 100;
  while (state.userStats.xp >= xpNeeded) {
    state.userStats.xp -= xpNeeded;
    state.userStats.level += 1;
    xpNeeded = state.userStats.level * 100;
  }
  
  if (state.userStats.level > prevLevel) {
    // Level up trigger
    setTimeout(() => {
      triggerConfetti();
      playWebSound('level_up');
      showNotificationToast('Level Up!', `Congratulations! You climbed to Level ${state.userStats.level}!`);
    }, 400);
  }
  
  saveData();
  updateStatsDashboard();
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function showNotificationToast(title, body) {
  const toast = document.getElementById('achievementToast');
  if (toast) {
    toast.querySelector('h4').textContent = title;
    toast.querySelector('p').textContent = body;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }
}

// Updates level gauges and totals across panels
function updateStatsDashboard() {
  const todayProgressVal = document.getElementById('todayProgressValue');
  const todayProgressFill = document.getElementById('todayProgressFill');
  const currentStreakVal = document.getElementById('currentStreakValue');
  const longestStreakVal = document.getElementById('longestStreakValue');
  const userLevelVal = document.getElementById('userLevelValue');
  const xpRemainingText = document.getElementById('xpRemainingText');
  const weeklySuccessVal = document.getElementById('weeklySuccessValue');
  const weeklyFraction = document.getElementById('weeklyCompletionFraction');
  
  const xpBarFill = document.getElementById('xpBarFill');
  const xpText = document.getElementById('xpText');
  const pointsDisplay = document.getElementById('pointsDisplay');
  const achievementsTotalPoints = document.getElementById('achievementsTotalPoints');
  const profileName = document.getElementById('profileName');
  const profileLevelDisplay = document.getElementById('profileLevelDisplay');

  // Sidebar profile updates
  if (profileName) profileName.textContent = state.userStats.profileName;
  if (profileLevelDisplay) profileLevelDisplay.textContent = `Level ${state.userStats.level} Routine Builder`;
  if (pointsDisplay) pointsDisplay.textContent = state.userStats.points.toLocaleString();
  if (achievementsTotalPoints) achievementsTotalPoints.textContent = state.userStats.points.toLocaleString();

  // Sidebar XP Bar fill
  const xpNeeded = state.userStats.level * 100;
  const xpPct = Math.min(100, Math.floor((state.userStats.xp / xpNeeded) * 100));
  if (xpBarFill) xpBarFill.style.width = `${xpPct}%`;
  if (xpText) xpText.textContent = `${state.userStats.xp} / ${xpNeeded} XP`;
  
  if (userLevelVal) userLevelVal.textContent = `Level ${state.userStats.level}`;
  if (xpRemainingText) xpRemainingText.textContent = `${xpNeeded - state.userStats.xp} XP to next level`;

  // Calculate Today's Habits Progress
  const todayList = getScheduledHabitsForDate(new Date());
  const completedToday = todayList.filter(h => isHabitCompletedOnDate(h, getLocalDateString(new Date())));
  const todayPct = todayList.length > 0 ? Math.round((completedToday.length / todayList.length) * 100) : 0;
  
  if (todayProgressVal) todayProgressVal.textContent = `${todayPct}%`;
  if (todayProgressFill) todayProgressFill.style.width = `${todayPct}%`;
  
  // Calculate Streaks
  let overallMaxStreak = 0;
  let activeMaxStreak = 0;
  state.habits.forEach(h => {
    if (!h.archived) {
      const s = calculateStreak(h);
      if (s.current > activeMaxStreak) activeMaxStreak = s.current;
      if (s.longest > overallMaxStreak) overallMaxStreak = s.longest;
    }
  });

  if (currentStreakVal) currentStreakVal.textContent = `${activeMaxStreak} Day${activeMaxStreak !== 1 ? 's' : ''}`;
  if (longestStreakVal) longestStreakVal.textContent = `Best streak: ${overallMaxStreak} days`;

  // Weekly Success Rate (Past 7 Days)
  let totalScheduled = 0;
  let totalCompleted = 0;
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayStr = getLocalDateString(d);
    
    const dayHabits = getScheduledHabitsForDate(d);
    totalScheduled += dayHabits.length;
    totalCompleted += dayHabits.filter(h => isHabitCompletedOnDate(h, dayStr)).length;
  }

  const weeklyPct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  if (weeklySuccessVal) weeklySuccessVal.textContent = `${weeklyPct}%`;
  if (weeklyFraction) weeklyFraction.textContent = `${totalCompleted} of ${totalScheduled} completions`;

  // Update Milestones Card elements
  const weeklyCompletionsCount = document.getElementById('weeklyCompletionsCount');
  const weeklyCompletionsFill = document.getElementById('weeklyCompletionsFill');
  if (weeklyCompletionsCount && weeklyCompletionsFill) {
    // Target: 10 habits completed this week
    weeklyCompletionsCount.textContent = `${totalCompleted}/15`;
    const pct = Math.min(100, Math.round((totalCompleted / 15) * 100));
    weeklyCompletionsFill.style.width = `${pct}%`;
  }

  const weeklyPerfectDaysCount = document.getElementById('weeklyPerfectDaysCount');
  const weeklyPerfectDaysFill = document.getElementById('weeklyPerfectDaysFill');
  if (weeklyPerfectDaysCount && weeklyPerfectDaysFill) {
    // Find days out of past 7 with 100% completion
    let perfectDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayStr = getLocalDateString(d);
      const dayHabits = getScheduledHabitsForDate(d);
      if (dayHabits.length > 0 && dayHabits.every(h => isHabitCompletedOnDate(h, dayStr))) {
        perfectDays++;
      }
    }
    weeklyPerfectDaysCount.textContent = `${perfectDays}/7`;
    weeklyPerfectDaysFill.style.width = `${Math.round((perfectDays / 7) * 100)}%`;
  }

  const weeklyXpCount = document.getElementById('weeklyXpCount');
  const weeklyXpFill = document.getElementById('weeklyXpFill');
  if (weeklyXpCount && weeklyXpFill) {
    // Assuming 500 XP is the weekly target
    // We count completions * difficulty XP
    let weeklyXP = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayStr = getLocalDateString(d);
      const dayHabits = getScheduledHabitsForDate(d);
      dayHabits.forEach(h => {
        if (isHabitCompletedOnDate(h, dayStr)) {
          weeklyXP += getXPValue(h.difficulty);
        }
      });
    }
    weeklyXpCount.textContent = `${weeklyXP}/300 XP`;
    weeklyXpFill.style.width = `${Math.min(100, Math.round((weeklyXP / 300) * 100))}%`;
  }

  // Update badges count indicator in sidebar
  const badgeCountEl = document.getElementById('badgeCount');
  if (badgeCountEl) {
    badgeCountEl.textContent = state.unlockedAchievements.length;
  }
}

// -------------------------------------------------------------
// Habits Management CRUD Core
// -------------------------------------------------------------
function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getXPValue(difficulty) {
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 20;
  if (difficulty === 'hard') return 30;
  return 10;
}

function getScheduledHabitsForDate(date) {
  const dayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon...
  const dateStr = getLocalDateString(date);
  
  return state.habits.filter(h => {
    if (h.archived) return false;
    
    // Created date boundary check
    if (h.createdAt && getLocalDateString(new Date(h.createdAt)) > dateStr) return false;

    if (h.frequency === 'daily') {
      return true;
    } else if (h.frequency === 'weekly') {
      return true; // We show weekly targets every day for checklists until target count met
    } else if (h.frequency === 'specific') {
      return h.specificDays.includes(dayOfWeek);
    }
    return false;
  });
}

function isHabitCompletedOnDate(habit, dateStr) {
  return !!(habit.history && habit.history[dateStr]);
}

// Toggles completion check on habit list
function toggleHabitCheck(habitId, dateStr) {
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  if (!habit.history) habit.history = {};

  const wasCompleted = !!habit.history[dateStr];
  if (wasCompleted) {
    delete habit.history[dateStr];
    playWebSound('uncheck');
    addXP(-getXPValue(habit.difficulty)); // Deduct points
  } else {
    habit.history[dateStr] = true;
    playWebSound('check');
    addXP(getXPValue(habit.difficulty)); // Add points
    triggerConfetti();
  }

  saveData();
  updateStatsDashboard();
  renderTodayHabits();
  
  // Re-run achievements unlock checks
  checkAchievementsUnlock();
}

// -------------------------------------------------------------
// Daily Habits Checklist Render
// -------------------------------------------------------------
function renderTodayHabits() {
  const container = document.getElementById('todayHabitChecklist');
  const countTag = document.getElementById('todayHabitsCount');
  if (!container) return;

  const filterVal = document.getElementById('timeFilter').value;
  const todayStr = getLocalDateString(new Date());
  
  let list = getScheduledHabitsForDate(new Date());
  
  // Filter by Morning/Afternoon/Evening
  if (filterVal !== 'all') {
    list = list.filter(h => h.timeOfDay === filterVal);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-mug-hot"></i>
        <p>No habits set for the selected period.</p>
        <button class="btn btn-primary" onclick="openHabitModal()">Create Custom Habit</button>
      </div>
    `;
    if (countTag) countTag.textContent = "0 remaining";
    return;
  }

  // Count incomplete
  const incomplete = list.filter(h => !isHabitCompletedOnDate(h, todayStr)).length;
  if (countTag) {
    countTag.textContent = incomplete === 0 ? "All completed! 🎉" : `${incomplete} remaining`;
  }

  container.innerHTML = '';
  list.forEach(habit => {
    const isDone = isHabitCompletedOnDate(habit, todayStr);
    const streakData = calculateStreak(habit);
    
    const card = document.createElement('div');
    card.className = `habit-item ${isDone ? 'completed' : ''}`;
    card.style.setProperty('--item-color', habit.color || '#FFD700');
    
    card.innerHTML = `
      <div class="habit-item-left">
        <button class="check-btn" onclick="toggleHabitCheck('${habit.id}', '${todayStr}')" aria-label="Toggle Check">
          <i class="fa-solid fa-check"></i>
        </button>
        <div class="habit-info-block">
          <div class="habit-title-row">
            <span class="h-title" onclick="openHabitDetailsModal('${habit.id}')">${escapeHTML(habit.name)}</span>
            <span class="tag-badge tag-${habit.difficulty}">${habit.difficulty}</span>
            <span class="tag-badge tag-time">${habit.timeOfDay}</span>
          </div>
          ${habit.desc ? `<span class="h-desc">${escapeHTML(habit.desc)}</span>` : ''}
        </div>
      </div>
      <div class="habit-item-right">
        <div class="h-streak-badge">
          <i class="fa-solid fa-fire animate-pulse"></i>
          <span>${streakData.current}</span>
        </div>
        <button class="h-options-btn" onclick="openHabitDetailsModal('${habit.id}')" aria-label="Manage Habit Options">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------
// All Habits Tab Dashboard Listing Grid
// -------------------------------------------------------------
function renderAllHabitsGrid() {
  const grid = document.getElementById('allHabitsGrid');
  if (!grid) return;

  const searchQuery = document.getElementById('habitSearchInput').value.toLowerCase();
  const filterType = document.querySelector('.filter-btn.active').getAttribute('data-filter'); // all, active, archived
  const categoryFilter = document.getElementById('categoryFilter').value;

  let list = state.habits;

  // Search filter
  if (searchQuery) {
    list = list.filter(h => h.name.toLowerCase().includes(searchQuery) || (h.desc && h.desc.toLowerCase().includes(searchQuery)));
  }

  // Active / Archived filter
  if (filterType === 'active') {
    list = list.filter(h => !h.archived);
  } else if (filterType === 'archived') {
    list = list.filter(h => h.archived);
  }

  // Category filter
  if (categoryFilter !== 'all') {
    list = list.filter(h => h.category === categoryFilter);
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: span 10;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>No habits match your active filter preferences.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  list.forEach(habit => {
    const streak = calculateStreak(habit);
    const completionsCount = Object.keys(habit.history || {}).length;
    
    const card = document.createElement('div');
    card.className = 'habit-manage-card';
    card.style.setProperty('--item-color', habit.color || '#FFD700');
    
    card.innerHTML = `
      <div class="habit-card-header">
        <span class="habit-card-category" style="color: ${habit.color}">${habit.category}</span>
        <button class="habit-card-menu-btn" onclick="openHabitDetailsModal('${habit.id}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
      <div class="habit-card-body">
        <h3 onclick="openHabitDetailsModal('${habit.id}')">${escapeHTML(habit.name)}</h3>
        <p>${habit.desc ? escapeHTML(habit.desc) : 'No customized notes included.'}</p>
      </div>
      <div class="habit-card-stats">
        <div class="habit-card-stat">
          <span class="habit-card-stat-label">Completions</span>
          <span class="habit-card-stat-value">${completionsCount}</span>
        </div>
        <div class="habit-card-stat">
          <span class="habit-card-stat-label">Active Streak</span>
          <span class="habit-card-stat-value text-gold"><i class="fa-solid fa-fire"></i> ${streak.current}d</span>
        </div>
        <div class="habit-card-stat">
          <span class="habit-card-stat-label">Longest Streak</span>
          <span class="habit-card-stat-value text-purple">${streak.longest}d</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// -------------------------------------------------------------
// Streak Algorithm Engine
// -------------------------------------------------------------
function calculateStreak(habit) {
  if (!habit.history || Object.keys(habit.history).length === 0) {
    return { current: 0, longest: 0 };
  }

  const dates = Object.keys(habit.history).sort((a, b) => new Date(b) - new Date(a));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Find current streak relative to today/yesterday
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  // A streak is active if completed today, or yesterday.
  const hasCompletedRecent = dates.includes(todayStr) || dates.includes(yesterdayStr);
  
  if (hasCompletedRecent) {
    let checkDate = new Date();
    // Start count from today or yesterday
    if (!dates.includes(todayStr) && dates.includes(yesterdayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
      const checkStr = getLocalDateString(checkDate);
      
      // Streak continues if:
      // 1. Habit scheduled for this day was completed, OR
      // 2. Habit was NOT scheduled for this day (i.e. we don't break streak on non-scheduled days)
      const wasScheduled = isHabitScheduledOnDateObj(habit, checkDate);
      const wasDone = dates.includes(checkStr);
      
      if (wasDone) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (!wasScheduled) {
        // Skip days not scheduled, keep walking back
        checkDate.setDate(checkDate.getDate() - 1);
        
        // Safety lock: if we walk back beyond creation date, stop
        if (habit.createdAt && getLocalDateString(checkDate) < getLocalDateString(new Date(habit.createdAt))) {
          break;
        }
      } else {
        // Was scheduled but missed
        break;
      }
    }
  }

  // Calculate longest streak historically
  let sortedAscDates = Object.keys(habit.history).sort((a, b) => new Date(a) - new Date(b));
  if (sortedAscDates.length > 0) {
    let checkDate = new Date(sortedAscDates[0]);
    const lastDate = new Date(sortedAscDates[sortedAscDates.length - 1]);
    
    while (checkDate <= lastDate) {
      const checkStr = getLocalDateString(checkDate);
      const wasScheduled = isHabitScheduledOnDateObj(habit, checkDate);
      const wasDone = sortedAscDates.includes(checkStr);

      if (wasDone) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (wasScheduled) {
        // missed on scheduled day breaks historical chain
        tempStreak = 0;
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
}

function isHabitScheduledOnDateObj(habit, dateObj) {
  if (habit.createdAt && getLocalDateString(dateObj) < getLocalDateString(new Date(habit.createdAt))) {
    return false;
  }
  
  if (habit.frequency === 'daily') {
    return true;
  } else if (habit.frequency === 'specific') {
    return habit.specificDays.includes(dateObj.getDay());
  } else if (habit.frequency === 'weekly') {
    // For weekly, we schedule it generally. Just treat as scheduled.
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// Achievement Badge Unlock Checks
// -------------------------------------------------------------
function checkAchievementsUnlock() {
  BADGES_DATABASE.forEach(badge => {
    if (state.unlockedAchievements.includes(badge.id)) return;

    let unlock = false;
    
    if (badge.id === 'first_habit') {
      // 1 completion on any habit
      const totalChecks = state.habits.reduce((acc, h) => acc + Object.keys(h.history || {}).length, 0);
      if (totalChecks >= 1) unlock = true;
    }
    
    else if (badge.id === 'streak_3') {
      // 3 days streak on any habit
      unlock = state.habits.some(h => calculateStreak(h).current >= 3);
    }
    
    else if (badge.id === 'streak_7') {
      // 7 days streak on any habit
      unlock = state.habits.some(h => calculateStreak(h).current >= 7);
    }
    
    else if (badge.id === 'well_rounded') {
      // Health, mind, productivity simultaneously
      const categories = new Set(state.habits.filter(h => !h.archived).map(h => h.category));
      if (categories.has('health') && categories.has('mind') && categories.has('productivity')) unlock = true;
    }

    else if (badge.id === 'perfect_week') {
      // Complete today's habits fully
      const todayHabits = getScheduledHabitsForDate(new Date());
      const todayStr = getLocalDateString(new Date());
      if (todayHabits.length > 0 && todayHabits.every(h => isHabitCompletedOnDate(h, todayStr))) {
        unlock = true;
      }
    }

    else if (badge.id === 'hundred_club') {
      // 100 checks
      const totalChecks = state.habits.reduce((acc, h) => acc + Object.keys(h.history || {}).length, 0);
      if (totalChecks >= 100) unlock = true;
    }

    if (unlock) {
      state.unlockedAchievements.push(badge.id);
      saveData();
      addXP(badge.xpReward);
      // Trigger animations and alerts
      setTimeout(() => {
        playWebSound('achievement');
        showNotificationToast('Achievement Unlocked!', `${badge.name}: ${badge.desc}`);
      }, 800);
    }
  });
}

// -------------------------------------------------------------
// Achievement Tab Rendering
// -------------------------------------------------------------
function renderAchievements() {
  const showcase = document.getElementById('badgesMiniShowcase');
  const fullGrid = document.getElementById('badgesFullGrid');
  
  if (showcase) {
    showcase.innerHTML = '';
    const unlocked = BADGES_DATABASE.filter(b => state.unlockedAchievements.includes(b.id));
    
    if (unlocked.length === 0) {
      showcase.innerHTML = `<span class="setting-desc">No badges unlocked yet. Start check-ins!</span>`;
    } else {
      unlocked.forEach(badge => {
        const icon = document.createElement('div');
        icon.className = 'mini-badge';
        icon.style.backgroundColor = badge.color;
        icon.style.boxShadow = `0 0 10px ${badge.glowColor}`;
        icon.innerHTML = `<i class="${badge.icon}" style="color: #fff;"></i>`;
        icon.setAttribute('title', `${badge.name}: ${badge.desc}`);
        showcase.appendChild(icon);
      });
    }
  }

  if (fullGrid) {
    fullGrid.innerHTML = '';
    BADGES_DATABASE.forEach(badge => {
      const isUnlocked = state.unlockedAchievements.includes(badge.id);
      
      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.style.setProperty('--badge-color', badge.color);
      card.style.setProperty('--badge-color-glow', badge.glowColor);
      
      card.innerHTML = `
        <div class="badge-icon-frame">
          <i class="${badge.icon}"></i>
        </div>
        <div class="badge-info">
          <h3>${badge.name}</h3>
          <p>${badge.desc}</p>
          <span class="badge-xp-reward">+${badge.xpReward} XP</span>
        </div>
      `;
      fullGrid.appendChild(card);
    });
  }
}

// -------------------------------------------------------------
// Dialog Modals Setup
// -------------------------------------------------------------
function generateColorPicker() {
  const colors = ['#FFD700', '#9D4EDD', '#00B4D8', '#FF007F', '#10B981', '#FF9F1C', '#00F5D4', '#70E000', '#9E2A2B', '#E0A100'];
  const grid = document.getElementById('colorPickerGrid');
  if (!grid) return;

  grid.innerHTML = '';
  colors.forEach((c, idx) => {
    const dot = document.createElement('div');
    dot.className = `color-dot ${idx === 0 ? 'active' : ''}`;
    dot.style.backgroundColor = c;
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      document.getElementById('habitColor').value = c;
    });
    grid.appendChild(dot);
  });
}

function openHabitModal(editId = null) {
  const modal = document.getElementById('habitModal');
  const title = document.getElementById('habitModalTitle');
  const submitBtn = document.getElementById('saveHabitBtn');
  const form = document.getElementById('habitForm');
  
  form.reset();
  formSelectedDays = new Set([1, 2, 3, 4, 5]); // Reset selection
  updateDaysGridUI();
  
  // Set default active picker color
  document.querySelectorAll('.color-dot').forEach((d, idx) => {
    d.classList.remove('active');
    if (idx === 0) d.classList.add('active');
  });
  document.getElementById('habitColor').value = '#FFD700';

  // Set default tabs
  document.querySelectorAll('.freq-tab').forEach((t, i) => {
    t.classList.remove('active');
    if (i === 0) t.classList.add('active');
  });
  document.getElementById('weeklyTargetContainer').classList.add('hidden');
  document.getElementById('specificDaysContainer').classList.add('hidden');

  if (editId) {
    const habit = state.habits.find(h => h.id === editId);
    if (habit) {
      title.textContent = "Edit Habit Details";
      submitBtn.textContent = "Save Changes";
      document.getElementById('editHabitId').value = habit.id;
      document.getElementById('habitName').value = habit.name;
      document.getElementById('habitDesc').value = habit.desc || '';
      document.getElementById('habitCategory').value = habit.category;
      document.getElementById('habitDifficulty').value = habit.difficulty;
      document.getElementById('habitTimeOfDay').value = habit.timeOfDay;
      document.getElementById('habitColor').value = habit.color;

      // Color picker active selection matching
      document.querySelectorAll('.color-dot').forEach(d => {
        d.classList.remove('active');
        // RGB check match
        if (d.style.backgroundColor === habit.color || hexToRgb(habit.color) === d.style.backgroundColor) {
          d.classList.add('active');
        }
      });

      // Frequency matches
      document.querySelectorAll('.freq-tab').forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('data-freq') === habit.frequency) {
          t.classList.add('active');
        }
      });

      if (habit.frequency === 'weekly') {
        document.getElementById('weeklyTargetContainer').classList.remove('hidden');
        document.getElementById('weeklyFrequencyCount').value = habit.weeklyTargetCount || 3;
      } else if (habit.frequency === 'specific') {
        document.getElementById('specificDaysContainer').classList.remove('hidden');
        formSelectedDays = new Set(habit.specificDays);
        updateDaysGridUI();
      }
    }
  } else {
    title.textContent = "Create Custom Habit";
    submitBtn.textContent = "Create Habit";
    document.getElementById('editHabitId').value = '';
  }

  modal.classList.add('active');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : '';
}

function closeHabitModal() {
  document.getElementById('habitModal').classList.remove('active');
}

function updateDaysGridUI() {
  document.querySelectorAll('.day-select-btn').forEach(btn => {
    const d = parseInt(btn.getAttribute('data-day'));
    if (formSelectedDays.has(d)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function handleHabitFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById('editHabitId').value;
  const name = document.getElementById('habitName').value.trim();
  const desc = document.getElementById('habitDesc').value.trim();
  const category = document.getElementById('habitCategory').value;
  const difficulty = document.getElementById('habitDifficulty').value;
  const timeOfDay = document.getElementById('habitTimeOfDay').value;
  const color = document.getElementById('habitColor').value;
  const frequency = document.querySelector('.freq-tab.active').getAttribute('data-freq');

  let weeklyTargetCount = null;
  let specificDays = [];

  if (frequency === 'weekly') {
    weeklyTargetCount = parseInt(document.getElementById('weeklyFrequencyCount').value);
  } else if (frequency === 'specific') {
    specificDays = Array.from(formSelectedDays);
    if (specificDays.length === 0) {
      alert("Please pick at least one weekday schedule.");
      return;
    }
  }

  if (editId) {
    // Edit existing
    const habit = state.habits.find(h => h.id === editId);
    if (habit) {
      habit.name = name;
      habit.desc = desc;
      habit.category = category;
      habit.difficulty = difficulty;
      habit.timeOfDay = timeOfDay;
      habit.color = color;
      habit.frequency = frequency;
      habit.weeklyTargetCount = weeklyTargetCount;
      habit.specificDays = specificDays;
    }
  } else {
    // New creation
    const newHabit = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      desc,
      category,
      difficulty,
      timeOfDay,
      color,
      frequency,
      weeklyTargetCount,
      specificDays,
      createdAt: new Date().toISOString(),
      history: {},
      archived: false
    };
    state.habits.push(newHabit);
  }

  saveData();
  closeHabitModal();
  updateStatsDashboard();
  renderTodayHabits();
  renderAllHabitsGrid();
  
  // Re-verify achievements
  checkAchievementsUnlock();
}

// Habit detail popup logic
let activeDetailHabitId = null;
function openHabitDetailsModal(habitId) {
  activeDetailHabitId = habitId;
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;

  const modal = document.getElementById('habitDetailModal');
  document.getElementById('detailHabitName').textContent = habit.name;
  document.getElementById('detailHabitName').style.color = habit.color;
  document.getElementById('detailDescription').textContent = habit.desc || 'No description notes included.';
  
  document.getElementById('detailCategoryTag').innerHTML = `<i class="fa-solid fa-layer-group"></i> ${habit.category}`;
  document.getElementById('detailTimeTag').innerHTML = `<i class="fa-solid fa-clock"></i> ${habit.timeOfDay}`;
  document.getElementById('detailDiffTag').innerHTML = `<i class="fa-solid fa-bolt"></i> ${habit.difficulty}`;

  const streak = calculateStreak(habit);
  document.getElementById('detailCurrentStreak').textContent = `${streak.current} Days`;
  document.getElementById('detailLongestStreak').textContent = `${streak.longest} Days`;
  
  const completionsCount = Object.keys(habit.history || {}).length;
  document.getElementById('detailTotalCompletions').textContent = completionsCount;

  // Completion percentage calculation
  let scheduledDaysCount = 0;
  let completeCount = 0;
  const creationDate = new Date(habit.createdAt);
  const today = new Date();
  
  let temp = new Date(creationDate);
  while (temp <= today) {
    const isSched = isHabitScheduledOnDateObj(habit, temp);
    if (isSched) {
      scheduledDaysCount++;
      if (isHabitCompletedOnDate(habit, getLocalDateString(temp))) {
        completeCount++;
      }
    }
    temp.setDate(temp.getDate() + 1);
  }

  const rate = scheduledDaysCount > 0 ? Math.round((completeCount / scheduledDaysCount) * 100) : 0;
  document.getElementById('detailCompletionRate').textContent = `${rate}%`;

  // Draw 30 circles history
  const grid = document.getElementById('detailHistoryGrid');
  grid.innerHTML = '';
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dStr = getLocalDateString(d);
    
    const wasSched = isHabitScheduledOnDateObj(habit, d);
    const wasDone = isHabitCompletedOnDate(habit, dStr);
    
    const circle = document.createElement('div');
    circle.className = `minigrid-circle ${wasDone ? 'done' : (!wasSched ? '' : 'missed')}`;
    circle.textContent = d.getDate();
    circle.setAttribute('title', `${dStr} - ${wasDone ? 'Completed' : (wasSched ? 'Missed' : 'Not Scheduled')}`);
    grid.appendChild(circle);
  }

  // Set action buttons state
  document.getElementById('detailArchiveBtn').innerHTML = habit.archived ? 
    `<i class="fa-solid fa-box-open"></i> Unarchive Habit` : 
    `<i class="fa-solid fa-box-archive"></i> Archive Habit`;

  // Setup click events once on modal buttons
  document.getElementById('detailEditBtn').onclick = () => {
    closeDetailModal();
    openHabitModal(habit.id);
  };

  document.getElementById('detailArchiveBtn').onclick = () => {
    habit.archived = !habit.archived;
    saveData();
    closeDetailModal();
    renderTodayHabits();
    renderAllHabitsGrid();
    updateStatsDashboard();
  };

  document.getElementById('detailDeleteBtn').onclick = () => {
    if (confirm(`Are you absolutely sure you want to delete "${habit.name}"? All history will be permanently wiped.`)) {
      state.habits = state.habits.filter(h => h.id !== habit.id);
      saveData();
      closeDetailModal();
      renderTodayHabits();
      renderAllHabitsGrid();
      updateStatsDashboard();
    }
  };

  modal.classList.add('active');
}

function closeDetailModal() {
  document.getElementById('habitDetailModal').classList.remove('active');
}

// -------------------------------------------------------------
// Heatmap Rendering Engine (Last 52 Weeks)
// -------------------------------------------------------------
function renderHeatmap() {
  const container = document.getElementById('heatmapGridContainer');
  const monthsRow = document.getElementById('heatmapMonthsRow');
  if (!container || !monthsRow) return;

  container.innerHTML = '';
  monthsRow.innerHTML = '';

  const today = new Date();
  
  // To display starting on Monday, find the Monday 52 weeks ago
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 364); // 52 weeks * 7 days
  const dayOffset = startDay.getDay() - 1; // alignment shift
  startDay.setDate(startDay.getDate() - (dayOffset < 0 ? 6 : dayOffset));

  const totalCells = 371; // 53 columns * 7 days
  let currentMonthStr = "";
  
  for (let i = 0; i < totalCells; i++) {
    const checkDate = new Date(startDay);
    checkDate.setDate(startDay.getDate() + i);
    
    const dateStr = getLocalDateString(checkDate);
    
    // Calculate total scheduled and completed
    const dayHabits = getScheduledHabitsForDate(checkDate);
    const completed = dayHabits.filter(h => isHabitCompletedOnDate(h, dateStr)).length;
    
    let level = 0;
    if (dayHabits.length > 0) {
      const completionRatio = completed / dayHabits.length;
      if (completionRatio > 0 && completionRatio <= 0.25) level = 1;
      else if (completionRatio > 0.25 && completionRatio <= 0.5) level = 2;
      else if (completionRatio > 0.5 && completionRatio <= 0.75) level = 3;
      else if (completionRatio > 0.75) level = 4;
    }

    const cell = document.createElement('div');
    cell.className = `heatmap-cell lvl-${level}`;
    cell.setAttribute('data-date', dateStr);
    cell.setAttribute('data-tooltip', `${checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${completed}/${dayHabits.length} habits completed`);
    
    // Calendar grid cell click event
    cell.addEventListener('click', () => {
      currentCalendarDate = new Date(checkDate);
      renderCalendarView();
    });

    container.appendChild(cell);

    // Place month labels dynamically
    if (checkDate.getDay() === 1) { // Only place labels at start of weeks
      const monthLabel = checkDate.toLocaleDateString('en-US', { month: 'short' });
      if (monthLabel !== currentMonthStr) {
        const colIndex = Math.floor(i / 7);
        const lbl = document.createElement('span');
        lbl.className = 'heatmap-month-lbl';
        lbl.style.left = `${colIndex * 15}px`; // (12px cell + 3px gap)
        lbl.textContent = monthLabel;
        monthsRow.appendChild(lbl);
        currentMonthStr = monthLabel;
      }
    }
  }
}

// -------------------------------------------------------------
// Monthly Grid Calendar View rendering
// -------------------------------------------------------------
function renderCalendarView() {
  const title = document.getElementById('calendarMonthYearTitle');
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid || !title) return;

  grid.innerHTML = '';
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  title.textContent = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Find first day of month (1-indexed day, Mon-Sun alignment)
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1; // 0 for Mon, -1 for Sun...
  if (startOffset < 0) startOffset = 6; // Sunday offset correction

  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Total cells in grid (6 rows of 7 days = 42 cells)
  const totalCells = 42;
  
  const tempDate = new Date(firstDay);
  tempDate.setDate(tempDate.getDate() - startOffset);

  const todayStr = getLocalDateString(new Date());

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(tempDate);
    const dateStr = getLocalDateString(cellDate);
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day-cell';
    
    if (cellDate.getMonth() !== month) {
      dayCell.classList.add('other-month');
    }
    
    if (dateStr === todayStr) {
      dayCell.classList.add('today');
    }

    dayCell.innerHTML = `<span class="cal-day-num">${cellDate.getDate()}</span>`;

    // Render tiny colored dots for completed habits on this day
    const scheduled = getScheduledHabitsForDate(cellDate);
    if (scheduled.length > 0) {
      const dotsWrapper = document.createElement('div');
      dotsWrapper.className = 'cal-day-habits';
      
      scheduled.forEach(habit => {
        if (isHabitCompletedOnDate(habit, dateStr)) {
          const dot = document.createElement('span');
          dot.className = 'cal-habit-dot';
          dot.style.backgroundColor = habit.color || '#FFD700';
          dot.setAttribute('title', habit.name);
          dotsWrapper.appendChild(dot);
        }
      });
      dayCell.appendChild(dotsWrapper);
    }

    // click event shows schedule overview for day
    dayCell.addEventListener('click', () => {
      let msg = `${cellDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} habits:\n\n`;
      let count = 0;
      scheduled.forEach(h => {
        const isDone = isHabitCompletedOnDate(h, dateStr);
        msg += `[${isDone ? 'X' : ' '}] ${h.name} (${h.category})\n`;
        count++;
      });
      if (count === 0) msg += "No habits scheduled.";
      alert(msg);
    });

    grid.appendChild(dayCell);
    tempDate.setDate(tempDate.getDate() + 1);
  }
}

// -------------------------------------------------------------
// Analytics Graphs Canvas (Chart.js Integration)
// -------------------------------------------------------------
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  // Theme checking for charts typography color
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9CA3AF' : '#4B5563';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // CHART 1: Last 7 Days Completion rate
  const today = new Date();
  const labels = [];
  const compPctData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const dayStr = getLocalDateString(d);
    const dayHabits = getScheduledHabitsForDate(d);
    const completed = dayHabits.filter(h => isHabitCompletedOnDate(h, dayStr)).length;
    const pct = dayHabits.length > 0 ? Math.round((completed / dayHabits.length) * 100) : 0;
    compPctData.push(pct);
  }

  const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
  if (charts.weekly) charts.weekly.destroy();
  charts.weekly = new Chart(ctxWeekly, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Completion Ratio (%)',
        data: compPctData,
        backgroundColor: '#9D4EDD',
        borderColor: '#9D4EDD',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: '#FFD700'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { 
          grid: { color: gridColor }, 
          ticks: { color: textColor, callback: (v) => v + '%' },
          min: 0,
          max: 100
        }
      }
    }
  });

  // CHART 2: Habits Categories density
  const catCounts = { health: 0, mind: 0, productivity: 0, custom: 0 };
  state.habits.forEach(h => {
    if (!h.archived) {
      catCounts[h.category] = (catCounts[h.category] || 0) + 1;
    }
  });

  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  if (charts.category) charts.category.destroy();
  charts.category = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: ['Health', 'Mind & Soul', 'Productivity', 'Custom'],
      datasets: [{
        data: [catCounts.health, catCounts.mind, catCounts.productivity, catCounts.custom],
        backgroundColor: ['#10B981', '#FFD700', '#9D4EDD', '#00B4D8'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'right',
          labels: { color: textColor }
        }
      }
    }
  });

  // CHART 3: Past 30 Days completions trend line
  const trendLabels = [];
  const trendData = [];
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    // Show dates e.g. "May 12"
    trendLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    const dayStr = getLocalDateString(d);
    // Count total completions across all habits on this day
    let count = 0;
    state.habits.forEach(h => {
      if (isHabitCompletedOnDate(h, dayStr)) count++;
    });
    trendData.push(count);
  }

  const ctxMonthly = document.getElementById('monthlyTrendChart').getContext('2d');
  if (charts.monthly) charts.monthly.destroy();
  charts.monthly = new Chart(ctxMonthly, {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [{
        label: 'Total Habits Completed',
        data: trendData,
        borderColor: '#00B4D8',
        backgroundColor: 'rgba(0, 180, 216, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#FFD700'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } },
        y: { 
          grid: { color: gridColor }, 
          ticks: { color: textColor, precision: 0 }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// Analytics AI Insights rendering
// -------------------------------------------------------------
function renderInsights() {
  const container = document.getElementById('insightsCardGrid');
  if (!container) return;

  container.innerHTML = '';

  const activeHabits = state.habits.filter(h => !h.archived);
  
  if (activeHabits.length === 0) {
    container.innerHTML = `<span class="setting-desc" style="grid-column: span 10;">No insights available. Add habits to generate advice.</span>`;
    return;
  }

  // Insight 1: Most consistent habit
  let bestHabit = null;
  let bestStreak = -1;
  activeHabits.forEach(h => {
    const s = calculateStreak(h).current;
    if (s > bestStreak) {
      bestStreak = s;
      bestHabit = h;
    }
  });

  const cards = [];

  if (bestHabit && bestStreak > 0) {
    cards.push({
      title: 'Consistency Star',
      text: `Your habit "${bestHabit.name}" is leading the charge with a solid ${bestStreak}-day streak! Keep guarding this flame.`,
      icon: 'fa-solid fa-fire text-gold',
      glow: 'gold-glow'
    });
  }

  // Insight 2: Category balance advice
  const catCounts = { health: 0, mind: 0, productivity: 0, custom: 0 };
  activeHabits.forEach(h => {
    catCounts[h.category]++;
  });

  const zeros = Object.keys(catCounts).filter(k => catCounts[k] === 0 && k !== 'custom');
  if (zeros.length > 0) {
    const nameMap = { health: 'Health & Fitness', mind: 'Mind & Soul', productivity: 'Productivity' };
    const missing = zeros.map(z => nameMap[z]).join(' and ');
    cards.push({
      title: 'Routine Balance Alert',
      text: `Consider creating habits in ${missing} to build a more balanced, multi-dimensional lifestyle routine.`,
      icon: 'fa-solid fa-scale-balanced text-purple',
      glow: 'purple-glow'
    });
  } else {
    cards.push({
      title: 'Symphony of Routine',
      text: `Fantastic balance! You are nurturing Health, Mind, and Productivity simultaneously. This is the optimal recipe for longevity.`,
      icon: 'fa-solid fa-hands-holding text-green',
      glow: 'green-glow'
    });
  }

  // Insight 3: Completion time bias
  const timeCounts = { morning: 0, afternoon: 0, evening: 0 };
  activeHabits.forEach(h => {
    timeCounts[h.timeOfDay]++;
  });

  let bias = 'morning';
  if (timeCounts.afternoon > timeCounts.morning) bias = 'afternoon';
  if (timeCounts.evening > timeCounts[bias]) bias = 'evening';

  cards.push({
    title: 'Routine Energy Curve',
    text: `You have designed most habits for the ${bias}. Studies show doing heavy work when your willpower aligns produces 40% higher success.`,
    icon: 'fa-solid fa-chart-simple text-blue',
    glow: 'blue-glow'
  });

  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = `insight-card ${card.glow}`;
    el.innerHTML = `
      <div class="insight-icon"><i class="${card.icon}"></i></div>
      <div class="insight-body">
        <h4>${card.title}</h4>
        <p>${card.text}</p>
      </div>
    `;
    container.appendChild(el);
  });
}

// -------------------------------------------------------------
// Settings Page utilities
// -------------------------------------------------------------
function populateSettingsForm() {
  document.getElementById('settingsProfileName').value = state.userStats.profileName;
  document.getElementById('soundToggle').checked = state.settings.soundOn;
  document.getElementById('notificationsToggle').checked = state.settings.notificationsOn;
}

// -------------------------------------------------------------
// Mock Data Generation for quick evaluation & testing
// -------------------------------------------------------------
function generateMockHistory() {
  // Clear and prepare 3 mock habits
  const mockHabits = [
    {
      id: 'habit_mock_1',
      name: 'Morning Meditation',
      desc: '10 minutes deep mindful breathing',
      category: 'mind',
      difficulty: 'easy',
      timeOfDay: 'morning',
      color: '#9D4EDD', // purple
      frequency: 'daily',
      weeklyTargetCount: null,
      specificDays: [],
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
      history: {},
      archived: false
    },
    {
      id: 'habit_mock_2',
      name: 'Gym Workout',
      desc: 'Weight lifting or 3km running',
      category: 'health',
      difficulty: 'hard',
      timeOfDay: 'afternoon',
      color: '#10B981', // green
      frequency: 'specific',
      weeklyTargetCount: null,
      specificDays: [1, 3, 5], // Mon, Wed, Fri
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      history: {},
      archived: false
    },
    {
      id: 'habit_mock_3',
      name: 'Coding Routine',
      desc: 'Solve 1 algorithmic problem on LeetCode',
      category: 'productivity',
      difficulty: 'medium',
      timeOfDay: 'evening',
      color: '#FFD700', // gold
      frequency: 'daily',
      weeklyTargetCount: null,
      specificDays: [],
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      history: {},
      archived: false
    }
  ];

  // Fill 35 days of history ending today
  const today = new Date();
  for (let i = 35; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    // Meditation done 85% of time
    if (Math.random() < 0.85) {
      mockHabits[0].history[dateStr] = true;
    }
    
    // Workout done Mon/Wed/Fri with 70% accuracy
    const day = d.getDay();
    if ([1,3,5].includes(day) && Math.random() < 0.70) {
      mockHabits[1].history[dateStr] = true;
    }

    // Coding done 90% of time
    if (Math.random() < 0.90) {
      mockHabits[2].history[dateStr] = true;
    }
  }

  // Overwrite state
  state.habits = mockHabits;
  state.userStats = {
    points: 740,
    xp: 40,
    level: 8,
    profileName: state.userStats.profileName
  };
  state.unlockedAchievements = ['first_habit', 'streak_3', 'streak_7', 'well_rounded'];
  
  saveData();
  alert("Generated 35 days of rich data! Refreshing dashboard.");
  window.location.reload();
}

// Escape HTML utility
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
