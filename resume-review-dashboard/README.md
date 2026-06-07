# CVForge | Resume Review Dashboard with ATS Analysis & Career Readiness Tracking

An offline-first, client-side utility dashboard designed to optimize developer resumes for applicant tracking systems (ATS), identify technical/soft skill gaps, and track career milestones.

## Core Features

- **Simulated ATS Scanner**:
  - Compares raw resume copy with target job description requirements.
  - Computes formatting rules (e.g., checks paragraph sizes, contacts info headers, missing sections checks).
  - Highlights matched keywords vs. missing skills to help you optimize density.
- **Dynamic Stats Metric Cards**:
  - Displays overall ATS score (0-100), formatting score (%), keyword match rate (%), and career readiness score (%).
- **Career Readiness Checklist**:
  - Weights career actions (e.g. portfolio site creation, LinkedIn profile optimizations, practice interviews) and updates career readiness progress dynamically.
- **Analytics Charts**:
  - Radar Chart: Keyword coverage mapped by category (Frontend, Backend, DevOps, Soft Skills).
  - Doughnut Chart: Resume layout content ratio approximation.
  - Line Graph: Optimization timeline history tracking scores over time.
- **Local Storage & Backups**:
  - Persists profiles, readiness checklists, and scan logs locally.
  - JSON imports/exports for database backups.
- **Theme switchers**: dark mode default with light mode toggle support.

## Technical Details

- **Core Stack**: HTML5, CSS3, JavaScript (ES6+).
- **Libraries**:
  - **Chart.js**: Visual data rendering.
  - **Lucide Icons**: Crispy vector icons.
  - **Google Fonts**: Outfit & Plus Jakarta Sans typography.

## Directory Structure

```
resume-review-dashboard/
├── index.html   # Main layout shell, form terminals, checklists, and modals
├── style.css    # Responsive variables, score gauges, check alerts, and layout blocks
├── app.js       # Core scanner engine, charts renderer, and import/export backup
└── README.md    # Product documentation and setup guides
```

## Setup Instructions

1. Simply double-click `index.html` to run in any web browser.
2. Alternatively, spin up a local server in the project folder:
   ```bash
   npx http-server -p 8002
   ```
   and navigate to `http://localhost:8002/resume-review-dashboard/`.
