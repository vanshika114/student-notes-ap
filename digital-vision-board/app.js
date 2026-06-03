/* ==========================================================================
   AuraBoard JavaScript Engine — Goal Cards, Image Upload, Habits & Achievements
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Initialization ---
  let goals = JSON.parse(localStorage.getItem('auraboard_goals')) || [];
  let habits = JSON.parse(localStorage.getItem('auraboard_habits')) || [
    { id: '1', name: 'Visualize goals for 5 minutes', completed: false },
    { id: '2', name: 'Take one actionable step', completed: false }
  ];
  let streak = parseInt(localStorage.getItem('auraboard_streak')) || 0;
  let lastActiveDate = localStorage.getItem('auraboard_last_active') || '';
  let activeTheme = localStorage.getItem('auraboard_theme') || 'dark';
  let activeBg = localStorage.getItem('auraboard_bg') || 'default';
  let activeFilter = 'all';

  // Fallback quotes database
  const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "Your vision will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.", author: "Carl Jung" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Visualize this thing that you want, see it, feel it, believe in it. Make your mental blue print, and begin to build.", author: "Robert Collier" }
  ];

  // Achievements definitions
  const achievementsList = [
    { id: 'anchor', title: 'First Anchor', desc: 'Anchor your first aspiration card', icon: 'anchor' },
    { id: 'visionary', title: 'Visionary', desc: 'Create 5 vision board cards', icon: 'eye' },
    { id: 'manifest', title: 'Manifestation', desc: 'Complete your first goal', icon: 'check-circle' },
    { id: 'consistency', title: 'Momentum', desc: 'Achieve a 3-day habit streak', icon: 'flame' },
    { id: 'visual', title: 'Visualizer', desc: 'Upload an inspirational anchor image', icon: 'image' }
  ];

  let unlockedAchievements = JSON.parse(localStorage.getItem('auraboard_achievements')) || [];

  // SVG Radial Gradient template injector (needed for radial progress gradient stroke)
  injectSVGDefs();

  // --- Selectors ---
  const themeToggle = document.getElementById('themeToggle');
  const btnNewGoal = document.getElementById('btnNewGoal');
  const btnEmptyCreate = document.getElementById('btnEmptyCreate');
  const goalModal = document.getElementById('goalModal');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnCancel = document.getElementById('btnCancel');
  const goalForm = document.getElementById('goalForm');
  const boardGrid = document.getElementById('boardGrid');
  const emptyState = document.getElementById('emptyState');
  const goalSearch = document.getElementById('goalSearch');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Stats UI
  const radialBar = document.getElementById('radialProgress');
  const txtProgressPercent = document.getElementById('txtProgressPercent');
  const activeGoalCount = document.getElementById('activeGoalCount');
  const totalGoalCount = document.getElementById('totalGoalCount');

  // Customization
  const bgBtns = document.querySelectorAll('.bg-btn');

  // Habits UI
  const habitListEl = document.getElementById('habitList');
  const btnAddHabit = document.getElementById('btnAddHabit');
  const habitModal = document.getElementById('habitModal');
  const btnHabitModalClose = document.getElementById('btnHabitModalClose');
  const btnHabitCancel = document.getElementById('btnHabitCancel');
  const habitForm = document.getElementById('habitForm');
  const streakCountEl = document.getElementById('streakCount');

  // Image Upload elements
  const goalImageFileInput = document.getElementById('goalImageFile');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadPreviewContainer = document.getElementById('uploadPreviewContainer');
  const uploadPreview = document.getElementById('uploadPreview');
  const btnRemoveImage = document.getElementById('btnRemoveImage');
  let currentUploadedBase64 = "";

  // Progress range label update
  const goalProgressRange = document.getElementById('goalProgressRange');
  const progressValueText = document.getElementById('progressValueText');

  // Quote elements
  const motivationalQuote = document.getElementById('motivationalQuote');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const btnNextQuote = document.getElementById('btnNextQuote');

  // Edit fields
  const editGoalId = document.getElementById('editGoalId');
  const goalTitleInput = document.getElementById('goalTitleInput');
  const goalCategorySelect = document.getElementById('goalCategorySelect');
  const goalTargetDate = document.getElementById('goalTargetDate');
  const goalNotesInput = document.getElementById('goalNotesInput');

  // --- Event Listeners ---
  themeToggle.addEventListener('click', toggleTheme);
  btnNewGoal.addEventListener('click', () => openGoalModal());
  if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => openGoalModal());
  btnModalClose.addEventListener('click', closeGoalModal);
  btnCancel.addEventListener('click', closeGoalModal);
  goalForm.addEventListener('submit', handleGoalSubmit);

  goalSearch.addEventListener('input', renderBoard);
  btnNextQuote.addEventListener('click', setRandomQuote);

  goalProgressRange.addEventListener('input', (e) => {
    progressValueText.innerText = `${e.target.value}%`;
  });

  // Background Selection
  bgBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-bg');
      setBoardMood(mood);
    });
  });

  // Habits triggers
  btnAddHabit.addEventListener('click', openHabitModal);
  btnHabitModalClose.addEventListener('click', closeHabitModal);
  btnHabitCancel.addEventListener('click', closeHabitModal);
  habitForm.addEventListener('submit', handleHabitSubmit);

  // File Upload handling
  goalImageFileInput.addEventListener('change', handleImageUpload);
  btnRemoveImage.addEventListener('click', removeUploadedImage);

  // Category Filtering
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderBoard();
    });
  });

  // Drag and Drop helpers
  boardGrid.addEventListener('dragover', handleDragOver);
  boardGrid.addEventListener('drop', handleDrop);

  // Initialize UI
  document.documentElement.setAttribute('data-theme', activeTheme);
  setBoardMood(activeBg);
  checkStreakReset();
  setRandomQuote();
  renderBoard();
  renderHabits();
  renderAchievements();
  updateAnalytics();
  lucide.createIcons();

  // --- SVG Defs Injector ---
  function injectSVGDefs() {
    const existingSvg = document.querySelector('.radial-progress-svg');
    if (existingSvg) {
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4299e1" />
          <stop offset="100%" stop-color="#9f7aea" />
        </linearGradient>
      `;
      existingSvg.appendChild(defs);
    }
  }

  // --- Themes & mood moods ---
  function toggleTheme() {
    activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('auraboard_theme', activeTheme);
  }

  function setBoardMood(mood) {
    activeBg = mood;
    localStorage.setItem('auraboard_bg', mood);
    // Remove other background classes
    document.body.className = '';
    bgBtns.forEach(btn => btn.classList.remove('active'));
    
    if (mood !== 'default') {
      document.body.classList.add(`bg-${mood}`);
    }
    const matchingBtn = document.querySelector(`.bg-btn[data-bg="${mood}"]`);
    if (matchingBtn) matchingBtn.classList.add('active');
  }

  // --- Quote Generator ---
  function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    motivationalQuote.innerText = `"${quotes[randomIndex].text}"`;
    quoteAuthor.innerText = `— ${quotes[randomIndex].author}`;
  }

  // --- Habit Management Logic ---
  function openHabitModal() {
    habitModal.classList.add('active');
  }

  function closeHabitModal() {
    habitModal.classList.remove('active');
    habitForm.reset();
  }

  function handleHabitSubmit(e) {
    e.preventDefault();
    const habitName = document.getElementById('habitNameInput').value.trim();
    if (!habitName) return;

    const newHabit = {
      id: Date.now().toString(),
      name: habitName,
      completed: false
    };

    habits.push(newHabit);
    saveHabits();
    renderHabits();
    closeHabitModal();
  }

  function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      habit.completed = !habit.completed;
      saveHabits();
      renderHabits();
      updateStreak();
    }
  }

  function deleteHabit(id, e) {
    e.stopPropagation();
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    renderHabits();
    updateStreak();
  }

  function renderHabits() {
    habitListEl.innerHTML = '';
    habits.forEach(habit => {
      const item = document.createElement('div');
      item.className = `habit-item ${habit.completed ? 'completed' : ''}`;
      item.addEventListener('click', () => toggleHabit(habit.id));

      item.innerHTML = `
        <div class="habit-info">
          <div class="checkbox-circle">
            <i data-lucide="check"></i>
          </div>
          <span class="habit-name">${habit.name}</span>
        </div>
        <div class="habit-actions">
          <button class="btn-icon btn-small btn-delete-habit" title="Remove action">
            <i data-lucide="x"></i>
          </button>
        </div>
      `;

      item.querySelector('.btn-delete-habit').addEventListener('click', (e) => deleteHabit(habit.id, e));
      habitListEl.appendChild(item);
    });

    streakCountEl.innerText = streak;
    lucide.createIcons();
  }

  function saveHabits() {
    localStorage.setItem('auraboard_habits', JSON.stringify(habits));
  }

  // Check streak consistency
  function checkStreakReset() {
    const todayStr = new Date().toDateString();
    if (lastActiveDate && lastActiveDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActiveDate !== yesterday.toDateString()) {
        // More than 1 day since last activity -> reset streak
        streak = 0;
        localStorage.setItem('auraboard_streak', streak);
      }
      // Reset habit checkmarks for the new day
      habits.forEach(h => h.completed = false);
      saveHabits();
    }
  }

  function updateStreak() {
    const allCompleted = habits.length > 0 && habits.every(h => h.completed);
    const todayStr = new Date().toDateString();

    if (allCompleted && lastActiveDate !== todayStr) {
      streak += 1;
      lastActiveDate = todayStr;
      localStorage.setItem('auraboard_streak', streak);
      localStorage.setItem('auraboard_last_active', lastActiveDate);
      streakCountEl.innerText = streak;
      checkAchievements();
    }
  }

  // --- Image Upload Helpers ---
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      currentUploadedBase64 = evt.target.result;
      uploadPreview.src = currentUploadedBase64;
      uploadPlaceholder.style.display = 'none';
      uploadPreviewContainer.style.display = 'block';
      checkAchievements(); // Visualizer unlocked badge check
    };
    reader.readAsDataURL(file);
  }

  function removeUploadedImage() {
    currentUploadedBase64 = "";
    uploadPreview.src = "";
    uploadPreviewContainer.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
    goalImageFileInput.value = "";
  }

  // --- Goal CRUD Modal Engine ---
  function openGoalModal(goalId = null) {
    if (goalId) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        document.getElementById('modalTitle').innerText = 'Edit Vision Card';
        editGoalId.value = goal.id;
        goalTitleInput.value = goal.title;
        goalCategorySelect.value = goal.category;
        goalTargetDate.value = goal.targetDate || '';
        goalNotesInput.value = goal.notes || '';
        goalProgressRange.value = goal.progress || 0;
        progressValueText.innerText = `${goal.progress || 0}%`;

        if (goal.imageBase64) {
          currentUploadedBase64 = goal.imageBase64;
          uploadPreview.src = currentUploadedBase64;
          uploadPlaceholder.style.display = 'none';
          uploadPreviewContainer.style.display = 'block';
        } else {
          removeUploadedImage();
        }
      }
    } else {
      document.getElementById('modalTitle').innerText = 'Create Vision Card';
      editGoalId.value = '';
      goalForm.reset();
      progressValueText.innerText = '0%';
      removeUploadedImage();
    }
    goalModal.classList.add('active');
  }

  function closeGoalModal() {
    goalModal.classList.remove('active');
    goalForm.reset();
    removeUploadedImage();
  }

  function handleGoalSubmit(e) {
    e.preventDefault();

    const title = goalTitleInput.value.trim();
    const category = goalCategorySelect.value;
    const targetDate = goalTargetDate.value;
    const notes = goalNotesInput.value.trim();
    const progress = parseInt(goalProgressRange.value);
    const isCompleted = progress === 100;

    if (!title) return;

    const goalId = editGoalId.value;

    if (goalId) {
      // Edit mode
      const idx = goals.findIndex(g => g.id === goalId);
      if (idx !== -1) {
        goals[idx] = {
          ...goals[idx],
          title,
          category,
          targetDate,
          notes,
          progress,
          isCompleted,
          imageBase64: currentUploadedBase64
        };
      }
    } else {
      // Create mode
      const newGoal = {
        id: Date.now().toString(),
        title,
        category,
        targetDate,
        notes,
        progress,
        isCompleted,
        imageBase64: currentUploadedBase64,
        dragOrder: goals.length
      };
      goals.push(newGoal);
    }

    saveGoals();
    renderBoard();
    updateAnalytics();
    checkAchievements();
    closeGoalModal();
  }

  function deleteGoal(id, e) {
    e.stopPropagation();
    goals = goals.filter(g => g.id !== id);
    saveGoals();
    renderBoard();
    updateAnalytics();
  }

  function toggleGoalComplete(id, e) {
    e.stopPropagation();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.isCompleted = !goal.isCompleted;
      goal.progress = goal.isCompleted ? 100 : 0;
      saveGoals();
      renderBoard();
      updateAnalytics();
      checkAchievements();
    }
  }

  function saveGoals() {
    localStorage.setItem('auraboard_goals', JSON.stringify(goals));
  }

  // --- Rendering Functions ---
  function renderBoard() {
    boardGrid.innerHTML = '';
    const searchQuery = goalSearch.value.toLowerCase().trim();

    // Filter logic
    let filteredGoals = goals;
    if (activeFilter !== 'all') {
      filteredGoals = filteredGoals.filter(g => g.category === activeFilter);
    }
    if (searchQuery) {
      filteredGoals = filteredGoals.filter(g => 
        g.title.toLowerCase().includes(searchQuery) || 
        g.notes.toLowerCase().includes(searchQuery)
      );
    }

    // Sort by drag order index
    filteredGoals.sort((a, b) => (a.dragOrder ?? 0) - (b.dragOrder ?? 0));

    if (filteredGoals.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'flex';
        boardGrid.appendChild(emptyState);
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    filteredGoals.forEach(goal => {
      const card = document.createElement('div');
      card.className = `goal-card glass ${goal.isCompleted ? 'goal-completed' : ''}`;
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', goal.id);

      // Drag listeners
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);

      const hasImg = !!goal.imageBase64;
      const formattedDate = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'No Target Date';

      card.innerHTML = `
        ${goal.isCompleted ? `
          <div class="card-complete-overlay" title="Goal Achieved!">
            <i data-lucide="check"></i>
          </div>
        ` : ''}
        
        ${hasImg ? `
          <img src="${goal.imageBase64}" class="goal-card-image" alt="Motivational anchor">
        ` : `
          <div class="goal-card-placeholder">
            <i data-lucide="sparkles" style="width: 32px; height: 32px; opacity: 0.6;"></i>
          </div>
        `}

        <div class="goal-card-content">
          <div class="goal-card-header">
            <span class="category-tag tag-${goal.category}">${goal.category}</span>
            <div class="card-actions">
              <button class="btn-icon btn-small btn-complete-goal" title="${goal.isCompleted ? 'Mark Active' : 'Mark Completed'}">
                <i data-lucide="${goal.isCompleted ? 'rotate-ccw' : 'check'}"></i>
              </button>
              <button class="btn-icon btn-small btn-edit-goal" title="Edit Card">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-icon btn-small btn-delete-goal" title="Remove Card">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
          
          <h4 class="goal-card-title">${escapeHTML(goal.title)}</h4>
          <p class="goal-card-notes">${escapeHTML(goal.notes || 'Visualize your outcome daily.')}</p>
          
          <div class="goal-card-footer">
            <div class="progress-bar-container">
              <div class="progress-track">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
              </div>
              <span class="progress-percent">${goal.progress}%</span>
            </div>
            <div class="manifest-date">
              <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
              <span>${formattedDate}</span>
            </div>
          </div>
        </div>
      `;

      // Assign event handlers to items
      card.querySelector('.btn-edit-goal').addEventListener('click', () => openGoalModal(goal.id));
      card.querySelector('.btn-delete-goal').addEventListener('click', (e) => deleteGoal(goal.id, e));
      card.querySelector('.btn-complete-goal').addEventListener('click', (e) => toggleGoalComplete(goal.id, e));

      boardGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  // --- Analytical Calculations ---
  function updateAnalytics() {
    const total = goals.length;
    const completed = goals.filter(g => g.isCompleted).length;
    const active = total - completed;

    activeGoalCount.innerText = active;
    totalGoalCount.innerText = total;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    txtProgressPercent.innerText = `${percentage}%`;

    // Radial Progress circular offset calculations
    // stroke-dashoffset = circumference - (percentage / 100 * circumference)
    // circumference = 2 * pi * r = 2 * 3.14159 * 40 = 251.2
    const circumference = 251.2;
    const offset = circumference - (percentage / 100 * circumference);
    radialBar.style.strokeDashoffset = offset;
  }

  // --- Achievements System ---
  function renderAchievements() {
    const badgeContainer = document.getElementById('badgeContainer');
    badgeContainer.innerHTML = '';

    achievementsList.forEach(badge => {
      const isUnlocked = unlockedAchievements.includes(badge.id);
      const badgeItem = document.createElement('div');
      badgeItem.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
      badgeItem.title = `${badge.title}: ${badge.desc}`;

      badgeItem.innerHTML = `
        <div class="badge-icon">
          <i data-lucide="${badge.icon}"></i>
        </div>
        <span>${badge.title}</span>
      `;
      badgeContainer.appendChild(badgeItem);
    });
    lucide.createIcons();
  }

  function checkAchievements() {
    let newlyUnlocked = false;

    // Anchor
    if (goals.length >= 1 && !unlockedAchievements.includes('anchor')) {
      unlockedAchievements.push('anchor');
      newlyUnlocked = true;
    }
    // Visionary
    if (goals.length >= 5 && !unlockedAchievements.includes('visionary')) {
      unlockedAchievements.push('visionary');
      newlyUnlocked = true;
    }
    // Manifest
    if (goals.some(g => g.isCompleted) && !unlockedAchievements.includes('manifest')) {
      unlockedAchievements.push('manifest');
      newlyUnlocked = true;
    }
    // Consistency
    if (streak >= 3 && !unlockedAchievements.includes('consistency')) {
      unlockedAchievements.push('consistency');
      newlyUnlocked = true;
    }
    // Visualizer (visual)
    if (goals.some(g => g.imageBase64) && !unlockedAchievements.includes('visual')) {
      unlockedAchievements.push('visual');
      newlyUnlocked = true;
    }

    if (newlyUnlocked) {
      localStorage.setItem('auraboard_achievements', JSON.stringify(unlockedAchievements));
      renderAchievements();
    }
  }

  // --- Reordering & Drag API Handling ---
  let draggedCard = null;

  function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCard = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!draggedCard) return;

    // Determine target location card position
    const targetCard = e.target.closest('.goal-card');
    if (!targetCard || targetCard === draggedCard) return;

    const gridChildren = Array.from(boardGrid.children);
    const draggedIdx = gridChildren.indexOf(draggedCard);
    const targetIdx = gridChildren.indexOf(targetCard);

    // Swap elements in goals list indexes & dragOrder
    const draggedId = draggedCard.getAttribute('data-id');
    const targetId = targetCard.getAttribute('data-id');

    const draggedGoal = goals.find(g => g.id === draggedId);
    const targetGoal = goals.find(g => g.id === targetId);

    if (draggedGoal && targetGoal) {
      const tempOrder = draggedGoal.dragOrder;
      draggedGoal.dragOrder = targetGoal.dragOrder;
      targetGoal.dragOrder = tempOrder;

      saveGoals();
      renderBoard();
    }
  }

  // --- Utility Escapes ---
  function escapeHTML(str) {
    if (!str) return '';
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
});
