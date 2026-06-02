# FocusFlow

FocusFlow is a modern, production-quality productivity dashboard designed to help you maintain deep work, track your tasks, and monitor your session analytics. It features a clean, glassmorphism-inspired UI, smooth interactions, and robust state persistence without relying on any heavy frameworks.

## Features

- **Pomodoro Focus Timer:** Customizable sessions for focus and breaks. Includes a circular SVG progress indicator and browser tab title updates.
- **Task Manager:** Add, edit, prioritize, and complete tasks. The progress bar gives a quick visual of daily accomplishment.
- **Session Analytics:** Tracks your daily focus minutes, total sessions completed, and maintains a daily streak counter.
- **Productivity Widgets:** A real-time clock, date display, dynamic greeting, and a rotating daily inspirational quote.
- **Themes & Sound:** Toggle between Dark (default) and Light mode. Toggle sound effects for session completion.
- **Confetti Effect:** A fun, celebratory confetti burst upon completing a focus session.
- **State Persistence:** Entire application state (tasks, stats, settings) is saved to `localStorage` and restored seamlessly on reload.

## Tech Stack

- **HTML5:** Semantic layout and structure.
- **CSS3:** Custom variables, glassmorphism (`backdrop-filter`), animations, responsive grid/flexbox layouts. No frameworks used.
- **Vanilla JavaScript (ES6+):** Modular, class-like structure for managing different app components.
- **Icons & Fonts:** 
  - [Phosphor Icons](https://phosphoricons.com/) via CDN.
  - [Google Fonts](https://fonts.google.com/) (Inter and Outfit).
- **External Libraries:** 
  - [canvas-confetti](https://www.kirilv.com/canvas-confetti/) via CDN for celebration effects.

## Setup Instructions

1. Clone or download this repository.
2. Navigate to the project directory.
3. Open `index.html` in any modern web browser.
   - Alternatively, you can use a local development server (e.g., `npx serve` or VS Code Live Server) for the best experience.

## Project Structure

```
focus-flow/
├── index.html       # Main application markup
├── style.css        # Theme, layout, and UI styles
├── script.js        # Core logic and state management
└── README.md        # Project documentation
```

## UI/UX Highlights

- **Glassmorphism Aesthetic:** Translucent panels over animated floating background blobs create a modern feel.
- **Responsive Design:** A fully fluid layout that works beautifully on desktop monitors and scales down elegantly for mobile devices.
- **Micro-Interactions:** Hover effects on buttons, animated checkboxes, and smooth transitions on element state changes.
- **Accessibility:** Uses semantic HTML and ARIA labels. Supports high contrast text. Keyboard operable elements.
