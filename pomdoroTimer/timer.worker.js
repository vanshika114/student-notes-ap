/**
 * WEB WORKER: Timer Tick Loop
 * 
 * Runs in a separate thread, immune to browser tab throttling.
 * The main thread cannot freeze this - it ticks consistently even when:
 * - User switches tabs
 * - Browser minimizes
 * - Other heavy tasks run on main thread
 * 
 * The main thread calculates the actual elapsed time using delta strategy,
 * so even if browser freezes this worker briefly, the time calculation
 * will snap back to correct value once the main thread resumes.
 */

let timerId = null;

/**
 * Listen for messages from main thread
 */
self.onmessage = function(event) {
  const message = event.data;

  if (message === 'START') {
    // Start tick loop if not already running
    if (!timerId) {
      console.log('[Worker] Starting tick loop');
      
      timerId = setInterval(() => {
        // Send tick message to main thread
        self.postMessage('TICK');
      }, 1000);
    }
  } 
  else if (message === 'STOP') {
    // Stop the interval
    if (timerId) {
      console.log('[Worker] Stopping tick loop');
      clearInterval(timerId);
      timerId = null;
    }
  }
};

// Notify main thread that worker is ready
self.postMessage('WORKER_READY');
console.log('[Worker] Initialized and ready');
