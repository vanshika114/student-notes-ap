/**
 * FocusFlow Dashboard - Main Script
 * Vanilla JS implementation of Timer, Tasks, Widgets, and Analytics.
 */

// --- Constants & Defaults ---
const DEFAULT_DURATIONS = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
};

// These will be updated dynamically from storage on init
const TIMER_MODES = {
    pomodoro: { time: DEFAULT_DURATIONS.pomodoro * 60, label: 'Time to focus!' },
    shortBreak: { time: DEFAULT_DURATIONS.shortBreak * 60, label: 'Take a short break.' },
    longBreak: { time: DEFAULT_DURATIONS.longBreak * 60, label: 'Take a long break.' }
};

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
];

// --- Storage Manager ---
const StorageManager = {
    data: {
        tasks: [],
        stats: {
            sessions: 0,
            minutes: 0,
            streak: 0,
            lastSessionDate: null
        },
        settings: {
            theme: 'dark',
            soundEnabled: true,
            timerDurations: { ...DEFAULT_DURATIONS }
        }
    },

    init() {
        const stored = localStorage.getItem('focusFlowData');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                
                // Deep merge settings
                const settings = parsed.settings || {};
                const timerDurations = settings.timerDurations || { ...DEFAULT_DURATIONS };
                
                this.data = { ...this.data, ...parsed };
                this.data.settings = { ...this.data.settings, ...settings };
                this.data.settings.timerDurations = { ...this.data.settings.timerDurations, ...timerDurations };
                
                this.checkStreak();
            } catch (e) {
                console.error('Error parsing stored data', e);
            }
        }
    },

    save() {
        localStorage.setItem('focusFlowData', JSON.stringify(this.data));
    },

    checkStreak() {
        const today = new Date().toDateString();
        const last = this.data.stats.lastSessionDate;
        
        if (!last) return;
        
        if (last !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (last === yesterday.toDateString()) {
                // Streak continues, will be incremented on next session
            } else {
                // Streak broken
                this.data.stats.streak = 0;
                this.data.stats.minutes = 0; // Reset daily minutes
                this.save();
            }
        }
    },

    addSession(minutes) {
        const today = new Date().toDateString();
        
        if (this.data.stats.lastSessionDate !== today) {
            this.data.stats.minutes = 0; // Reset daily minutes on new day
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (this.data.stats.lastSessionDate === yesterday.toDateString() || !this.data.stats.lastSessionDate) {
                this.data.stats.streak++;
            } else {
                this.data.stats.streak = 1;
            }
        }
        
        this.data.stats.sessions++;
        this.data.stats.minutes += minutes;
        this.data.stats.lastSessionDate = today;
        this.save();
    }
};

// --- Effects Manager ---
const EffectsManager = {
    audioContext: null,

    init() {
        // AudioContext needs user interaction to start, will be created on demand
    },

    playBellSound() {
        if (!StorageManager.data.settings.soundEnabled) return;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Synthesize a soft bell sound
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 1.5);

        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 1.5);
    },

    fireConfetti() {
        if (typeof confetti === 'function') {
            const count = 200;
            const defaults = {
                origin: { y: 0.7 },
                zIndex: 1000
            };

            function fire(particleRatio, opts) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        }
    }
};

// --- Theme & Settings Manager ---
const ThemeManager = {
    init() {
        const theme = StorageManager.data.settings.theme;
        const sound = StorageManager.data.settings.soundEnabled;
        
        this.applyTheme(theme);
        this.updateSoundIcon(sound);
        
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
            this.applyTheme(newTheme);
            StorageManager.data.settings.theme = newTheme;
            StorageManager.save();
        });

        document.getElementById('sound-toggle').addEventListener('click', () => {
            const newSound = !StorageManager.data.settings.soundEnabled;
            StorageManager.data.settings.soundEnabled = newSound;
            this.updateSoundIcon(newSound);
            StorageManager.save();
        });
    },

    applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            document.getElementById('theme-icon').className = 'ph ph-moon';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            document.getElementById('theme-icon').className = 'ph ph-sun';
        }
    },

    updateSoundIcon(enabled) {
        const icon = document.getElementById('sound-icon');
        icon.className = enabled ? 'ph ph-speaker-high' : 'ph ph-speaker-slash';
    }
};

