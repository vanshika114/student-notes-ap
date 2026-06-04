# Habit Matrix — Tracker

A premium, dark-glassmorphism habit tracker built with vanilla HTML5, CSS3, and JavaScript (ES6+). Track your daily and weekly habits with an interactive 7-day matrix, streak analytics, and persistent local storage.

## Features

- **7-Day Matrix Tracking** — Click day-nodes to instantly toggle completion. Visual pop feedback on every toggle.
- **Streak Engine** — Automatically calculates consecutive-day streaks from today backward.
- **Completion Analytics** — Per-habit 7-day rate with color-coded progress bars + global dashboard stats.
- **Category Tags** — Color-coded categories (Health, Mind, Fitness, Productivity, Social, Creative).
- **Insights Modal** — Click the chart icon on any habit to view detailed stats and a 30-day mini-grid.
- **Undo Support** — Deleting a habit or clearing its progress shows an undo toast (4-second window).
- **localStorage Persistence** — All habits and checkmarks survive page refresh.
- **Motivational Quotes** — Rotating quote in the dashboard header.
- **Fully Responsive** — Mobile-first layout with horizontal swipe for day-nodes on small screens.

## Tech Stack

- HTML5 — Semantic markup
- CSS3 — Glassmorphism, CSS Grid, `backdrop-filter`, keyframe animations
- Vanilla JS (ES6+) — No frameworks, no dependencies

## Usage

1. Open `index.html` in any modern browser.
2. Type a habit name, choose frequency (Daily/Weekly) and a category, then click **+ Add Habit**.
3. Click the day circles in any habit row to toggle completion.
4. Use the action buttons on each card to view insights, clear progress, or delete the habit.
5. All data is automatically saved to your browser's `localStorage`.

## Project Structure

```
Habit Track Ai/
├── index.html        # Main entry point
├── style.css         # Cyberpunk dark glassmorphism styles
├── script.js         # Client-side engine & localStorage
├── project.json      # Project metadata
├── thumbnail.svg     # Preview thumbnail
└── README.md         # This file
```

## Author

**Girish Madarkar** — [Girish0902](https://github.com/Girish0902)
