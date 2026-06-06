# Whack-Mole

A cyberpunk arcade whack-a-mole game built with vanilla HTML5, CSS3, and JavaScript (ES6+). Moles pop up from a 3×3 grid — whack them before they hide, build your combo multiplier, and survive the 30-second countdown.

## Features

- **Procedural Spawning** — Moles appear at random grid positions with dynamic timing.
- **Dynamic Difficulty** — Mole visibility starts at 1000ms and shrinks by 50ms per 50 points, down to a fast 400ms threshold.
- **Combo Multiplier** — Each successful whack increases the combo (×1 → ×2 …). Missing resets it to ×1.
- **30-Second Countdown** — A live progress bar shrinks across the top dashboard; turns danger-red under 20%.
- **Hit / Miss Feedback** — Successful whacks trigger a pink flash and floating score text; missed clicks shake the grid and reset the combo.
- **Double-Click Prevention** — A strict state flag blocks multiple clicks on the same mole spawn.
- **Persistent High Score** — Best score saved in `localStorage` and displayed on the scorecard.
- **Game Over Modal** — Polished overlay with final score, personal best, and a zero-refresh restart button.
- **Cyberpunk Arcade Theme** — `#070a13` dark canvas, neon teal outlines, hot-pink hit effects, glassmorphic panels.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `backdrop-filter` glassmorphism, 3D `translateY` mole pop-up transitions, `@keyframes` shake & float-up animations, `vmin` responsive sizing
- Vanilla JS (ES6+) — IIFE module pattern, `setTimeout`/`setInterval` orchestration, DOM delegation, `localStorage`

## Rules

1. Press **Start Round** to begin a 30-second game.
2. Moles pop up from random holes — click/tap them to whack.
3. Each successful whack: +10 points × combo multiplier.
4. Click an empty hole: combo resets to ×1.
5. Mole visibility shrinks as your score grows — react faster!
6. Game ends when the timer hits 0.
7. Click **Play Again** on the modal to start a new round without refreshing the page.

## Usage

1. Open `index.html` in any modern browser.
2. Click **▶ Start Round**.
3. Whack moles as they appear — build your combo.
4. Try to beat your personal best score.

## Project Structure

```
Whack-Mole/
├── index.html        # Main entry point
├── style.css         # Cyberpunk arcade theme
├── script.js         # Game engine
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
