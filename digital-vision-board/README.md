# AuraBoard — Digital Vision Board & Goal Tracker

A premium, interactive, and client-side **Digital Vision Board** dashboard designed to help you visually structure your aspirations, align daily habits, and trace progress using local memory.

## 🚀 Project Overview

AuraBoard is a web application inspired by Pinterest and Notion. It enables users to manifest their dreams by building motivational goal cards containing custom image assets, descriptions, target dates, progress trackers, and custom categories. It also features streak habit monitoring and automated motivational checkpoints.

## ✨ Features

- **🎯 Vision Card Builder**: Design customizable goal cards matching color codes across Career, Health, Travel, Learning, and Personal topics.
- **🖼 Image Anchors**: Set custom backgrounds and upload motivational image previews saved locally via Base64 string encoding.
- **📊 Goal Analytics**: Watch real-time radial completion charts calculate overall progress as tasks finish.
- **🔥 Daily Habit Actions**: Keep streak tracks active via task checks refreshed daily.
- **🏆 Achievements System**: Unlock rewards based on active cards count, habit streaks, or completing categories.
- **🌙 Theme Customization**: Switch between responsive light and dark themes styled with deep purple/blue glow elements.
- **🖱 Drag & Drop Placement**: Rearrange card locations dynamically to structure board priorities.

## 🛠 Tech Stack

- **Markup**: Semantic HTML5 structures
- **Styles**: Glassmorphic Vanilla CSS architecture
- **Logics**: ES6+ JavaScript core
- **Database**: Browser LocalStorage persistence layer

## 📁 Folder Structure

```
digital-vision-board/
├── index.html   # Main dashboard layout
├── style.css    # Responsive variables, light & dark theme details
├── app.js       # Core state management, CRUD, streaks, drag & drop API
└── README.md    # Documentation
```

## ⚙️ Installation & Usage

Since AuraBoard runs natively in the browser without server requirements, installation is simple:

### Local Setup Instructions

1. **Clone or navigate** to the project directory:
   ```bash
   cd digital-vision-board
   ```
2. **Open the App**:
   Double click the `index.html` file or run it via a local development server (such as Live Server in VS Code).
3. If using Node.js/npm globally, launch using:
   ```bash
   npx serve .
   ```
4. **Manifesting Aspirations**:
   - Tap **"New Vision Card"** in the top navigation.
   - Enter your goal details, attach an image, choose a category, and save it.
   - Drag and drop cards to organize.
   - Check daily actions to preserve your Flame Streak!
