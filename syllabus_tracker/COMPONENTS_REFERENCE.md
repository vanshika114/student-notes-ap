# Component & Utility Reference

## 🧩 React Components

### ProgressCircle.tsx
**Purpose**: Reusable SVG circular progress indicator
```typescript
<ProgressCircle 
  percentage={80}          // 0-100
  size={120}               // Diameter in pixels
  strokeWidth={10}         // Ring thickness
  color="#3b82f6"         // Custom color
  label="Progress"        // Optional label
/>
```
- Hardware-accelerated SVG animations
- Smooth transitions with CSS
- No heavy dependencies
- Responsive sizing

### TopicChecklist.tsx
**Purpose**: Accessible list of topics with inline editing
- Semantic `<ul>` and `<li>` elements
- Checkbox-based completion tracking
- Inline edit on click
- Delete functionality
- Full keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers

### ModuleCard.tsx
**Purpose**: Expandable module display with progress
- Collapsible module details
- Progress circle visualization
- Add/edit/delete functionality
- Nested topic management
- Smooth expand/collapse animation
- Actions bar (edit/delete buttons)

### SubjectView.tsx
**Purpose**: Detailed view of a subject with all modules
- Subject header with title/description
- Overall progress visualization
- Module list management
- Add module functionality
- Edit subject details
- Statistics display (topics/modules count)

### SubjectList.tsx
**Purpose**: Navigation grid showing all subjects
- Grid layout of subject cards
- Quick progress indicators
- Add new subject functionality
- Subject selection/highlighting
- Responsive grid (1-4 columns)
- Keyboard navigation

### DataManager.tsx
**Purpose**: Import/export and data management
- Export data as JSON file download
- Import from JSON (paste or file upload)
- Reset all data with confirmation
- Error handling for invalid JSON
- Modal-based import UI
- Settings menu (⚙️ icon)

---

## 📦 Utility Functions

### lib/types.ts
**TypeScript Interfaces**:
```typescript
interface Topic {
  id: string
  name: string
  isCompleted: boolean
  weightage?: number
}

interface Module {
  id: string
  name: string
  topics: Topic[]
}

interface Subject {
  id: string
  title: string
  description?: string
  modules: Module[]
  createdAt: number
  updatedAt: number
}
```

### lib/utils.ts
**Progress Calculation Functions**:

#### `calculateModuleProgress(module: Module): number`
- Returns 0-100 percentage
- Counts completed topics
- Returns 0 if no topics exist

#### `calculateSubjectProgress(subject: Subject): number`
- Aggregates all modules
- Returns 0-100 percentage
- Accounts for total topics across all modules

#### `getSubjectStats(subject: Subject)`
- Returns stats object:
  ```typescript
  {
    totalTopics: number
    completedTopics: number
    progress: number (0-100)
    moduleCount: number
  }
  ```

#### `getModuleStats(module: Module)`
- Returns stats object:
  ```typescript
  {
    totalTopics: number
    completedTopics: number
    progress: number (0-100)
  }
  ```

#### `generateId(): string`
- Creates unique IDs: `{timestamp}-{random}`
- Used for subjects, modules, topics
- Non-blocking, fast generation

#### `formatDate(timestamp: number): string`
- Converts Unix timestamp to readable format
- Format: "Jan 1, 2024"
- Locale-aware

---

## 🎛️ State Management

### lib/store.ts - Zustand Store

**State Structure**:
```typescript
{
  subjects: Subject[]
  selectedSubjectId: string | null
  selectedModuleId: string | null
}
```

**Subject Operations**:
- `addSubject(title, description?)` - Create subject
- `deleteSubject(subjectId)` - Remove subject
- `updateSubject(subjectId, title, description?)` - Edit subject
- `setSelectedSubject(subjectId | null)` - Select subject

**Module Operations**:
- `addModule(subjectId, moduleName)` - Create module
- `deleteModule(subjectId, moduleId)` - Remove module
- `updateModule(subjectId, moduleId, moduleName)` - Edit module
- `setSelectedModule(moduleId | null)` - Select module

**Topic Operations**:
- `addTopic(subjectId, moduleId, topicName)` - Create topic
- `deleteTopic(subjectId, moduleId, topicId)` - Remove topic
- `toggleTopic(subjectId, moduleId, topicId)` - Mark complete/incomplete
- `updateTopic(subjectId, moduleId, topicId, name)` - Edit topic

**Data Operations**:
- `exportData(): string` - Returns JSON string
- `importData(jsonData: string)` - Loads JSON data
- `resetData()` - Clears all data

**Features**:
- Automatic localStorage persistence
- Type-safe operations
- Atomic updates
- Auto-rehydration on page load

