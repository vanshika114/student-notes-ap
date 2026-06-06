# Step-Sequence Audio Matrix

A 4×16 audio step sequencer built with vanilla HTML5, CSS3, and JavaScript (ES6+) powered by the **Web Audio API**. Program drum patterns using native oscillator synthesizers — no external samples or libraries required.

## Features

- **Look-Ahead Scheduler** — Chris Wilson-style 25ms interval checking loop that queries upcoming steps and schedules them against `AudioContext.currentTime` for sample-accurate playback, avoiding `setInterval` timing drift.
- **4×16 Grid Matrix** — Four percussion rows (Kick, Snare, Hi-Hat, Synth Blip) across 16 steps. Click cells to toggle them on/off. Active cells glow with neon violet backlighting.
- **Native Synthesizers** — Four procedural sound generators built entirely with `OscillatorNode`, `GainNode`, `BiquadFilterNode`, and `AudioBuffer` noise:
  - **Kick** — Sine wave with 150→40 Hz pitch sweep + gain decay
  - **Snare** — White noise + triangle oscillator at 180 Hz with fast envelopes
  - **Hi-Hat** — Highpass-filtered (7 kHz) noise burst, 30ms decay
  - **Synth Blip** — Square wave C5→G5 slide, 120ms envelope
- **Visual Playhead** — A glowing cyan vertical line sweeps left-to-right across the grid, driven by `requestAnimationFrame` and synced to the audio clock. Active cells flash on trigger.
- **Real-Time BPM Control** — Slider from 60–180 BPM with instant recalculation of step timing.
- **Clear Matrix** — Resets all toggled cells, stops playback, and silences all oscillators without artifacts.
- **Dark Studio Aesthetic** — `#0b0d13` charcoal canvas, frosted steel cell borders, neon violet `#8b5cf6` active cells, cyan `#06b6d4` playhead, glassmorphic toolbar.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `backdrop-filter` glassmorphism, CSS grid layout, `@keyframes` cell flash, `vmin` responsive scaling, custom properties
- Web Audio API — `AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `AudioBuffer`, `AudioBufferSourceNode`
- Vanilla JS (ES6+) — Look-ahead scheduler, `requestAnimationFrame` playhead sync, `setTimeout` scheduling loop, state matrix management

## Controls

| Control | Action |
|---------|--------|
| **▶ Play / ■ Stop** | Toggle sequence playback |
| **BPM slider** | Adjust tempo (60–180 BPM) |
| **✕ Clear** | Reset all cells and stop |
| **Grid cells** | Toggle individual steps on/off |

## Usage

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. Click cells on the grid to build a pattern (Kick, Snare, Hi-Hat, Synth).
3. Press **▶ Play** to hear your sequence.
4. Adjust BPM to change the tempo.
5. Click **✕ Clear** to reset.
6. No page refresh needed — everything runs in-memory.

## How the Scheduler Works

A `setTimeout` fires every 25ms and checks which steps fall within a 100ms look-ahead window. For each qualifying step, the four voice functions schedule their oscillators at the exact `AudioContext.currentTime` offset, ensuring sub-millisecond accuracy even under heavy load.

## Project Structure

```
Step-Sequence Audio Matrix/
├── index.html        # Main entry point
├── style.css         # Studio dark theme
├── script.js         # Audio engine & sequencer
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
