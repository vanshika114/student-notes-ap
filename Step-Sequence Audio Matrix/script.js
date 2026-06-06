/* ═══════════════════════════════════════════════════════
   Step-Sequence Audio Matrix — Audio Engine
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM ─── */
  const playBtn = document.getElementById('play-btn');
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmDisplay = document.getElementById('bpm-display');
  const clearBtn = document.getElementById('clear-btn');
  const gridEl = document.getElementById('grid');
  const playheadEl = document.getElementById('playhead');

  /* ─── Audio Context ─── */
  let ac = null;

  function getCtx () {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    return ac;
  }

  /* ─── State ─── */
  const ROWS = 4;
  const STEPS = 16;
  let grid = Array.from({ length: ROWS }, () => Array(STEPS).fill(false));
  let bpm = 120;
  let isPlaying = false;
  let currentStep = 0;
  let nextStepTime = 0;
  let schedulerId = null;
  let rafId = null;

  /* ─── Synth definitions ─── */

  function playKick (time) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  function playSnare (time) {
    const ctx = getCtx();
    // Noise layer
    const bufSize = ctx.sampleRate * 0.08;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.08);
    // Tonal layer
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.06);
    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  function playHihat (time) {
    const ctx = getCtx();
    const bufSize = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 7000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    noise.connect(hpFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.04);
  }

  function playSynth (time) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, time); // C5
    osc.frequency.linearRampToValueAtTime(783.99, time + 0.08); // G5
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  const PLAY_FN = [playKick, playSnare, playHihat, playSynth];
  const ROW_NAMES = ['Kick', 'Snare', 'Hi-Hat', 'Synth'];

  /* ─── Scheduling ─── */

  function stepDur () {
    return 60 / bpm / 4;
  }

  function scheduleStep (step, time) {
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][step]) {
        PLAY_FN[r](time);
      }
    }
  }

  function scheduler () {
    if (!isPlaying) return;

    const ctx = getCtx();
    const now = ctx.currentTime;
    const lookAhead = 0.1;

    while (nextStepTime < now + lookAhead) {
      scheduleStep(currentStep, nextStepTime);
      currentStep = (currentStep + 1) % STEPS;
      nextStepTime += stepDur();
    }

    schedulerId = setTimeout(scheduler, 25);
  }

  /* ─── Visual playhead ─── */

  function visualLoop () {
    if (!isPlaying) {
      playheadEl.classList.add('idle');
      return;
    }

    const ctx = getCtx();
    const now = ctx.currentTime;
    const dur = stepDur();
    // Bar start = when step 0 of the current cycle began
    const barStart = nextStepTime - dur * currentStep;
    if (currentStep === 0) {
      // nextStepTime IS the bar start if we're about to play step 0
    }
    const elapsed = now - barStart;
    if (elapsed >= 0) {
      const total = elapsed / dur;
      const fractionalStep = total % STEPS;
      const pct = fractionalStep / STEPS;
      const gridWidth = gridEl.getBoundingClientRect().width;
      const wrapWidth = document.querySelector('.grid-wrap').getBoundingClientRect().width;
      const padLeft = 10; // grid-wrap padding

      // Calculate cell area width (total minus label column)
      const labelWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 40;
      const cellAreaWidth = wrapWidth - padLeft * 2 - 5; // approximate
      const headX = padLeft + 5 + pct * cellAreaWidth;

      playheadEl.classList.remove('idle');
      playheadEl.style.transform = 'translateX(' + headX + 'px)';
    }

    rafId = requestAnimationFrame(visualLoop);
  }

  /* ─── Grid rendering ─── */

  function buildGrid () {
    // Remove old cells
    document.querySelectorAll('.cell').forEach(el => el.remove());

    for (let r = 0; r < ROWS; r++) {
      const cellsContainer = gridEl.querySelector(`.cells[data-row="${r}"]`);
      if (!cellsContainer) continue;
      cellsContainer.innerHTML = '';
      for (let s = 0; s < STEPS; s++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (grid[r][s] ? ' active' : '');
        cell.dataset.row = r;
        cell.dataset.step = s;
        cell.addEventListener('click', () => toggleCell(r, s));
        cellsContainer.appendChild(cell);
      }
    }
  }

  function toggleCell (r, s) {
    grid[r][s] = !grid[r][s];
    const cells = document.querySelectorAll(`.cell[data-row="${r}"][data-step="${s}"]`);
    cells.forEach(c => {
      c.classList.toggle('active', grid[r][s]);
    });
  }

  /* ─── Play / Pause ─── */

  function togglePlay () {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    if (!isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function startPlayback () {
    isPlaying = true;
    const ctx = getCtx();
    currentStep = 0;
    nextStepTime = ctx.currentTime + 0.05;
    playBtn.textContent = '■ Stop';
    playBtn.classList.add('playing');
    playheadEl.classList.remove('idle');
    scheduler();
    rafId = requestAnimationFrame(visualLoop);
  }

  function stopPlayback () {
    isPlaying = false;
    if (schedulerId) { clearTimeout(schedulerId); schedulerId = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    playBtn.textContent = '▶ Play';
    playBtn.classList.remove('playing');
    playheadEl.classList.add('idle');
  }

  /* ─── Clear ─── */

  function clearMatrix () {
    const wasPlaying = isPlaying;
    if (wasPlaying) stopPlayback();

    for (let r = 0; r < ROWS; r++) {
      for (let s = 0; s < STEPS; s++) {
        grid[r][s] = false;
      }
    }
    // Rebuild cell visuals
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
  }

  /* ─── BPM ─── */

  function updateBpm () {
    bpm = parseInt(bpmSlider.value, 10);
    bpmDisplay.textContent = bpm;
  }

  /* ─── Flash active cell on playhead ─── */

  // Called from scheduler: we add a flash class to cells at the current step
  // and remove it after a short delay
  let flashTimeoutId = null;

  // Override scheduleStep to also trigger visuals
  const origSchedule = scheduleStep;
  scheduleStep = function (step, time) {
    origSchedule(step, time);
    // Visual flash
    const activeCells = document.querySelectorAll(`.cell[data-step="${step}"]`);
    activeCells.forEach(c => {
      if (c.classList.contains('active')) {
        c.classList.add('flash');
        setTimeout(() => c.classList.remove('flash'), stepDur() * 800);
      }
    });
  };

  /* ─── Events ─── */
  playBtn.addEventListener('click', togglePlay);
  clearBtn.addEventListener('click', clearMatrix);
  bpmSlider.addEventListener('input', updateBpm);

  /* ─── Boot ─── */
  buildGrid();

})();
