# Color Catcher Game

A cyberpunk arcade game built with vanilla HTML5, CSS3, and JavaScript (ES6+). Colored blocks fall from the sky — catch the ones matching the target color to score and build combos, but avoid wrong colors or lose a life!

## Features

- **Procedural Block Generation** — Blocks spawn every 900ms with a 60% chance of being the target color and 40% a distractor.
- **AABB Collision Detection** — Axis-aligned bounding box math detects every catcher–block intersection precisely.
- **Combo Multiplier** — Each correct catch increases the multiplier (×1 → ×10). Wrong catches or life loss reset it.
- **Dynamic Velocity Escalation** — Block fall speed increases by 0.25px per frame every 15 seconds.
- **Particle Explosions** — Correct catches trigger a colorful particle burst; wrong catches trigger crimson particles and a screen shake.
- **Dual Controls** — Arrow keys or WASD for desktop; left/right screen-tap zones for mobile.
- **Game Over Modal** — When lives hit zero, a translucent overlay shows final score and best score with a restart button.
- **High Score Caching** — Best score persisted in `localStorage`.
- **Cyberpunk Arcade Theme** — `#0a0512` canvas, neon cyan/magenta/yellow/emerald blocks, glassmorphic panels.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `backdrop-filter` glassmorphism, `@keyframes` modal animation, `vmin` scaling
- Vanilla JS (ES6+) — `requestAnimationFrame` game loop, Canvas 2D rendering, AABB collision, `localStorage`

## Rules

1. A target color is shown in the header.
2. Colored blocks fall — use **arrow keys** (or **A/D**) to move the catcher left/right.
3. Catch blocks that match the target color → score +10×combo, combo up.
4. Catch a wrong color → lose a life, combo resets to ×1.
5. Speed increases every 15 seconds.
6. Game over when all 3 lives are lost.
7. Click **Play Again** to restart.

## Usage

1. Open `index.html` in any modern browser.
2. Watch the target color in the header.
3. Move the catcher with arrow keys (or A/D). On mobile, tap left/right half of the screen.
4. Catch matching blocks, avoid wrong ones.
5. Your high score is saved automatically.

## Project Structure

```
Color Catcher Game/
├── index.html        # Main entry point
├── style.css         # Cyberpunk arcade theme
├── script.js         # Game engine & render loop
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
