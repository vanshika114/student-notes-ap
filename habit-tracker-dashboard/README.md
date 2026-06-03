# AuraHabit - Habit Tracker Dashboard with Streak Tracking & Weekly Analytics

AuraHabit is a premium, client-side habit tracking application that empowers users to build structured, healthy, and productive routines. Designed with a sleek gold, royal purple, deep black, and slate blue color scheme, AuraHabit features a clean dashboard layout, interactive weekly analytics, progress visualizations, an achievements badge room, and seamless offline data syncing using local storage.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Purpose & Benefits](#-purpose--benefits)
3. [Features](#-features)
4. [Screenshots](#-screenshots)
5. [Tech Stack](#-tech-stack)
6. [Installation & Local Setup](#-installation--local-setup)
7. [Detailed Usage Guide](#-detailed-usage-guide)
8. [Folder Structure](#-folder-structure)
9. [Future Enhancements](#-future-enhancements)
10. [Contribution Guidelines](#-contribution-guidelines)
11. [License Information](#-license-information)

---

## 🌟 Project Overview
AuraHabit provides a unified view of your daily checklists, streak records, performance statistics, and milestone trackers. By using HTML5, CSS Grid, and custom JavaScript, the application runs directly in the web browser with zero backend requirements.

## 🎯 Purpose & Benefits
- **Habit Formation**: Encourages behavioral repetition through progressive rewards.
- **Visual Feedback**: Weekly and monthly charts highlight consistency rates and check-in history.
- **Streak Accountability**: An intelligent streak algorithm rewards uninterrupted day-to-day commitments.
- **Gamified Achievements**: Leveling, XP collection, and custom badge unlocks make self-improvement engaging.
- **100% Client-Side**: Your habits are private and remain stored locally in your web browser.

---

## ⚡ Features
- **Daily Checklist**: Group routines by Morning, Afternoon, or Evening, and check them off in real-time.
- **Flexible Scheduling**: Set daily, specific weekday (e.g. Mon/Wed/Fri), or weekly target (e.g. 3x a week) frequencies.
- **Weekly & Monthly Charts**: Powered by Chart.js, rendering completion ratios and past-month consistency lines.
- **Routine Heatmap**: A GitHub-style contribution matrix showing daily check-in densities over the past year.
- **Sleek Light/Dark Themes**: A modern glassmorphic look that dynamically adapts to user theme preferences.
- **Interactive Badge Room**: Unlockable achievements rewarding first steps, multi-day streaks, and category diversity.
- **Backups & Backdoors**: Tools to export your data to a JSON backup, import backups, generate mock demo data, or wipe database stats.
- **Synth Audio Feedback**: Synthetic sound effects generated using the Web Audio API upon completing habits and leveling up.

---

## 📸 Screenshots
*(Once run locally, the interface displays a dashboard structure as shown below)*

```
+-------------------------------------------------------------------------+
| [CROWN] AuraHabit       [=] Hello, Achiever              [ STAR 2,400 Pts ] |
|                                                                         |
|  (o) Dashboard         +---------------------------------------------+  |
|  [x] My Habits         | Today's Progress: 75% [========]            |  |
|  [/] Analytics         | Current Streak: 12 Days (Best: 24 Days)     |  |
|  [#] Calendar          +---------------------------------------------+  |
|  [*] Achievements      | TODAY'S CHECKLIST         | WEEKLY GOALS    |  |
|  [s] Settings          | [x] Read 15 mins (Easy)   | Completions: 90%|  |
|                        | [ ] Gym Lift (Hard)       | Perfect Days: 5 |  |
|                        | [x] Code 1hr (Med)        | Badge Showcase  |  |
|  ( ) Light/Dark Mode   +---------------------------+-----------------+  |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack
- **Structure**: Semantic HTML5 (HTML5 Canvas element for rendering).
- **Styling**: Vanilla CSS3 (CSS variables, Grid, Flexbox, Keyframe Animations, glassmorphic filters).
- **Behavior**: Modern ES6 JavaScript.
- **Third-Party Libraries** (Loaded via CDN):
  - [Chart.js](https://www.chartjs.org/) (for interactive analytics)
  - [FontAwesome v6](https://fontawesome.com/) (for vector icons)
  - [Canvas-Confetti](https://github.com/catdad/canvas-confetti) (for milestone celebrations)
- **Audio synthesis**: Web Audio API (native browser synthesized waveforms).

---

## ⚙️ Installation & Local Setup

AuraHabit is designed to run out of the box with zero external package managers, databases, or local Node.js compilation steps required.

### Local Execution Method (Double-Click)
1. Clone this repository locally.
2. Locate the project folder `/habit-tracker-dashboard`.
3. Double-click the file [index.html](file:///v:/Nexus-spring-of-code/student-notes-app-new/habit-tracker-dashboard/index.html) to open the dashboard directly in your web browser.

### Local Server Method (Recommended for Web Audio / APIs compatibility)
If you wish to host it locally using a lightweight server:
1. Open your terminal or shell in the repository folder.
2. Run any static file server:
   - **Python 3**: `python -m http.server 8000` (Visit `http://localhost:8000`)
   - **Node.js (Npx)**: `npx serve` (Visit `http://localhost:3000`)
3. AuraHabit will load instantly in your browser.

---

## 🚀 Detailed Usage Guide

### 1. Creating a Habit
- Click **New Habit** in the top navigation bar.
- Enter a name, description, preferred completion window (Morning/Afternoon/Evening), card color accent, and scheduling target.
- Save the form to add the item directly to your daily routine checks.

### 2. Checking Off Days
- In the **Dashboard** view, click the circular check button next to a habit title to mark it done today.
- Checking off habits will increment your XP bar, total points, and current active streak tracker.

### 3. Evaluating Stats
- Switch to **Analytics** to view category density doughnuts, weekly progress columns, and daily check-in histories.
- Click **Calendar** to review consistency maps or inspect previous months to see completion histories on specific calendar dates.

### 4. Backup & Backup Recovery
- In **Settings**, click **Export Data** to download your routine history to a file.
- Click **Import Backup** and select your downloaded JSON backup to restore your data on any browser.
- Click **Populate 30-Day Mock Habits** to instantly populate the dashboard with 30 days of mock history to verify the heatmap and charts.

---

## 📂 Folder Structure
```
habit-tracker-dashboard/
├── index.html     # Semantic layout, modals, navigation structures, and library imports
├── style.css      # Layout configurations, CSS variables, keyframe animations, and responsive styles
├── app.js         # State tracking, streak engine, Sound effects, and chart binders
└── README.md      # Project details, local installations, and specifications
```

---

## 🔮 Future Enhancements
- **Custom Soundboards**: Support uploading user custom `.mp3` completion sounds.
- **Habit Categories Editor**: Add/remove categories beyond Health, Mind, and Productivity.
- **PWA Capabilities**: Enable offline installations on mobile home screens.
- **Email Notifications**: Integration with basic reminder microservices.

---

## 🤝 Contribution Guidelines
Contributions, bug reports, and features are welcome!
1. Fork the Project repository.
2. Create a Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your modifications (`git commit -m 'Add NewFeature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License Information
Distributed under the MIT License. See `LICENSE` for more information.
