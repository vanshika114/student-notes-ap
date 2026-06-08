# Reflex-Brake Precision Clicker

A tactical cognitive training game built with vanilla HTML5, CSS3, and JavaScript (ES6+). Test your reflexes on a 3×3 grid — click GO nodes to score, avoid STOP nodes, and watch the spawn rate accelerate as your score climbs.

## Features

- **Procedural Spawning Engine** — Random cell selected every 800–1200ms (interval decreases with score). 80% chance GO (emerald), 20% chance STOP (crimson).
- **Combo Multiplier** — Each successful GO click increases the multiplier (×1 → ×10 max). Missing a GO or clicking STOP resets it to ×1.
- **Score Calibration** — GO click = 10 × multiplier points. STOP click = 5 × multiplier penalty. Missed GO = multiplier reset + red-screen flash.
- **Timer Ring** — Active nodes display a spinning radial border indicating their remaining lifetime (~900ms).
- **Clean Async Architecture** — All timers are properly cleared before spawning new nodes. No stacked event loops.
- **High Score Caching** — Best score persisted in `localStorage` and displayed on boot.
- **Tactical Cyberpunk Theme** — `#060810` deep canvas, emerald GO nodes with glow, crimson STOP nodes, glassmorphic dashboard.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — CSS Grid, `backdrop-filter`, `@keyframes` spin/pop-in, `vmin` scaling
- Vanilla JS (ES6+) — `setTimeout` scheduling, `clearTimeout` cleanup, weighted random selection, `localStorage`

## Rules

1. Press **▶ Start Test** to begin.
2. Green "GO" nodes appear randomly — **click them** to earn points.
3. Red "✕" STOP nodes appear — **do NOT click them**.
4. Each GO click increases your combo multiplier (×1 → ×10).
5. Missing a GO or clicking a STOP resets the multiplier and flashes a penalty.
6. The spawn rate increases as your score grows.
7. Press **⟳ Reset Board** to restart.

## Usage

1. Open `index.html` in any modern browser.
2. Click **▶ Start Test** — nodes will begin spawning on the 3×3 grid.
3. Click GO nodes (emerald) to score. Avoid STOP nodes (crimson).
4. Watch the multiplier climb with consecutive hits.
5. Your high score is automatically saved.

## Project Structure

```
Reflex-Brake Precision Clicker/
├── index.html        # Main entry point
├── style.css         # Tactical cyberpunk theme
├── script.js         # Game engine & spawning logic
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
