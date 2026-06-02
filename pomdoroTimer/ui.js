/**
 * UI LAYER: DOM Management and Display Updates
 * 
 * Responsible for:
 * - Syncing engine state to UI elements
 * - Handling button clicks and user interactions
 * - Updating circular progress visualization
 * - Page title mutations for browser tab monitoring
 * - Responsive event handling
 */

class UIController {
  constructor(engine) {
    this.engine = engine;
    
    // DOM Elements
    this.timeDisplay = document.getElementById('timeDisplay');
    this.phaseDisplay = document.getElementById('phaseDisplay');
    this.sessionInfo = document.getElementById('sessionInfo');
    this.sessionCount = document.getElementById('sessionsCount');
    this.timeTracked = document.getElementById('timeTracked');
    
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    
    this.circularProgress = document.querySelector('.progress-fill');
    
    // Settings
    this.workDurationInput = document.getElementById('workDuration');
    this.shortBreakInput = document.getElementById('shortBreak');
    this.longBreakInput = document.getElementById('longBreak');
    this.soundToggle = document.getElementById('soundToggle');
    this.applySettingsBtn = document.getElementById('applSettingsBtn');

    // Initialize
    this.setupEventListeners();
    this.subscribeToEngineEvents();
    this.updateDisplay();
  }

