# Syllabus Tracker - Production-Grade Implementation

A sophisticated, production-ready syllabus tracking application built with React, Next.js, TypeScript, and TailwindCSS. This project demonstrates senior-level architecture, state management, and UI/UX design patterns.

## ✨ Features

### Core Functionality
- **Hierarchical Structure**: Subject → Module → Topic
- **Real-time Progress Calculation**: Automatically derived from completion state
- **Persistent Storage**: LocalStorage for instant data persistence across sessions
- **Optimistic UI Updates**: Instant visual feedback for user actions

### Advanced Features
- **Deep Linking**: Share progress state via URL parameters (`?subject=id&module=id`)
- **Data Portability**: Export data as JSON and import backups
- **Keyboard Navigation**: Full accessibility support with semantic HTML
- **Custom SVG Animations**: Hardware-accelerated progress circles
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🏗️ Architecture

### Data Schema
```typescript
Subject {
  id: string
  title: string
  description?: string
  modules: Module[]
}

Module {
  id: string
  name: string
  topics: Topic[]
}

Topic {
  id: string
  name: string
  isCompleted: boolean
}
```

### State Management
Uses **Zustand** with localStorage persistence:
- Minimal boilerplate
- TypeScript support
- Automatic state derivation
- No Redux overkill

### Progress Calculation
Pure functions compute progress on-the-fly:
```typescript
calculateModuleProgress(module) → 0-100%
calculateSubjectProgress(subject) → 0-100%
```

## 📦 Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5.3
- **Styling**: TailwindCSS 3.3
- **State Management**: Zustand 4.4
- **Storage**: Browser LocalStorage
- **Build Tool**: Next.js built-in

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
cd syllabus_tracker
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 📖 Usage Guide

### Creating a Subject
1. Click **"+ New Subject"** in the subjects bar
2. Enter the subject name
3. Optionally add a description
4. Select the subject card to expand

### Adding Modules
1. Select a subject to view details
2. Click **"+ Add Module"** at the bottom
3. Enter the module name

### Adding Topics
1. Expand a module by clicking on it
2. Click **"+ Add Topic"**
3. Enter the topic name
4. Check the box to mark complete

### Tracking Progress
- **Module Progress**: Circle shows completion % for that module
- **Subject Progress**: Overall circle reflects all topics across all modules
- **Real-time Updates**: Progress updates instantly as you check topics

### Deep Linking
Save your progress location:
```
http://localhost:3000/?subject=<id>&module=<id>
```

Bookmark this URL to return to the same place later.

### Data Backup & Import
1. Click the **⚙️** (settings) icon in the header
2. **Export Backup**: Downloads current data as JSON
3. **Import Backup**: Upload previously saved JSON files
4. **Reset All Data**: Clear all data (⚠️ irreversible)

## 🎯 Key Implementation Details

### Derived State Pattern
Instead of storing redundant progress percentages:
```typescript
// ❌ Anti-pattern
topics.map(t => t.isCompleted ? 1 : 0).reduce((a,b) => a+b) / topics.length

// ✅ Senior pattern
calculateModuleProgress(module) // Pure function, always accurate
```

### Optimistic Updates
UI updates instantly before state changes:
```typescript
toggleTopic(subjectId, moduleId, topicId) // Zustand handles atomically
```

### Accessibility
- Semantic `<input>` elements for checkboxes
- ARIA labels for screen readers
- Full keyboard navigation (Tab, Enter, Escape)
- High contrast colors for visibility

### Performance
- SVG circles render at 60fps
- CSS transforms (no layout thrashing)
- LocalStorage reads/writes are instant
- No heavy dependencies

## 🔒 Data Privacy
- All data stored locally in your browser
- No server communication
- No analytics or tracking
- Export functionality for portability

## 📱 Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  danger: "#ef4444",
}
```

### Progress Circle Colors
Edit component props:
```typescript
<ProgressCircle percentage={80} color="#custom-color" />
```

## 🧪 Project Structure
```
syllabus_tracker/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main app page
│   └── globals.css         # Global styles
├── components/
│   ├── ProgressCircle.tsx  # SVG progress component
│   ├── TopicChecklist.tsx  # Topic list with keyboard nav
│   ├── ModuleCard.tsx      # Module display
│   ├── SubjectView.tsx     # Subject details view
│   ├── SubjectList.tsx     # Subject navigation
│   └── DataManager.tsx     # Import/export manager
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── utils.ts            # Helper functions
│   └── store.ts            # Zustand store
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 💡 Senior-Level Patterns Demonstrated

1. **Hierarchical Data Modeling**: Enables recursive rendering
2. **Derived State**: No data duplication, single source of truth
3. **Pure Functions**: All calculations are deterministic
4. **TypeScript**: Full type safety throughout
5. **Zustand Persistence**: Automatic state hydration
6. **Semantic HTML**: Accessibility-first approach
7. **CSS-in-JS with TailwindCSS**: Scoped, responsive styling
8. **Deep Linking**: URL as state container
9. **Error Handling**: Graceful import/export validation
10. **Optimistic UI**: Instant feedback, no loading states

## 🐛 Troubleshooting

### Data not persisting?
- Check if browser allows localStorage
- Verify Zustand is configured with persist middleware
- Check browser DevTools → Application → LocalStorage

### Progress not updating?
- Ensure topic `isCompleted` is toggled correctly
- Check Zustand store subscriptions in React DevTools
- Verify components are re-rendering on state change

### Styling issues?
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check TailwindCSS content paths in config

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com/docs)

## 📄 License

This project is open source and available for educational purposes.

---

**Built with ❤️ following production-grade software engineering principles.**
