# Internship Application Tracker with Application Management & Progress Analytics

An interactive, premium placement dashboard that helps students and job seekers manage their internship logs, monitor interview checklists, track progress analytics, and visualize funnel statistics in one centralized space.

## Features

- **Interactive Kanban Board**: Dynamic board columns mapped to application stages (*Wishlist*, *Applied*, *Interviewing*, *Offered*, *Rejected*) supporting HTML5 drag-and-drop card movement.
- **Key Metrics Dashboard**: Instant metrics computation for total active applications, interview conversion rates, offers secured, and overall success percentage.
- **Performance Analytics**: Graphical visualization supporting toggleable views for the application stage distribution (Doughnut chart) and monthly application timelines (Bar chart) powered by ChartJS.
- **Interview Preparation Checklists**: Custom checklist trackers nested under individual applications, allowing candidates to log interview milestones and preparatory tasks.
- **JSON Backup Configuration**: Import and export feature enabling backup, restore, and transfer of local configuration logs.
- **Advanced Searching & Filters**: Direct query matching on company/role fields, plus filtering options by stipend ranges and location models (remote, hybrid, on-site).

## Technology Stack

- **Structure**: Semantic HTML5 markup
- **Styling**: Modern CSS3 using dynamic HSL gradients, blur-backdrop overlays, and layout flex grids
- **Logic**: Client-side JavaScript (ES6+) utilizing LocalStorage for offline synchronization
- **Libraries**:
  - [Lucide Icons](https://github.com/lucide-icons/lucide) for visual iconography
  - [ChartJS](https://www.chartjs.org/) for analytics charts

## Folder Structure

```
internship-application-tracker/
├── index.html   # Main dashboard layout
├── style.css    # Colors, layouts, and responsive overrides
├── app.js       # Core application logic, metrics, and state sync
└── README.md    # Documentation and user manual
```

## Setup & Running

1. Clone or download the repository workspace.
2. Navigate to `/internship-application-tracker/`.
3. Open `index.html` directly in any web browser or serve it via a local web server (e.g. `npx serve` or Live Server extension).
