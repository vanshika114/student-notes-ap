/**
 * AUDIO LAYER: Notifications & Alarms
 * 
 * Handles:
 * - Web Audio API synthesis for alarm notification
 * - Mobile OS autoplay policy bypass
 * - Silent initialization on first user interaction
 * - Sound toggle support
 */

class AudioController {
  constructor() {
    // Audio context (lazy-initialized due to iOS restrictions)
    this.audioContext = null;
    this.isInitialized = false;
    
    // Oscillator parameters
    this.frequency = 800; // Hz
    this.duration = 0.5; // seconds
    this.volume = 0.3; // 0-1

    // Initialize audio on first user interaction
    this.setupFirstInteractionListener();
  }

  /**
   * Setup first interaction listener
   * Mobile browsers require user interaction before playing audio
   */
  setupFirstInteractionListener() {
    const initOnInteraction = () => {
      if (!this.isInitialized) {
        this.initialize();
        console.log('🔊 Audio context initialized on first interaction');
      }
      // Remove listener after first interaction
      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('touchstart', initOnInteraction);
      document.removeEventListener('keydown', initOnInteraction);
    };

    document.addEventListener('click', initOnInteraction, { once: true });
    document.addEventListener('touchstart', initOnInteraction, { once: true });
    document.addEventListener('keydown', initOnInteraction, { once: true });
  }

  /**
   * Initialize Web Audio API context
   * Called on first user interaction
   */
  initialize() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.isInitialized = true;

      // Play a silent 0.1s sound to "unlock" audio on mobile
      this.playSilentUnlockSound();
    } catch (e) {
      console.error('Web Audio API not supported:', e);
    }
  }

  /**
   * Play a silent sound to unlock audio on iOS/Android
   * This prevents the browser from blocking future audio playback
   */
  playSilentUnlockSound() {
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Create oscillator
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1; // Very low frequency (silent)

      // Create gain node for volume control
      const gain = this.audioContext.createGain();
      gain.gain.value = 0; // Completely silent

      // Connect and play for 0.1 seconds
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      console.log('🔓 Audio unlock tone played');
    } catch (e) {
      console.error('Failed to play unlock tone:', e);
    }
  }

  /**
   * Play notification sound when phase completes
   * Generates a pleasant beep sequence using Web Audio API
   */
  playNotification() {
    // Respect user's sound toggle preference
    if (!window.pomodoroEngine || !window.pomodoroEngine.soundEnabled) {
      console.log('🔇 Sound disabled');
      return;
    }

    // Initialize audio if not done yet
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    try {
      this.playAlarmSequence();
    } catch (e) {
      console.error('Failed to play notification:', e);
    }
  }

  /**
   * Play a pleasant alarm sequence (3 beeps)
   * Uses Web Audio API to synthesize sound
   */
  playAlarmSequence() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Beep parameters
    const beepDuration = 0.3; // seconds
    const beepInterval = 0.4; // time between beeps
    const frequency = 800; // Hz
    
    // Play 3 beeps
    for (let i = 0; i < 3; i++) {
      const startTime = now + (i * beepInterval);
      this.playBeep(frequency, beepDuration, startTime, this.volume);
    }
  }

  /**
   * Play a single beep
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {number} startTime - Start time in audio context time
   * @param {number} volume - Volume 0-1
   */
  playBeep(frequency, duration, startTime, volume) {
    const ctx = this.audioContext;

    // Create oscillator for the tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    // Create gain for volume control
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    // Connect and play
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Play alarm sound at higher volume for phase completion
   * More attention-getting than notification beeps
   */
  playAlarmBell() {
    if (!window.pomodoroEngine || !window.pomodoroEngine.soundEnabled) {
      return;
    }

    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Create a richer alarm sound using multiple frequencies
      const frequencies = [800, 1200, 600];
      
      frequencies.forEach((freq, index) => {
        const startTime = now + (index * 0.15);
        this.playBeep(freq, 0.4, startTime, 0.4);
      });
    } catch (e) {
      console.error('Failed to play alarm:', e);
    }
  }

  /**
   * Text-to-speech notification (if browser supports)
   * Announces the phase change
   */
  speakPhaseChange(phaseName) {
    if (!window.pomodoroEngine || !window.pomodoroEngine.soundEnabled) {
      return;
    }

    // Check if Speech Synthesis API is available
    if (!('speechSynthesis' in window)) {
      console.log('Speech Synthesis not supported');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(`${phaseName} phase started`);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
      
      console.log('🗣️ Announced:', phaseName);
    } catch (e) {
      console.error('Speech synthesis failed:', e);
    }
  }
}

/**
 * Initialize global audio controller
 */
window.pomodoroAudio = new AudioController();

console.log('🔊 Audio Controller initialized');
