# 🚀 Quick Reference & Common Tasks

## ⚡ Quick Start (30 seconds)

```bash
cd c:\Users\Admin\simple_calculator\syllabus_tracker
npm run dev
# Open http://localhost:3000
```

---

## 📖 Common Tasks

### Create a New Subject
1. Click **"+ New Subject"** button
2. Type subject name (e.g., "Mathematics")
3. Click **"Add"**
4. Click the subject card to expand

### Add a Module to Subject
1. Select a subject (card expands)
2. Scroll to bottom → Click **"+ Add Module"**
3. Type module name (e.g., "Calculus")
4. Click **"Add"**
5. Click module to expand

### Add a Topic to Module
1. Expand module (click on it)
2. Click **"+ Add Topic"** button
3. Type topic name (e.g., "Derivatives")
4. Click **"Add"**

### Mark Topic as Complete
- Click the **checkbox** next to any topic
- Progress circle updates instantly
- Checkmark shows completion visually

### Edit Topic Name
- Click on the topic name (or press Enter)
- Edit mode activates
- Type new name
- Press Enter to save, Escape to cancel

### Delete a Topic
- Hover over topic
- Click the **✕** button
- Confirm deletion

### Edit Subject or Module Name
- Click the **✎** (pencil) icon
- Edit the name in the input field
- Click **"Save"** or press Enter

### Delete Subject or Module
- Click the **✕** button
- Confirm deletion warning
- All nested content is also deleted

---

## 🔗 Deep Linking (Bookmarking)

### Save Your Progress Location
When you select a subject, the URL changes:
```
http://localhost:3000/?subject=abc123
```

**Bookmark this URL** to return to this subject later.

### Share with Others
Send them the URL and they'll see the same subject you selected.

---

## 💾 Data Management

### Export Your Data
1. Click **⚙️** (gear icon) in top-right
2. Click **"💾 Export Backup"**
3. Browser downloads: `syllabus-backup-YYYY-MM-DD.json`
4. Save this file securely

### Import Previously Saved Data
1. Click **⚙️** (gear icon)
2. Click **"📥 Import Backup"**
3. Choose option:
   - **Paste JSON**: Paste text from file
   - **Upload File**: Select previously downloaded file
4. Click **"Import"**
5. Data restored to app

### Restore from Backup
- Keep backup files in a safe location
- Use to restore if data is accidentally deleted
- Import works from any browser/device

### Reset All Data
1. Click **⚙️** (gear icon)
2. Click **"🗑️ Reset All Data"**
3. ⚠️ **Confirm** - this is irreversible
4. All subjects, modules, topics deleted

---

## ⌨️ Keyboard Shortcuts

### Navigation
- **Tab** - Move to next element
- **Shift+Tab** - Move to previous element
- **Enter** - Activate button/checkbox
- **Space** - Toggle checkbox

### Editing
- **Enter** - Save changes
- **Escape** - Cancel editing
- **Delete** - Not used (click ✕ to delete)

### Global
- **⌘+S** / **Ctrl+S** - Not needed (auto-saves)

---

## 🎯 Usage Patterns

### Pattern 1: Study Planning
```
Subject: Math
├── Module: Algebra
│   ├── Topic: Equations
│   ├── Topic: Graphs
│   └── Topic: Polynomials
├── Module: Geometry
│   ├── Topic: Triangles
│   ├── Topic: Circles
│   └── Topic: 3D Shapes
└── Module: Calculus
    ├── Topic: Limits
    ├── Topic: Derivatives
    └── Topic: Integrals
```

### Pattern 2: Course Tracking
```
Subject: Python Programming
├── Module: Fundamentals
│   ├── Topic: Variables & Types
│   ├── Topic: Operators
│   └── Topic: Control Flow
├── Module: Functions
│   ├── Topic: Function Definition
│   ├── Topic: Parameters
│   └── Topic: Return Values
└── Module: OOP
    ├── Topic: Classes
    ├── Topic: Inheritance
    └── Topic: Polymorphism
```