---

## 📄 Layout Components

### app/layout.tsx
- Root HTML structure
- Metadata configuration
- Global CSS import
- Base typography

### app/page.tsx
- Main application page
- Suspense boundary for `useSearchParams()`
- Deep linking logic
- URL parameter handling
- Header, subject list, main content, footer

### app/globals.css
- TailwindCSS directives
- Global styles
- Custom scrollbar
- Base element reset
- Gradient background
- Animation utilities

---

## 🎨 Styling System

### TailwindCSS Configuration
**Custom Colors**:
- `primary`: #3b82f6 (blue)
- `secondary`: #8b5cf6 (purple)
- `success`: #10b981 (green)
- `danger`: #ef4444 (red)

**Utility Classes Used**:
- **Layout**: `flex`, `grid`, `space-y`, `gap`, `p-*`, `m-*`
- **Typography**: `text-*`, `font-*`, `leading-*`
- **Colors**: `bg-*`, `text-*`, `border-*`
- **Interactions**: `hover:`, `focus:`, `active:`
- **Responsive**: `sm:`, `lg:`, `xl:`
- **Effects**: `rounded-*`, `shadow-*`, `transition-*`

---

## 🔄 Data Flow Example

### Adding a Topic
```
1. User types topic name and clicks "Add"
2. TopicChecklist calls useSyllabusStore().addTopic()
3. Zustand updates state: subjects[].modules[].topics[]
4. Store triggers localStorage save
5. ModuleCard detects state change
6. ModuleCard re-renders TopicChecklist
7. New topic appears in list
8. Progress automatically recalculates
9. ProgressCircle component animates
```

### Toggling Topic Completion
```
1. User clicks checkbox
2. TopicChecklist calls toggleTopic()
3. Topic.isCompleted flipped
4. Store persists to localStorage
5. Components re-render
6. calculateModuleProgress() called
7. calculateSubjectProgress() called
8. ProgressCircle strokeDashoffset animates
```

### Deep Linking
```
1. User clicks subject
2. setSelectedSubject(id) called
3. URL updated: ?subject=abc123
4. On page reload:
   - useSearchParams() reads URL
   - setSelectedSubject(abc123) called
   - Previous state restored
   - Exact same view rendered
```

---

## 🛠️ Development Workflow

### Adding a New Feature

**Example: Add subject color picker**

1. **Update Type**:
   ```typescript
   // lib/types.ts
   interface Subject {
     // ... existing fields
     color?: string
   }
   ```

2. **Update Store**:
   ```typescript
   // lib/store.ts
   updateSubject(subjectId, title, description, color) {
     // Update logic
   }
   ```

3. **Update Component**:
   ```typescript
   // components/SubjectList.tsx
   <div style={{ borderColor: subject.color }} >
   ```

4. **Add UI**:
   ```typescript
   // components/SubjectView.tsx
   <input type="color" value={subject.color} />
   ```

---

## ✅ Best Practices Used

1. **Component Separation**: Each component has single responsibility
2. **Prop Drilling**: Minimized with Zustand store
3. **Re-renders**: Optimized with precise state updates
4. **Accessibility**: ARIA labels, semantic HTML, keyboard support
5. **Type Safety**: Full TypeScript coverage
6. **Error Handling**: Try-catch blocks for JSON operations
7. **Performance**: Derived calculations, SVG optimization
8. **Responsiveness**: Tailwind breakpoints
9. **DRY**: Reusable ProgressCircle component
10. **Documentation**: JSDoc comments, clear naming

---

## 📊 File Size Reference

```
Component Sizes (uncompressed):
├── ProgressCircle.tsx     ~1.2 KB
├── TopicChecklist.tsx     ~3.4 KB
├── ModuleCard.tsx         ~4.8 KB
├── SubjectView.tsx        ~5.2 KB
├── SubjectList.tsx        ~3.8 KB
├── DataManager.tsx        ~4.1 KB
└── store.ts               ~6.5 KB

Total Components: ~28 KB
```

---

## 🔗 Component Tree

```
App (page.tsx)
├── Header
│   └── DataManager
├── SubjectList
│   └── [SubjectCard]
│       └── ProgressCircle
├── Main Content
│   └── SubjectView
│       ├── ProgressCircle (overall)
│       ├── [ModuleCard]
│       │   ├── ProgressCircle (module)
│       │   └── TopicChecklist
│       │       └── [Topic Item]
│       │           ├── Checkbox
│       │           ├── Label
│       │           └── [Actions]
│       └── Module Add Form
└── Footer
```

---

**All components are production-ready and fully typed!** 🚀
