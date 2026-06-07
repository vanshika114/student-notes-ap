# Open Source Contribution Tracker & Achievement System

A premium client-side productivity dashboard for open-source contributors, developers, and learners. This application helps you log daily commits, issues, and pull requests, track contribution streaks, monitor targets, and visualize growth using interactive graphs and a GitHub-style contribution calendar heatmap.

## Features

- **GitHub Activity Heatmap**: A visual 53-week contribution calendar that updates color density as you log open-source work.
- **Goal Monitor**: Set monthly contribution goals and view your progression with dynamically updating progress bars.
- **gamification & Badges**: Earn achievement trophies automatically (e.g. "First PR", "Commit Crusher", "Streak Builder") based on your contribution count and active streak.
- **Analytics Dashboard**: Interactive charts powered by Chart.js (Activity type distribution and contribution growth timelines).
- **Tracked Repositories**: Manage target repositories to quickly associate contributions with specific open-source projects.
- **Search & Filters**: Search contribution logs by repository, type, status, commit hash, or title.
- **Theme Switcher**: Support for both Dark and Light theme modes.
- **Import/Export Data**: Export database as a JSON configuration file and import backups anytime.

## Technical Details

- **Core Tech**: Client-side HTML5, CSS3, and JavaScript (ES6+).
- **Libraries**:
  - **Chart.js**: Dynamic and modern data visualizations.
  - **Lucide Icons**: Premium, clean stroke-based iconography.
  - **Google Fonts**: Outfit & Plus Jakarta Sans typography.
- **Data Persistence**: LocalStorage sync keeps your profile, repositories, goals, and logged activities saved across page reloads.

## Folder Structure

```
open-source-contribution-tracker/
├── index.html   # Main dashboard layouts, widgets & modals
├── style.css    # Responsive premium styles, custom dark/light theme systems
├── app.js       # Core state management, calendar grids & analytics logic
└── README.md    # Documentation and usage guide
```
