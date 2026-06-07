# Car Dodger Game

A synthwave retro-grid highway arcade game built with native HTML5, CSS3, and JavaScript (ES6+). Weave through oncoming traffic, survive as long as possible, and beat your personal best.

## Features

- **Parallax Highway Scrolling** — Continuous vertical road rendering with dashed lane dividers, neon shoulder strips, and a subtle horizon line that creates a convincing sense of forward momentum at 60 fps.
- **Snappy Lane Controls** — Arrow keys (or WASD) with a 180 ms cooldown per lane switch. Touch left/right halves of the canvas on mobile. Velocity-dampened `lerp` transition between lanes for silky movement.
- **Procedural Traffic Spawning** — Asynchronous spawn loop generates cars at random lane indices (3 lanes, 120 px each). Each vehicle has randomised colour, width (34–44 px), height (58–72 px), and speed offset. Prevents same-lane stacking within 200 px of the top edge.
- **AABB Collision Detection** — Strict 2D axis-aligned bounding box check on every frame against all active obstacles. On impact: background scroll halts, full-canvas red screen flash + camera shake for ~50 frames, then the results overlay fades in.
- **Endless Difficulty Curve** — Every 10 seconds, master speed increases by +0.4 px/frame and spawn delay is reduced by 13% (clamped to 400 ms min). Speed factor displayed live as `×1.0`, `×2.5`, etc.
- **Persistent Best Record** — High score cached in `localStorage` under `carDodgerBest`. Displayed in the dashboard and updated automatically on the best run.

## Tech Stack

- HTML5 — Semantic telemetry bar, canvas viewport, game-over modal
- CSS3 — `#05070f` midnight backdrop, hot-pink `#ff2d78` neon accents, glassmorphic `rgba(255,255,255,0.02)` score panels, `aspect-ratio` canvas scaling, mobile `vmin` rules
- Vanilla JS (ES6+) — `requestAnimationFrame` delta-time loop, `lerp` lane smoothing, AABB collision math, random procedural generation, `localStorage` persistence

## Rules

1. You control a hot-pink sports car in a 3-lane highway.
2. **Arrow Left** / **A** or **tap left half** of screen → move left one lane.
3. **Arrow Right** / **D** or **tap right half** of screen → move right one lane.
4. Dodge oncoming traffic. Each car that passes below the screen counts as a dodge.
5. Score ticks up every 100 ms you survive. Survive longer = higher score.
6. Every 10 seconds the traffic speeds up and spawns more frequently.
7. **Crash into any car** → game over. A red flash + camera shake plays before the results modal.
8. Beat your high score to update the **BEST** record (saved in your browser).

## Controls

| Input | Action |
|-------|--------|
| `←` / `A` | Move left one lane |
| `→` / `D` | Move right one lane |
| Tap left half of canvas | Move left one lane |
| Tap right half of canvas | Move right one lane |
| **PLAY AGAIN** | New round after game over |

## Usage

1. Open `index.html` in any modern browser.
2. The game starts immediately — dodge the first wave of traffic.
3. Watch your TIME, SCORE, SPEED factor, and BEST record in the dashboard.
4. After a crash, review your stats and tap **PLAY AGAIN**.

## Project Structure

```
Car Dodger Game/
├── index.html        # Main entry point
├── style.css         # Synthwave dark theme
├── script.js         # Game engine
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