### Pattern 3: Certification Prep
```
Subject: AWS Solutions Architect
├── Module: EC2
│   ├── Topic: Instance Types
│   ├── Topic: Security Groups
│   └── Topic: EBS Volumes
├── Module: S3
│   ├── Topic: Buckets
│   ├── Topic: Permissions
│   └── Topic: Versioning
└── Module: RDS
    ├── Topic: Database Engines
    ├── Topic: Backup & Recovery
    └── Topic: Multi-AZ Deployment
```

---

## 🎨 UI Elements Guide

### Header Area
```
📚 Syllabus Tracker
Track your study progress across subjects, modules, and topics
                                                              ⚙️ Settings
```

### Subjects Bar
```
Subjects              + New Subject
┌─────────────┬──────────────┬──────────────┐
│ Math 50%    │ Science 100% │ History 0%   │
│ 5/10 topics │ 8/8 topics   │ 0/12 topics  │
└─────────────┴──────────────┴──────────────┘
```

### Module Card (Collapsed)
```
┌────────────────────────────────────────────┐
│ Calculus                    75%             │
│ 3/4 topics                                  │
│ [Edit] [Delete]                      [▶]   │
└────────────────────────────────────────────┘
```

### Module Card (Expanded)
```
┌────────────────────────────────────────────┐
│ Calculus                    75%             │
│ 3/4 topics                                  │
│ [Edit] [Delete]                      [▼]   │
├────────────────────────────────────────────┤
│ ☑ Derivatives      [✎] [✕]                │
│ ☑ Integrals        [✎] [✕]                │
│ ☑ Limits           [✎] [✕]                │
│ ☐ Series           [✎] [✕]                │
├────────────────────────────────────────────┤
│                + Add Topic                  │
└────────────────────────────────────────────┘
```

---

## 🔍 Progress Indicators

