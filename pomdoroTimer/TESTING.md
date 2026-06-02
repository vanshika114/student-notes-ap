# Testing Guide - Production Pomodoro Timer

This guide walks you through testing all the advanced production features implemented in this Pomodoro timer.

## Quick Start

### Method 1: Direct File Opening
1. Navigate to the pomdoroTimer folder
2. Open `index.html` in your browser
3. Timer should load with 25:00 display

### Method 2: Node.js Server (Recommended for Worker Testing)
```bash
# Make sure you have Node.js installed
node server.js

# Visit http://localhost:8000 in your browser
```

---

## Test Suite

### 🧪 Test 1: Basic Timer Functionality

**Objective**: Verify start/pause/reset works correctly

**Steps**:
1. ✅ Click "Start" button
   - Button should disable, "Pause" enables
   - Timer should count down
   - Progress bar should fill

2. ✅ Click "Pause" button
   - Timer should stop
   - "Resume" button should enable
   - Progress stays in place

3. ✅ Click "Resume"
   - Timer continues from where it paused

4. ✅ Click "Reset"
   - Timer jumps back to 25:00
   - Button states reset

**Expected**: ✅ All state transitions smooth, no jumps

---

### 🧪 Test 2: Delta-Time Accuracy (Critical Test)

**Objective**: Verify timer doesn't drift even under system load

**Setup**:
- Set Work Duration to 1 minute in settings (for faster testing)

**Steps**:
1. Start timer at 1:00
2. Open DevTools Console (F12)
3. Run heavy computation in console:
   ```javascript
   // Heavy computation to block main thread for 5 seconds
   let x = 0;
   for (let i = 0; i < 1000000000; i++) {
     x += Math.sin(i);
   }
   ```
4. Observe timer in background while main thread is busy

**Expected**: 
- ✅ Timer display doesn't jump when computation finishes
- ✅ Seconds count accurately even during freeze
- ✅ No drift observed (console should show TICK events)

---

### 🧪 Test 3: Web Worker - Tab Switching (Most Critical)

**Objective**: Verify Web Worker keeps ticking when tab is hidden

**Setup**:
- Open DevTools (F12)
- Go to "Sources" tab
- Find and select "timer.worker.js" to see worker code

**Steps**:
1. Start timer at 25:00
2. Note the current remaining time
3. Switch to another tab (open another website)
4. Wait 10 seconds
5. Switch back to timer tab
6. Check remaining time

**Expected**:
- ✅ Timer counted down ~10 seconds while tab was hidden
- ✅ No error in console about worker
- ✅ Console shows: "✅ Web Worker is ready"
- ✅ On return, console shows: "✅ Tab visible - syncing display"

**Proof in Console**:
```javascript
// You should see these messages
✅ Web Worker is ready
[Worker] Starting tick loop
TICK event: {remaining: 1489, formatted: "24:49"}
...
⚠️ Tab hidden - timer continues via Web Worker
✅ Tab visible - syncing display
```

---

### 🧪 Test 4: localStorage Persistence (Page Refresh)

**Objective**: Session survives accidental refresh

**Setup**:
- Start timer at 25:00
- Let it run for 5 seconds
- Note: Timer at 24:55

**Steps**:
1. Start timer (shows 24:55)
2. Press F5 to refresh page
3. Observe page reload

**Expected**:
- ✅ Timer resumes immediately at ~24:54
- ✅ Console shows: "✅ Session restored from localStorage"
- ✅ "Resume" button is enabled (timer was running)
- ✅ No data loss

**Inspect Storage**:
1. Open DevTools
2. Go to "Application" tab
3. Click "Local Storage"
4. See `pomodoroState` with full state saved

---

### 🧪 Test 5: Circular Progress Animation

**Objective**: Visual progress indicator matches timer accurately

**Steps**:
1. Start timer
2. Watch circular progress bar fill as countdown decreases
3. After 5 seconds, pause
4. Observe progress bar stops

**Expected**:
- ✅ Progress smoothly animates
- ✅ 50% of time elapsed = ~50% progress filled
- ✅ Color changes with phase:
  - Blue: Work phase
  - Green: Short break
  - Orange: Long break

---

### 🧪 Test 6: Phase Transitions

**Objective**: Verify work → break → work cycle

**Setup**:
- Reduce durations to speed up testing:
  - Work: 1 minute
  - Short Break: 10 seconds
  - Long Break: 15 seconds

**Steps**:
1. Start timer
2. When "WORK" completes (1 min), observe phase change to "SHORT_BREAK"
3. When "SHORT_BREAK" completes (10 sec), observe return to "WORK"
4. Complete 4 work sessions to trigger "LONG_BREAK"
5. After long break, returns to work

**Expected**:
- ✅ Phase display updates: "WORK SESSION" → "SHORT BREAK" → "WORK SESSION"
- ✅ Session count increments
- ✅ Time tracked accumulates (only for WORK, not breaks)
- ✅ After 4th session, long break triggers

**Inspect Console**:
```javascript
🎉 Phase complete! New phase: SHORT_BREAK
📊 Session stats: {completed: 1, nextPhase: SHORT_BREAK}
```

---

### 🧪 Test 7: Audio Notifications

**Objective**: Sound plays when phase completes (not on mobile yet)

**Setup**:
- Browser DevTools open
- "Enable Sound Notifications" checked in settings