  /**
   * Setup UI event listeners
   */
  setupEventListeners() {
    this.startBtn.addEventListener('click', () => {
      if (this.engine.state.timerState === this.engine.constructor.TIMER_STATES.IDLE) {
        this.startBtn.classList.add('active');
        this.engine.start();
      } else if (this.engine.state.timerState === this.engine.constructor.TIMER_STATES.PAUSED) {
        this.engine.start();
      }
    });

    this.pauseBtn.addEventListener('click', () => {
      this.startBtn.classList.remove('active');
      this.engine.pause();
    });

    this.resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the current phase?')) {
        this.startBtn.classList.remove('active');
        this.engine.reset();
        this.updateDisplay();
      }
    });

    // Settings
    this.applySettingsBtn.addEventListener('click', () => {
      const config = {
        workDuration: parseInt(this.workDurationInput.value) * 60,
        shortBreakDuration: parseInt(this.shortBreakInput.value) * 60,
        longBreakDuration: parseInt(this.longBreakInput.value) * 60
      };
      
      this.engine.updateConfig(config);
      this.updateDisplay();
      alert('Settings updated!');
    });

    this.soundToggle.addEventListener('change', (e) => {
      this.engine.setSoundEnabled(e.target.checked);
    });

    // Handle page visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('⚠️  Tab hidden - timer continues via Web Worker');
      } else {
        console.log('✅ Tab visible - syncing display');
        // Force a display update when tab becomes visible
        this.updateDisplay();
      }
    });

    // Pause on blur for better UX (optional)
    window.addEventListener('blur', () => {
      // Don't auto-pause, just log
      console.log('Window blur detected');
    });

    window.addEventListener('focus', () => {
      console.log('Window focus regained - resync display');
      this.updateDisplay();
    });
  }

  /**
   * Subscribe to engine events
   */
  subscribeToEngineEvents() {
    this.engine.on('STARTED', (payload) => {
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
      this.updateDisplay();
      console.log('✅ Timer started:', payload);
    });

    this.engine.on('PAUSED', (payload) => {
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.updateDisplay();
      console.log('⏸️  Timer paused:', payload);
    });

    this.engine.on('RESET', (payload) => {
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.updateDisplay();
      console.log('🔄 Timer reset:', payload);
    });

    this.engine.on('TICK', (payload) => {
      this.updateDisplay();
    });

    this.engine.on('PHASE_COMPLETE', (payload) => {
      this.updateDisplay();
      window.pomodoroAudio.playNotification();
      console.log('🎉 Phase complete! New phase:', payload.newPhase);
    });

    this.engine.on('PHASE_COMPLETED', (payload) => {
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      console.log('📊 Session stats:', {
        completed: payload.sessionCount,
        nextPhase: payload.phase
      });
    });

    this.engine.on('SESSION_RESUMED', (payload) => {
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
      this.updateDisplay();
      console.log('🔄 Session resumed from localStorage');
    });

    this.engine.on('CONFIG_UPDATED', (payload) => {
      this.updateSettingsDisplay(payload.config);
      this.updateDisplay();
    });

    this.engine.on('CLOCK_DRIFT_DETECTED', (payload) => {
      console.warn('⚠️  System clock tampering detected:', payload);
      // Could trigger UI warning here
    });
  }

  /**
   * Main display update function
   */
  updateDisplay() {
    const state = this.engine.getState();
    
    // Update time display
    this.timeDisplay.textContent = state.remaining.formatted;
    
    // Update phase display
    const phaseText = {
      'WORK': 'WORK SESSION',
      'SHORT_BREAK': 'SHORT BREAK',
      'LONG_BREAK': 'LONG BREAK'
    };
    this.phaseDisplay.textContent = phaseText[state.phase];
    
    // Update session info
    const sessionLabel = state.phase === 'WORK' ? 'Work Session' : 'Break Time';
    this.sessionInfo.textContent = sessionLabel;
    
    // Update stats
    this.sessionCount.textContent = state.sessionCount;
    this.timeTracked.textContent = this.formatTrackedTime(state.totalTrackedTime);
    
    // Update button states
    this.updateButtonStates(state);
    
    // Update progress bar
    this.updateProgressBar(state);
    
    // Update page title with timer display
    this.updatePageTitle(state);
    
    // Update phase color class
    this.updatePhaseClass(state.phase);
  }

  /**
   * Update button states based on timer state
   */
  updateButtonStates(state) {
    const isRunning = state.timerState === this.engine.constructor.TIMER_STATES.RUNNING;
    const isPaused = state.timerState === this.engine.constructor.TIMER_STATES.PAUSED;
    
    if (isRunning) {
      this.startBtn.textContent = 'Resume'; // Change to indicate pause is available
      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
    } else if (isPaused) {
      this.startBtn.textContent = 'Resume';
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
    } else {
      this.startBtn.textContent = 'Start';
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
    }
  }

  /**
   * Update circular progress bar
   * Formula: strokeDashoffset = circumference * (1 - progress)
   */
  updateProgressBar(state) {
    const duration = this.engine.getDurationForPhase(state.phase);
    const remaining = state.remaining.totalSeconds;
    const progress = 1 - (remaining / duration);
    
    // Circumference of circle with radius 95: 2πr
    const circumference = 2 * Math.PI * 95;
    const dashOffset = circumference * (1 - progress);
    
    this.circularProgress.style.strokeDashoffset = dashOffset;
  }

  /**
   * Update page title for browser tab monitoring
   */
  updatePageTitle(state) {
    const time = state.remaining.formatted;
    const phase = state.phase === 'WORK' ? 'Work' : 'Break';
    const status = state.timerState === this.engine.constructor.TIMER_STATES.RUNNING 
      ? '▶️' 
      : (state.timerState === this.engine.constructor.TIMER_STATES.PAUSED ? '⏸️' : '');
    
    document.title = `${status} ${time} | ${phase} - Pomodoro`;
  }

  /**
   * Update phase-specific CSS class
   */
  updatePhaseClass(phase) {
    document.body.className = '';
    const classMap = {
      'WORK': 'phase-work',
      'SHORT_BREAK': 'phase-short-break',
      'LONG_BREAK': 'phase-long-break'
    };
    document.body.classList.add(classMap[phase]);
  }

  /**
   * Update settings display fields
   */
  updateSettingsDisplay(config) {
    this.workDurationInput.value = config.workDuration / 60;
    this.shortBreakInput.value = config.shortBreakDuration / 60;
    this.longBreakInput.value = config.longBreakDuration / 60;
  }

  /**
   * Format tracked time in human-readable format
   */
  formatTrackedTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

/**
 * Initialize UI when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  window.uiController = new UIController(window.pomodoroEngine);
  
  // Initialize settings display
  window.uiController.updateSettingsDisplay(window.pomodoroEngine.config);
  window.uiController.soundToggle.checked = window.pomodoroEngine.soundEnabled;
  
  console.log('🎨 UI Controller initialized');
});

/**
 * Setup Web Worker tick handling
 * Listen for TICK messages from worker and notify engine
 */
if (window.timerWorker) {
  window.timerWorker.onmessage = (event) => {
    const message = event.data;
    
    if (message === 'TICK') {
      window.pomodoroEngine.handleTick();
    } else if (message === 'WORKER_READY') {
      console.log('✅ Web Worker is ready');
    }
  };
}