// --- Widgets Manager ---
const WidgetManager = {
    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.setQuote();
    },

    updateClock() {
        const now = new Date();
        
        // Time
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        document.getElementById('current-time').textContent = `${hours}:${minutes}`;
        document.getElementById('am-pm').textContent = ampm;

        // Date
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);

        // Greeting
        const currentHour = now.getHours();
        let greeting = 'Good evening';
        if (currentHour < 12) greeting = 'Good morning';
        else if (currentHour < 17) greeting = 'Good afternoon';
        
        document.getElementById('greeting-text').textContent = `${greeting}, Focus`;
    },

    setQuote() {
        // Daily quote based on day of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const quote = QUOTES[dayOfYear % QUOTES.length];
        
        document.getElementById('quote-text').textContent = `"${quote.text}"`;
        document.getElementById('quote-author').textContent = `- ${quote.author}`;
    }
};

// --- Stats Manager ---
const StatsManager = {
    init() {
        this.render();
    },

    render() {
        const { sessions, minutes, streak } = StorageManager.data.stats;
        
        // Animate numbers
        this.animateValue('stat-streak', parseInt(document.getElementById('stat-streak').innerText) || 0, streak, 1000);
        this.animateValue('stat-sessions', parseInt(document.getElementById('stat-sessions').innerText) || 0, sessions, 1000);
        this.animateValue('stat-minutes', parseInt(document.getElementById('stat-minutes').innerText) || 0, minutes, 1000);
    },

    animateValue(id, start, end, duration) {
        if (start === end) {
            document.getElementById(id).innerText = end;
            return;
        }
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            document.getElementById(id).innerText = Math.floor(easeProgress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

// --- Dropdown Manager ---
const DropdownManager = {
    init() {
        this.dropdown = document.getElementById('priority-dropdown');
        this.selected = document.getElementById('priority-selected');
        this.list = document.getElementById('priority-list');
        this.options = this.list.querySelectorAll('.dropdown-option');
        this.input = document.getElementById('task-priority');
        this.selectedText = this.selected.querySelector('.selected-text');
        this.selectedIndicator = this.selected.querySelector('.priority-indicator');

        // Toggle dropdown
        this.selected.addEventListener('click', () => this.toggle());
        
        // Handle keyboard navigation on main dropdown
        this.dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.open();
            }
        });

        // Handle option selection
        this.options.forEach(option => {
            option.addEventListener('click', () => this.selectOption(option));
            
            // Keyboard navigation on options
            option.setAttribute('tabindex', '-1');
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectOption(option);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (option.nextElementSibling) option.nextElementSibling.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (option.previousElementSibling) option.previousElementSibling.focus();
                } else if (e.key === 'Escape') {
                    this.close();
                }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.close();
            }
        });
    },

    toggle() {
        const isOpen = this.dropdown.classList.contains('open');
        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.dropdown.classList.add('open');
        this.dropdown.setAttribute('aria-expanded', 'true');
        // Focus first option or selected option
        const selected = Array.from(this.options).find(opt => opt.getAttribute('aria-selected') === 'true') || this.options[0];
        
        // Give options tabindex 0 so they can be focused while open
        this.options.forEach(opt => opt.setAttribute('tabindex', '0'));
        selected.focus();
    },

    close() {
        this.dropdown.classList.remove('open');
        this.dropdown.setAttribute('aria-expanded', 'false');
        // Remove tabindex when closed
        this.options.forEach(opt => opt.setAttribute('tabindex', '-1'));
        this.dropdown.focus();
    },

    selectOption(option) {
        const value = option.dataset.value;
        const text = option.textContent.trim();
        const indicatorClass = option.querySelector('.priority-indicator').className;
        
        // Update input and selected display
        this.input.value = value;
        this.selectedText.textContent = text;
        this.selectedIndicator.className = indicatorClass;

        // Update aria-selected
        this.options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
        option.setAttribute('aria-selected', 'true');

        this.close();
    },

    reset() {
        // Reset to medium
        const medOption = Array.from(this.options).find(opt => opt.dataset.value === 'medium');
        if (medOption) this.selectOption(medOption);
    }
};

