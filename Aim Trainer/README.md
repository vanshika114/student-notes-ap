# Aim Trainer

A tactical aim-training shooting lab built with vanilla HTML5, CSS3, and JavaScript (ES6+). Neon-yellow targets with concentric rings spawn at random positions in a firing-range arena — click them before they fade away. Track your score, accuracy, and personal best across 30-second rounds.

## Features

- **Procedural Target Spawning** — Targets appear at random coordinates within the arena, with radius-aware boundary clamping to prevent clipping.
- **CSS-Animated Lifetime** — Each target scales from 0 → 1 → 0 over 1200ms via a `@keyframes` animation. Miss the window and it's gone.
- **Real-Time Accuracy Tracking** — Every click counts: hits vs misses computed live as `(Hits / Total Clicks) × 100`, updated on the dashboard.
- **30-Second Rounds** — A countdown timer drives each session. When it hits zero, all spawns stop and a detailed results modal appears.
- **Click Trail Feedback** — Yellow burst on hits, red burst on misses — visual feedback at the click position.
- **Persistent High Score** — Best score saved in `localStorage` and displayed on the dashboard and results modal.
- **Dark Tactical Theme** — `#050811` blueprint-grid backdrop, neon yellow `#facc15` targets, glassmorphic panels, crosshair cursor.
- **Mouse & Touch** — Works with mouse clicks and touch taps on mobile.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `@keyframes` target life cycle, `backdrop-filter` glassmorphism, concentric ring pseudo-elements, blueprint grid background, `vmin` responsive scaling
- Vanilla JS (ES6+) — IIFE module, `setInterval` spawn/tick loops, DOM manipulation, `localStorage`, Euclidean distance hit detection

## Rules

1. Click **▶ Start Round** to begin a 30-second session.
2. Yellow targets with concentric rings appear at random positions.
3. Click a target to score +10 points (hit). Click empty space = miss.
4. Targets shrink and disappear after 1.2 seconds — be quick!
5. Your accuracy percentage updates after every click.
6. When the timer hits 0, the results modal shows hits, misses, accuracy, and score.
7. Click **Play Again** to start a new round without refreshing.

## Usage

1. Open `index.html` in any modern browser.
2. Press **▶ Start Round**.
3. Click/tap the neon yellow targets as fast as you can.
4. Track your accuracy and try to beat your personal best.

## Project Structure

```
Aim Trainer/
├── index.html        # Main entry point
├── style.css         # Tactical theme
├── script.js         # Game engine
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
