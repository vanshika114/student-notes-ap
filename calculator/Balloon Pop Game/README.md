# Balloon Pop Game

A neon cyberpunk arcade game built with vanilla HTML5, CSS3, and JavaScript (ES6+). Colorful balloons float up from the bottom of the screen — tap or click them to pop them before they escape! Featuring a combo multiplier, dynamic difficulty scaling, and 45-second rounds.

## Features

- **Procedural Floating Engine** — Balloons spawn at random X positions along the bottom and float upward to the top of the sky container via CSS `@keyframes`. Escaped balloons trigger a screen shake and reset your multiplier.
- **Dynamic Difficulty Scaling** — Spawn interval starts at 1200ms and float duration at 4s. Every 40 points scored, spawn rate tightens by 50ms and float duration shortens by 100ms, creating a genuine arcade difficulty curve.
- **Combo Multiplier** — Each successful pop increases the multiplier (×1 → ×2 …). Let a balloon escape and it resets to ×1.
- **Particle Burst on Pop** — Clicking a balloon freezes its movement, plays a scale-up/fade-out pop animation, and spawns 8 radial particles matching the balloon's colour.
- **State Lock Flag** — Each balloon sets `data-popped="true"` immediately on click to prevent double-click exploit.
- **45-Second Countdown** — A live timer counts down the round. When it hits zero, all spawns stop and a premium results modal appears.
- **Persistent High Score** — Best score saved in `localStorage`.
- **Cyberpunk Festival Theme** — `#060813` obsidian sky, neon pink `#ff2a5f`, electric cyan `#00f0ff`, and radioactive violet `#a855f7` balloons with matching glows, glassmorphic UI, crosshair cursor.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `@keyframes floatUp` with organic sway, `@keyframes particleFly` with CSS custom properties (`--dx`, `--dy`), `backdrop-filter` glassmorphism, `vmin` responsive scaling
- Vanilla JS (ES6+) — `setTimeout`/`setInterval` orchestration, DOM manipulation, `localStorage`, pointer hit-testing

## Rules

1. Press **▶ Start Round** to begin a 45-second round.
2. Balloons float up from the bottom — tap/click them to pop.
3. Each pop scores 10 × current multiplier. Multiplier increases with each pop.
4. If a balloon reaches the top, your multiplier resets to ×1.
5. Speed and spawn rate increase as your score grows.
6. Game ends when the timer hits 0.
7. Click **Pop Again** to restart without refreshing.

## Usage

1. Open `index.html` in any modern browser.
2. Click **▶ Start Round**.
3. Tap/click balloons as they float up — build your multiplier.
4. Try to beat your personal best!

## Project Structure

```
Balloon Pop Game/
├── index.html        # Main entry point
├── style.css         # Cyberpunk festival theme
├── script.js         # Game engine
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