// --- Task Manager ---
const TaskManager = {
    init() {
        this.form = document.getElementById('add-task-form');
        this.input = document.getElementById('new-task-input');
        this.prioritySelect = document.getElementById('task-priority');
        this.list = document.getElementById('task-list');
        this.emptyState = document.getElementById('empty-state');
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        this.render();
    },

    addTask() {
        const text = this.input.value.trim();
        if (!text) return;

        const task = {
            id: Date.now().toString(),
            text,
            priority: this.prioritySelect.value,
            completed: false,
            createdAt: Date.now()
        };

        StorageManager.data.tasks.push(task);
        StorageManager.save();
        
        this.input.value = '';
        DropdownManager.reset();
        this.render();
    },

    deleteTask(id) {
        StorageManager.data.tasks = StorageManager.data.tasks.filter(t => t.id !== id);
        StorageManager.save();
        this.render();
    },

    toggleTask(id) {
        const task = StorageManager.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            StorageManager.save();
            this.render();
        }
    },

    updateTaskText(id, newText) {
        const task = StorageManager.data.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            StorageManager.save();
        }
    },

    render() {
        this.list.innerHTML = '';
        const tasks = StorageManager.data.tasks;

        if (tasks.length === 0) {
            this.emptyState.style.display = 'flex';
        } else {
            this.emptyState.style.display = 'none';
            
            // Sort: incomplete first, then by priority (high -> med -> low)
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const sortedTasks = [...tasks].sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            });

            sortedTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <div class="task-checkbox-container">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <i class="ph-bold ph-check check-icon"></i>
                    </div>
                    <div class="task-content">
                        <input type="text" class="task-text" value="${task.text}" ${task.completed ? 'readonly' : ''}>
                        <span class="priority-tag priority-${task.priority}">${task.priority}</span>
                    </div>
                    <button class="delete-task-btn" aria-label="Delete Task">
                        <i class="ph ph-trash"></i>
                    </button>
                `;

                // Event Listeners
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => this.toggleTask(task.id));

                const textInput = li.querySelector('.task-text');
                textInput.addEventListener('change', (e) => this.updateTaskText(task.id, e.target.value));

                const deleteBtn = li.querySelector('.delete-task-btn');
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

                this.list.appendChild(li);
            });
        }

        this.updateProgress();
    },

    updateProgress() {
        const tasks = StorageManager.data.tasks;
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        
        document.getElementById('task-progress-text').textContent = `${completed}/${total}`;
        
        const fill = document.getElementById('task-progress-fill');
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        fill.style.width = `${percentage}%`;
    }
};

// --- Toast Manager ---
const ToastManager = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'ph-bold ph-check-circle' : 'ph-bold ph-warning-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        // Force reflow
        void toast.offsetWidth;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for transition
        }, 3000);
    }
};

// --- Settings Manager ---
const SettingsManager = {
    init() {
        this.modal = document.getElementById('settings-modal');
        this.btnOpen = document.getElementById('timer-settings-btn');
        this.btnClose = document.getElementById('close-modal-btn');
        this.btnCancel = document.getElementById('cancel-settings-btn');
        this.btnSave = document.getElementById('save-settings-btn');
        this.btnRestore = document.getElementById('restore-defaults-btn');
        this.presetChips = document.querySelectorAll('.preset-chip');
        
        this.inputs = {
            pomodoro: document.getElementById('setting-focus'),
            shortBreak: document.getElementById('setting-short-break'),
            longBreak: document.getElementById('setting-long-break')
        };

        // Events
        this.btnOpen.addEventListener('click', () => this.open());
        this.btnClose.addEventListener('click', () => this.close());
        this.btnCancel.addEventListener('click', () => this.close());
        this.btnSave.addEventListener('click', () => this.save());
        this.btnRestore.addEventListener('click', () => this.restoreDefaults());
        
        this.presetChips.forEach(chip => {
            chip.addEventListener('click', (e) => this.applyPreset(e.target));
        });

        // Close on outside click or ESC
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });
    },

    open() {
        const d = StorageManager.data.settings.timerDurations;
        this.inputs.pomodoro.value = d.pomodoro;
        this.inputs.shortBreak.value = d.shortBreak;
        this.inputs.longBreak.value = d.longBreak;
        
        this.updateActiveChip();
        this.modal.classList.remove('hidden');
        this.inputs.pomodoro.focus(); // Trap focus
    },

    close() {
        this.modal.classList.add('hidden');
    },

    applyPreset(btn) {
        const [p, s, l] = btn.dataset.preset.split(',');
        this.inputs.pomodoro.value = p;
        this.inputs.shortBreak.value = s;
        this.inputs.longBreak.value = l;
        this.updateActiveChip();
    },

    updateActiveChip() {
        const currentVals = `${this.inputs.pomodoro.value},${this.inputs.shortBreak.value},${this.inputs.longBreak.value}`;
        this.presetChips.forEach(chip => {
            if (chip.dataset.preset === currentVals) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    },

    save() {
        const p = parseInt(this.inputs.pomodoro.value, 10);
        const s = parseInt(this.inputs.shortBreak.value, 10);
        const l = parseInt(this.inputs.longBreak.value, 10);

        if (this.validate(p) && this.validate(s) && this.validate(l)) {
            StorageManager.data.settings.timerDurations = {
                pomodoro: p,
                shortBreak: s,
                longBreak: l
            };
            StorageManager.save();
            TimerModule.syncDurations();
            this.close();
            ToastManager.show('Settings saved');
        } else {
            ToastManager.show('Values must be between 1 and 180', 'error');
        }
    },

    restoreDefaults() {
        this.inputs.pomodoro.value = DEFAULT_DURATIONS.pomodoro;
        this.inputs.shortBreak.value = DEFAULT_DURATIONS.shortBreak;
        this.inputs.longBreak.value = DEFAULT_DURATIONS.longBreak;
        this.updateActiveChip();
        ToastManager.show('Defaults applied. Click Save to persist.');
    },

    validate(val) {
        return !isNaN(val) && val >= 1 && val <= 180;
    }
};

// --- Timer Module ---
const TimerModule = {
    mode: 'pomodoro',
    timeLeft: TIMER_MODES.pomodoro.time,
    timerInterval: null,
    isRunning: false,
    
    circle: document.querySelector('.progress-ring__circle'),
    circumference: 0,

    init() {
        // Setup SVG Circle
        const radius = this.circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = 0;

        // UI Elements
        this.timeDisplay = document.getElementById('time-left');
        this.modeLabel = document.getElementById('mode-label');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');

        // Event Listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.target.dataset.mode);
                this.modeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Initialize with stored durations
        this.syncDurations();
    },

    syncDurations() {
        const d = StorageManager.data.settings.timerDurations;
        
        TIMER_MODES.pomodoro.time = d.pomodoro * 60;
        TIMER_MODES.shortBreak.time = d.shortBreak * 60;
        TIMER_MODES.longBreak.time = d.longBreak * 60;
        
        const newTotal = TIMER_MODES[this.mode].time;
        
        if (!this.isRunning || this.timeLeft > newTotal) {
            this.reset();
        } else {
            this.updateDisplay();
        }
    },

    setMode(newMode) {
        this.pause();
        this.mode = newMode;
        this.timeLeft = TIMER_MODES[newMode].time;
        this.modeLabel.textContent = TIMER_MODES[newMode].label;
        
        // Change color based on mode
        const root = document.documentElement;
        if (newMode === 'pomodoro') {
            root.style.setProperty('--primary-color', '#6366f1');
        } else if (newMode === 'shortBreak') {
            root.style.setProperty('--primary-color', '#10b981');
        } else {
            root.style.setProperty('--primary-color', '#3b82f6');
        }

        this.updateDisplay();
    },

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.classList.add('hidden');
        this.pauseBtn.classList.remove('hidden');

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    },

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timerInterval);
        
        this.startBtn.classList.remove('hidden');
        this.pauseBtn.classList.add('hidden');
    },

    reset() {
        this.pause();
        this.timeLeft = TIMER_MODES[this.mode].time;
        this.updateDisplay();
    },

    completeSession() {
        this.pause();
        
        if (this.mode === 'pomodoro') {
            // Focus session complete
            EffectsManager.playBellSound();
            EffectsManager.fireConfetti();
            
            StorageManager.addSession(Math.round(TIMER_MODES.pomodoro.time / 60));
            StatsManager.render();
            
            // Auto switch to break? (Optional feature)
        } else {
            // Break complete
            EffectsManager.playBellSound();
        }

        this.reset();
    },

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const displayString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeDisplay.textContent = displayString;
        document.title = `${displayString} - FocusFlow`;

        // Update Ring
        const total = TIMER_MODES[this.mode].time;
        const progress = this.timeLeft / total;
        const offset = this.circumference - progress * this.circumference;
        this.circle.style.strokeDashoffset = offset;
    }
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
    ThemeManager.init();
    ToastManager.init();
    SettingsManager.init();
    WidgetManager.init();
    StatsManager.init();
    DropdownManager.init();
    TaskManager.init();
    TimerModule.init();
    EffectsManager.init();
});
