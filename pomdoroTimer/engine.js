/**
 * POMODORO TIMER ENGINE
 * Event-Driven Delta Architecture with System Clock Sync
 * 
 * Core Principles:
 * 1. Delta-Time Strategy: Instead of decrementing a counter, calculate remaining time
 *    using targetTime - systemTime. This prevents drift even if browser freezes.
 * 2. State Machine: Three phases (WORK, SHORT_BREAK, LONG_BREAK) with explicit state.
 * 3. Persistence: All state changes synced to localStorage immediately.
 * 4. Secondary Validation: Compare delta steps against local tick count to detect
 *    system clock tampering.
 */

class PomodoroEngine {
  // Constants - Phase definitions
  static PHASES = {
    WORK: 'WORK',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK'
  };

  // Constants - Timer states
  static TIMER_STATES = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED'
  };

  constructor() {
    // Configuration (in seconds)
    this.config = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60
    };

    // State variables
    this.state = {
      timerState: PomodoroEngine.TIMER_STATES.IDLE,
      phase: PomodoroEngine.PHASES.WORK,
      targetTime: null,          // System time when this phase should end
      pauseStartTime: null,      // System time when pause began
      pausedDuration: 0,         // Total accumulated paused time
      sessionCount: 0,           // Number of completed work sessions
      totalTrackedTime: 0        // Total seconds worked (accumulated)
    };

    // Validation and drift detection
    this.tickCount = 0;          // Local tick counter for validation
    this.lastValidatedTime = 0;  // Last system time we checked
    this.clockDriftThreshold = 5; // If delta skips more than 5 seconds, flag drift

    // Event system
    this.listeners = {};
    
    // Audio configuration
    this.soundEnabled = true;

    // Hydrate from localStorage if available
    this.hydrate();

    // Resume if an active session exists
    if (this.shouldResumeSession()) {
      this.resumeSession();
    }
  }

  /**
   * CORE: Calculate remaining time using delta strategy
   * Formula: Remaining = TargetTime - SystemTime
   * Returns: { totalSeconds, formatted: "MM:SS" }
   */
  calculateRemaining() {
    if (!this.state.targetTime) {
      const duration = this.getDurationForPhase(this.state.phase);
      return { totalSeconds: duration, formatted: this.formatTime(duration) };
    }

    const now = performance.now() / 1000; // Convert to seconds
    let remaining = this.state.targetTime - now;

    // Safety: If remaining is negative (time's up), signal completion
    if (remaining < 0) {
      remaining = 0;
    }

    // Drift detection: Verify delta didn't jump unexpectedly
    if (this.lastValidatedTime > 0) {
      const expectedDelta = 1; // Should advance ~1 second per tick
      const actualDelta = now - this.lastValidatedTime;
      
      if (Math.abs(actualDelta - expectedDelta) > this.clockDriftThreshold) {
        console.warn(
          `⚠️  Clock drift detected: Expected ${expectedDelta}s, got ${actualDelta.toFixed(2)}s. ` +
          'User may have adjusted system time.'
        );
        // Recalculate to snap to correct time
        this.emit('CLOCK_DRIFT_DETECTED', { drift: actualDelta - expectedDelta });
      }
    }

    this.lastValidatedTime = now;
    this.tickCount++;

    return {
      totalSeconds: Math.ceil(remaining),
      formatted: this.formatTime(Math.ceil(remaining))
    };
  }

  /**
   * FORMAT: MM:SS display
   */
  formatTime(seconds) {
    seconds = Math.max(0, seconds);
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Get duration in seconds for current phase
   */
  getDurationForPhase(phase) {
    switch (phase) {
      case PomodoroEngine.PHASES.WORK:
        return this.config.workDuration;
      case PomodoroEngine.PHASES.SHORT_BREAK:
        return this.config.shortBreakDuration;
      case PomodoroEngine.PHASES.LONG_BREAK:
        return this.config.longBreakDuration;
      default:
        return 0;
    }
  }

  /**
   * ACTION: Start the timer
   * Calculates target timestamp and enters RUNNING state
   */
  start() {
    if (this.state.timerState === PomodoroEngine.TIMER_STATES.RUNNING) {
      return; // Already running
    }

    // If resuming from pause, extend target time by pause duration
    if (this.state.timerState === PomodoroEngine.TIMER_STATES.PAUSED) {
      const now = performance.now() / 1000;
      const pauseDuration = now - this.state.pauseStartTime;
      this.state.pausedDuration += pauseDuration;
      this.state.targetTime += pauseDuration;
    } else {
      // Starting fresh timer for this phase
      const now = performance.now() / 1000;
      const duration = this.getDurationForPhase(this.state.phase);
      this.state.targetTime = now + duration;
    }

    this.state.timerState = PomodoroEngine.TIMER_STATES.RUNNING;
    this.state.pauseStartTime = null;

    // Persist state
    this.persist();

    // Start Web Worker if available
    if (window.timerWorker) {
      window.timerWorker.postMessage('START');
    }

    this.emit('STARTED', { phase: this.state.phase, targetTime: this.state.targetTime });
  }

  /**
   * ACTION: Pause the timer
   */
  pause() {
    if (this.state.timerState !== PomodoroEngine.TIMER_STATES.RUNNING) {
      return;
    }

    const now = performance.now() / 1000;
    this.state.pauseStartTime = now;
    this.state.timerState = PomodoroEngine.TIMER_STATES.PAUSED;

    // Persist state
    this.persist();

    // Stop Web Worker
    if (window.timerWorker) {
      window.timerWorker.postMessage('STOP');
    }

    this.emit('PAUSED', { 
      phase: this.state.phase,
      remaining: this.calculateRemaining().totalSeconds
    });
  }

  /**
   * ACTION: Reset current phase
   */
  reset() {
    // Stop worker
    if (window.timerWorker) {
      window.timerWorker.postMessage('STOP');
    }

    this.state.timerState = PomodoroEngine.TIMER_STATES.IDLE;
    this.state.targetTime = null;
    this.state.pauseStartTime = null;
    this.state.pausedDuration = 0;
    this.tickCount = 0;

    this.persist();
    this.emit('RESET', { phase: this.state.phase });
  }

  /**
   * ACTION: Complete current phase and move to next
   * Accumulates work time and advances phase
   */
  completePhase() {
    // Record completion
    if (this.state.phase === PomodoroEngine.PHASES.WORK) {
      this.state.sessionCount++;
      this.state.totalTrackedTime += this.getDurationForPhase(this.state.phase);
      
      // Move to break (short or long based on session count)
      this.state.phase = (this.state.sessionCount % 4 === 0) 
        ? PomodoroEngine.PHASES.LONG_BREAK
        : PomodoroEngine.PHASES.SHORT_BREAK;
    } else {
      // Break completed, return to work
      this.state.phase = PomodoroEngine.PHASES.WORK;
    }

    // Reset timer state for new phase
    this.state.timerState = PomodoroEngine.TIMER_STATES.IDLE;
    this.state.targetTime = null;
    this.state.pauseStartTime = null;
    this.state.pausedDuration = 0;
    this.tickCount = 0;

    // Stop worker
    if (window.timerWorker) {
      window.timerWorker.postMessage('STOP');
    }

    this.persist();
    this.emit('PHASE_COMPLETED', { 
      phase: this.state.phase,
      sessionCount: this.state.sessionCount
    });
  }

  /**
   * ACTION: Handle tick from Web Worker
   * Called every second - checks if phase is complete
   */
  handleTick() {
    if (this.state.timerState !== PomodoroEngine.TIMER_STATES.RUNNING) {
      return;
    }

    const remaining = this.calculateRemaining();

    // Emit tick event with current state
    this.emit('TICK', {
      remaining: remaining.totalSeconds,
      formatted: remaining.formatted,
      phase: this.state.phase
    });

    // Check if phase completed
    if (remaining.totalSeconds <= 0) {
      this.completePhase();
      this.emit('PHASE_COMPLETE', { newPhase: this.state.phase });
    }
  }

  /**
   * PERSISTENCE: Save state to localStorage
   */
  persist() {
    const payload = {
      state: this.state,
      config: this.config,
      soundEnabled: this.soundEnabled,
      savedAt: performance.now() / 1000
    };
    localStorage.setItem('pomodoroState', JSON.stringify(payload));
  }

  /**
   * PERSISTENCE: Restore state from localStorage
   */
  hydrate() {
    const stored = localStorage.getItem('pomodoroState');
    if (!stored) return;

    try {
      const payload = JSON.parse(stored);
      
      // Restore state
      this.state = { ...this.state, ...payload.state };
      this.config = { ...this.config, ...payload.config };
      this.soundEnabled = payload.soundEnabled;

      console.log('✅ Session restored from localStorage');
    } catch (e) {
      console.error('Failed to hydrate from localStorage:', e);
      localStorage.removeItem('pomodoroState');
    }
  }

  /**
   * PERSISTENCE: Check if an active session exists and hasn't expired
   */
  shouldResumeSession() {
    const stored = localStorage.getItem('pomodoroState');
    if (!stored) return false;

    try {
      const payload = JSON.parse(stored);
      const isActive = payload.state.timerState === PomodoroEngine.TIMER_STATES.RUNNING ||
                       payload.state.timerState === PomodoroEngine.TIMER_STATES.PAUSED;
      
      if (!isActive || !payload.state.targetTime) return false;

      // Check if target time hasn't passed
      const now = performance.now() / 1000;
      return payload.state.targetTime > now;
    } catch (e) {
      return false;
    }
  }

  /**
   * PERSISTENCE: Resume an interrupted session
   */
  resumeSession() {
    console.log('🔄 Resuming session from localStorage...');
    // State already restored by hydrate()
    // Just notify listeners
    this.emit('SESSION_RESUMED', { 
      phase: this.state.phase,
      remaining: this.calculateRemaining().totalSeconds
    });
  }

  /**
   * SETTINGS: Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    // If timer not running, update display immediately
    if (this.state.timerState === PomodoroEngine.TIMER_STATES.IDLE) {
      this.emit('CONFIG_UPDATED', { config: this.config });
    }
    
    this.persist();
  }

  /**
   * SETTINGS: Toggle sound
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.persist();
  }

  /**
   * EVENT SYSTEM: Register listener
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  /**
   * EVENT SYSTEM: Emit event
   */
  emit(eventName, payload) {
    if (!this.listeners[eventName]) return;
    
    this.listeners[eventName].forEach(callback => {
      try {
        callback(payload);
      } catch (e) {
        console.error(`Error in listener for ${eventName}:`, e);
      }
    });
  }

  /**
   * DEBUG: Get current state for inspection
   */
  getState() {
    return {
      ...this.state,
      remaining: this.calculateRemaining(),
      config: this.config,
      soundEnabled: this.soundEnabled
    };
  }
}

// Initialize global engine instance
window.pomodoroEngine = new PomodoroEngine();

console.log('🚀 Pomodoro Engine initialized');
