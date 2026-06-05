# Hex-Code Hues

A premium color-guessing game built with vanilla HTML5, CSS3, and JavaScript (ES6+). Match the displayed hex code (`#RRGGBB`) to the correct circular color swatch — but watch out, the colors get nearly identical as your streak climbs!

## Features

- **Procedural Hex Generation** — Random RGB values are generated and converted to clean uppercase hex strings.
- **Adaptive Tint Similarity Engine** — Streak < 3: completely random distractors. Streak ≥ 3: colors are mutated from the target with a narrowing variance (starts at ±60, shrinks by 4 per streak level, minimum ±5).
- **Interactive Feedback** — Correct clicks trigger a scale-up pop animation (+10pts). Wrong clicks trigger a shake animation, red screen flash, streak reset, and auto-reveal of the correct swatch.
- **High Score Caching** — Best streak is persisted in `localStorage` and displayed on boot.
- **Premium Studio Theme** — `#0b0c10` charcoal canvas, frosted glass panels, large circular swatches, monospace hex display with gradient text.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `backdrop-filter` glassmorphism, `@keyframes` pop/shake animations, `vmin` swatch sizing
- Vanilla JS (ES6+) — RGB/hex conversion, Fisher-Yates shuffle, variance-based color mutation, `localStorage`

## Rules

1. A hex code is displayed (e.g., `#22C55E`).
2. Three circular swatches are shown — one matches the hex code.
3. Click the correct swatch to score +10 and increase your streak.
4. Streak < 3: distractors are completely random colors.
5. Streak ≥ 3: distractors are nearly identical shades — the higher your streak, the harder it gets.
6. A wrong click resets your streak to 0.
7. Click **▶ Next Round** to continue or **⟳ New Game** to restart.

## Usage

1. Open `index.html` in any modern browser.
2. Read the hex code in the center panel.
3. Click the color swatch that matches it.
4. Watch the streak climb — and the colors get trickier.
5. Your best streak is saved automatically.

## Project Structure

```
Hex-Code Hues/
├── index.html        # Main entry point
├── style.css         # Premium studio theme
├── script.js         # Game engine & color generation
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
