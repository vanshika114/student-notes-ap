# Cosmic Debris Evader

A deep-space survival arcade game built with vanilla HTML5, CSS3, and JavaScript (ES6+) using the HTML5 Canvas API. Dodge falling debris, activate your magnetic deflection field, and survive as long as possible in the cosmic void.

## Features

- **Canvas 2D Rendering** — Hardware-accelerated 60fps game loop via `requestAnimationFrame` with dynamic starfield background.
- **Circle-to-Circle Collision** — Precise Euclidean distance monitoring (`d = √((x₂−x₁)² + (y₂−y₁)²)`) checked against combined radii every frame — no bounding boxes.
- **Magnetic Deflection Field** — Press and hold **Space** (or touch-hold on mobile) to deploy a pulsating cyan field around your shield. Debris inside the field gets pushed away with inverted horizontal velocity. Field energy drains while active and recharges when idle.
- **Procedural Debris Spawning** — Three size classes (small/fast, medium, large/slow) spawn at random x-positions with slight lateral drift and gravity-like acceleration.
- **Array Sanitization** — Off-screen debris is purged from memory the instant it exits the canvas bounds.
- **Survival Scoring** — Score accumulates over survival time (10 pts/sec). High score persisted in `localStorage`.
- **Impact Particles** — On collision, a burst of orange particles erupts for tactile feedback.
- **Deep-Space Aesthetic** — `#03050a` obsidian backdrop, neon cyan `#06b6d4` player shield, electric orange `#f97316` debris, pulsing field ring, starfield layer.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — `backdrop-filter` glassmorphism, `@keyframes` modal animation, `vmin` responsive scaling, CSS custom properties
- Vanilla JS (ES6+) — `requestAnimationFrame` game loop, Canvas 2D API, Euclidean distance collision, vector reflection physics, `setInterval` spawn pipeline, `localStorage`

## Controls

| Input | Action |
|-------|--------|
| Mouse move / touch drag | Move shield left/right |
| Spacebar (hold) / touch-hold | Activate magnetic deflection field |

## Rules

1. You control a cyan shield node at the bottom of the screen.
2. Orange debris falls from above — avoid it!
3. Hold **Space** (or touch-hold) to deploy a magnetic field that pushes debris away.
4. The field has limited energy — it drains while active and recharges when off.
5. Each collision damages your shield. Shield hits zero = Game Over.
6. Score increases with survival time.
7. Click **Launch Again** to restart without refreshing.

## Usage

1. Open `index.html` in any modern browser.
2. Move your mouse (or drag your finger) to dodge debris.
3. Hold Space (or long-press) to activate the magnetic field.
4. Survive as long as possible and beat your high score.

## Project Structure

```
Cosmic Debris Evader/
├── index.html        # Main entry point
├── style.css         # Deep-space theme
├── script.js         # Canvas game engine
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
