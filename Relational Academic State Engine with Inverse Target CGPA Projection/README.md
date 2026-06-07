# Advanced GPA Projection Engine

A modular static web app for calculating semester SGPA and cumulative CGPA, plus back-projection for a target CGPA based on remaining credits.

## Project Structure

- `index.html` — app shell and dashboard layout
- `styles.css` — external stylesheet for responsive dashboard UI
- `script.js` — application bootstrap and module wiring
- `state.js` — academic state persistence, semester/course mutation, local storage sync
- `projection.js` — target projection math and validation logic
- `render.js` — DOM rendering, event delegation, and dashboard updates
- `analytics.js` — grade distribution and future projection scenario helpers
- `io.js` — JSON import/export and reset controls
- `utils.js` — common helpers for formatting and validation

## Features

- multi-semester state tree with nested course data
- SGPA and CGPA calculations per semester and cumulatively
- target CGPA back-projection with threshold messaging
- grade distribution visualization for earned courses
- future projection scenarios for all-S, all-A, and safe-case grading
- JSON export/import for saved academic state
- local storage persistence for academic state
- dynamic UI updates and course/semester management

## Usage

1. Open `index.html` in a modern browser that supports ES modules.
2. Add semesters and courses.
3. Enter a target CGPA and remaining credits.
4. See the required future GPA needed to achieve the goal.

## Notes

This app is designed as a clean front-end prototype and uses ES module imports in the browser.