**Steps**:
1. Set Work duration to 10 seconds
2. Start timer
3. Wait for completion

**Expected**:
- ✅ 3-beep notification plays
- ✅ Can toggle in Settings
- ✅ Console shows: "🔊 Beep notification played"

**Note on Mobile**:
- First click plays silent unlock tone
- Then notifications work even in background tabs

---

### 🧪 Test 8: Mobile Audio Unlock (iOS/Android)

**Objective**: Audio initializes on first user interaction

**Steps**:
1. Open timer on iOS Safari or Android Chrome
2. First click anywhere in the app

**Expected**:
- ✅ Console shows: "🔓 Audio unlock tone played"
- ✅ Subsequent phase completions play audio
- ✅ Works even when app in background

---

### 🧪 Test 9: System Clock Tampering Detection

**Objective**: Verify clock drift detection

**Steps**:
1. Start timer
2. Open DevTools Console
3. Simulate system clock change:
   ```javascript
   // Temporarily set browser time ahead
   // (This test is hard to simulate without changing OS time)
   // Instead, verify drift detection is working:
   pomodoroEngine.clockDriftThreshold = 1; // Set low threshold
   console.log(pomodoroEngine.state);
   ```

**Expected**:
- ✅ If detected: "⚠️ Clock drift detected: Expected 1s, got Xs"
- ✅ Timer continues to work correctly
- ✅ No time skip

---

### 🧪 Test 10: Page Title Updates

**Objective**: Timer visible in browser tab title

**Steps**:
1. Start timer
2. Look at browser tab title (not just window title)

**Expected**:
- ✅ Tab title shows: "▶️ 24:59 | Work - Pomodoro"
- ✅ Updates every second
- ✅ Shows pause icon (⏸️) when paused
- ✅ Allows monitoring progress while working in other tabs

---

### 🧪 Test 11: Settings Persistence

**Objective**: Custom durations saved to localStorage

**Steps**:
1. Click "Settings"
2. Change values:
   - Work: 30 minutes
   - Short Break: 7 minutes
   - Long Break: 20 minutes
3. Click "Apply Settings"
4. Refresh page (F5)
5. Check settings again

**Expected**:
- ✅ Settings persist after refresh
- ✅ New timer uses custom durations
- ✅ "Apply Settings" shows confirmation

---

### 🧪 Test 12: Multiple Tab Synchronization

**Objective**: Multiple timer tabs stay in sync

**Steps** (Advanced):
1. Open `http://localhost:8000` in Tab A
2. Open same URL in Tab B
3. Start timer in Tab A
4. Switch to Tab B

**Expected**:
- ✅ Tab B automatically syncs (both read same localStorage)
- ✅ If you start in Tab B, Tab A stops (last state wins)
- ✅ Both show same remaining time

---

## Console Debugging

### Expected Console Output During Normal Operation

```javascript
🚀 Pomodoro Engine initialized
✅ Web Worker is ready
🎨 UI Controller initialized
🔊 Audio Controller initialized

// When user clicks Start:
✅ Timer started: {phase: "WORK", targetTime: 1234567.89}

// Every second:
TICK event: {remaining: 1499, formatted: "24:59", phase: "WORK"}
TICK event: {remaining: 1498, formatted: "24:58", phase: "WORK"}

// When phase complete:
🎉 Phase complete! New phase: SHORT_BREAK
```

### Enable Detailed Logging

Add to `engine.js` for extra debugging:
```javascript
pomodoroEngine.on('TICK', (data) => {
  console.log('Detailed TICK:', {
    remaining: data.remaining,
    targetTime: pomodoroEngine.state.targetTime,
    now: performance.now() / 1000
  });
});
```

---

## Performance Benchmarks

Test that the app runs efficiently:

### CPU Usage
- Open DevTools → Performance tab
- Start timer
- Record for 5 seconds
- Check CPU graph: should be nearly flat (<1%)

### Memory Usage
- DevTools → Memory tab
- Take heap snapshot
- App should use <5MB
- No memory leaks after 1 hour run

### Network
- No network requests once loaded
- All localStorage only
- Completely offline capable

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Web Worker not starting | Check browser console for errors, ensure worker file in same directory |
| Audio not playing | Click once to initialize, check "Enable Sound" in settings |
| Timer not persisting | Check localStorage enabled, inspect "pomodoroState" in DevTools |
| Drift detected warning | Normal if system time is tampered with; timer corrects itself |
| Progress bar not animating | Check CSS in styles.css, try different browser |

---

## Test Coverage Checklist

- [ ] Basic start/pause/reset
- [ ] Delta-time accuracy (no drift)
- [ ] Web Worker (tab switching)
- [ ] localStorage persistence (refresh)
- [ ] Circular progress animation
- [ ] Phase transitions
- [ ] Audio notifications
- [ ] Mobile audio unlock
- [ ] Clock drift detection
- [ ] Page title updates
- [ ] Settings persistence
- [ ] Performance metrics

**Total Score**: ___ / 12 tests passed

---

## Production Deployment

Once all tests pass, this app is ready for production:

✅ Zero dependencies
✅ Works offline
✅ Mobile compatible
✅ Accessible
✅ Fast load
✅ Reliable persistence
✅ Battery efficient (Web Worker offloading)

Deploy by hosting `index.html`, `*.css`, `*.js` on any static server.
