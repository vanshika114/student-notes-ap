# Blind-Route Grid Tracker

A cyberpunk memory puzzle built with vanilla HTML5, CSS3, and JavaScript (ES6+). Watch a path of tiles light up on a 5×5 grid, then repeat the sequence from memory. Each successful level adds one more tile to the path.

## Features

- **Procedural Contiguous Path Generator** — Generates a connected path (up/down/left/right, no diagonals). Path length starts at 3 for Level 1 and grows by 1 each level.
- **Flash Phase** — Tiles light up sequentially in neon cyan over ~2 seconds. All clicks are locked during this phase.
- **Recall Phase** — Click tiles in the same order. Correct clicks lock in emerald green; one wrong click triggers a crimson flash, reveals the full correct path as a learning guide, and resets to Level 1.
- **Obstacle Mapping (Level 5+)** — Two static amber obstacle blocks are placed on the board. The path generator actively routes around them.
- **Best Level Tracking** — Highest completed level is persisted in `localStorage`.
- **Cyberpunk Dark Theme** — `#070814` obsidian canvas, frosted-glass tiles, neon cyan, emerald, and crimson accents.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — CSS Grid, `backdrop-filter` glassmorphism, `@keyframes` shake animation, `vmin` scaling
- Vanilla JS (ES6+) — Procedural path generation, `setInterval` async flash queues, real-time click validation, `localStorage`

## Rules

1. Press **▶ Start Round** to begin.
2. Watch the cyan tiles — that's the path you need to remember.
3. After the flash ends, click the tiles in the exact same order.
4. Correct clicks turn emerald green. A wrong click ends the round.
5. Complete the path to advance to the next level (path grows by 1 tile).
6. At Level 5+, amber obstacles appear — the path avoids them automatically.

## Usage

1. Open `index.html` in any modern browser.
2. Click **▶ Start Round** — watch the path flash.
3. Click the tiles in the same order during recall.
4. Complete the path to level up, or make a mistake to restart at Level 1.
5. Click **⟳ Reset Game** to manually restart.

## Project Structure

```
Blind-Route Grid Tracker/
├── index.html        # Main entry point
├── style.css         # Cyberpunk dark theme
├── script.js         # Game engine & path generation
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