### Circle Colors
- **Blue** (#3b82f6) - In progress (0-99%)
- **Green** (#10b981) - Complete (100%)
- **Purple** (#8b5cf6) - Overall progress

### Progress Examples
```
25% Completion      50% Completion      100% Completion
    ◐◯◯◯◯              ◔◔◔◯◯              ◕◕◕◕◕
```

---

## 💡 Tips & Tricks

### Tip 1: Organized Structure
Create a logical hierarchy for better tracking:
```
Subject
├── Module 1 (Basics)
├── Module 2 (Intermediate)
└── Module 3 (Advanced)
```

### Tip 2: Use Descriptive Names
❌ "Topic1", "Module A"
✅ "Understanding Variables", "Introduction to Functions"

### Tip 3: Regular Updates
Check off topics as you complete them:
- Updates progress instantly
- Visual satisfaction
- Stay motivated

### Tip 4: Export Regularly
Export backup regularly to protect your data:
- Monthly backup
- After major additions
- Before system updates

### Tip 5: Share Progress
Use deep linking to share with study partners:
1. Get URL with subject
2. Send link to classmates
3. They see exact progress
4. Discuss specific topics

### Tip 6: Mobile Friendly
Access from any device:
- Mobile: All features work
- Tablet: Full layout
- Desktop: Optimal experience

---

## ❓ Frequently Asked Questions

### Q: Where is my data stored?
**A:** Locally in your browser's LocalStorage. Not on any server.

### Q: Will my data be lost if I clear browser cache?
**A:** Yes. Always keep an export backup!

### Q: Can I sync across devices?
**A:** Export on one device, import on another.

### Q: What browsers are supported?
**A:** Chrome, Firefox, Safari, Edge 90+

### Q: Is there a limit on how many subjects/modules/topics?
**A:** No hard limit, but recommend < 1000 topics for performance.

### Q: Can I undo a deletion?
**A:** Not directly. Use your backup file to restore.

### Q: Does it work offline?
**A:** Yes! Completely offline-first.

### Q: Can I modify the JSON backup file?
**A:** Yes, but be careful. Keep the structure intact.

### Q: Is my data encrypted?
**A:** Data is stored in plain text in LocalStorage.

### Q: Can multiple people use the same browser?
**A:** Yes, they'll share the same data (only one user per browser).

---

## 🐛 Troubleshooting

### Problem: Page shows "Loading..." forever
**Solution:**
1. Refresh page (Ctrl+R)
2. Clear browser cache
3. Try different browser

### Problem: Data disappeared after refresh
**Solution:**
1. Check if browser allows LocalStorage
2. Not in private/incognito mode?
3. Try importing from backup
4. Data may have been reset

### Problem: Can't type in inputs
**Solution:**
1. Make sure you clicked on the input
2. Try clicking directly on the text field
3. Try different browser

### Problem: Progress circle not updating
**Solution:**
1. Refresh page
2. Check if checkbox is actually checked
3. Open browser console (F12) for errors
4. Try different browser

### Problem: Export file won't download
**Solution:**
1. Check browser download settings
2. Allow downloads from localhost
3. Try different browser
4. Check browser console for errors

### Problem: Import shows "Invalid JSON"
**Solution:**
1. Make sure you copied ENTIRE file content
2. File should start with `{` and end with `}`
3. Check for extra characters or truncation
4. Try re-exporting and importing from backup

---

## 📱 Device-Specific Tips

### Desktop Browser
- Full width layout
- Mouse and keyboard shortcuts work
- Larger progress circles
- Better for data management

### Tablet
- Touch-friendly buttons
- Responsive grid layout
- Landscape: More visible items
- Portrait: Vertical scrolling

### Mobile Phone
- Single-column layout
- Large touch targets
- Vertical scrolling focus
- Landscape for better view

---

## 🎓 Study Tips Using Syllabus Tracker

### Technique 1: Spaced Repetition
1. Break topics into smaller units
2. Review periodically
3. Track completion over time
4. Export data to analyze progress

### Technique 2: Progressive Breakdown
1. Start with high-level modules
2. Break into detailed topics
3. Add sub-topics as needed
4. Check off incrementally

### Technique 3: Time-Based Tracking
1. Add topic per study session
2. Check off when completed
3. Export weekly for progress review
4. Identify slower topics

### Technique 4: Collaborative Learning
1. Export your syllabus
2. Share with study group
3. Everyone imports and tracks
4. Share progress via deep links

---

## 🎯 Best Practices

✅ **DO:**
- Create logical hierarchies
- Use clear, descriptive names
- Update progress regularly
- Export backups frequently
- Check data across devices
- Share via deep links

❌ **DON'T:**
- Create too many levels (keeps simple)
- Leave vague names ("Topic 1")
- Forget to back up data
- Rely on single copy
- Use only one browser
- Delete without confirming

---

## 🔧 Advanced: Modifying JSON

### Export Format
```json
{
  "subjects": [
    {
      "id": "timestamp-random",
      "title": "Subject Name",
      "description": "Optional description",
      "modules": [
        {
          "id": "timestamp-random",
          "name": "Module Name",
          "topics": [
            {
              "id": "timestamp-random",
              "name": "Topic Name",
              "isCompleted": false
            }
          ]
        }
      ],
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "exportedAt": "2024-05-29T12:34:56.789Z"
}
```

### Safe Modifications
- Change `title` and `name` values
- Change `isCompleted` (true/false)
- Change `description`
- Keep IDs unchanged
- Preserve structure exactly

---

## 📊 Data Analysis from Exports

### Use JSON data to:
1. Track progress over time
2. Identify patterns
3. Calculate completion velocity
4. Plan study schedule
5. Share statistics

Example: Compare exports from different dates to see progress.

---

**That's everything you need to know!** Happy studying! 📚✨
