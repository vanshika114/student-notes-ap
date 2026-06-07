// ==========================================================================
// Pre-populated Target Job Description & Resume Templates for Mock Scans
// ==========================================================================
const mockJobDescription = `Frontend Engineer (React)
Requirements:
- Strong experience with JavaScript (ES6+), React, and Redux/Context API.
- Proficiency in CSS3, HTML5, TailwindCSS, and responsive web design.
- Experience with TypeScript, Webpack, Git, and automated testing (Jest/Cypress).
- Knowledge of RESTful APIs, performance optimization, and SEO best practices.
- Excellent communication, collaboration, and agile team environment experience.`;

const mockResume = `Vishwa Mistry
vishwa@example.com | https://linkedin.com/in/vishwagram
Frontend Developer

Professional Summary:
Passionate Frontend Developer with 2+ years of experience building beautiful, responsive, and user-centric web applications using modern technologies.

Technical Skills:
- Languages: JavaScript, HTML5, CSS3, SQL
- Frameworks & Libraries: React, Redux, TailwindCSS, Bootstrap
- Tools & Workflows: Git, Webpack, RESTful APIs, Agile, Scrum

Work Experience:
Frontend Engineer | Tech Solutions (2024 - Present)
- Developed and maintained responsive web applications using React and TailwindCSS.
- Improved application performance by 25% by refactoring legacy component structures and optimizing images.
- Collaborated with product teams to design UX/UI prototypes and wireframes.
- Integrated RESTful APIs to feed user dashboard interfaces.

Education:
Bachelor of Science in Computer Science | State University (2021 - 2024)`;

const defaultProfile = {
  name: "Vishwa Mistry",
  bio: "Target: Frontend Developer",
  avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=cvforge"
};

const defaultChecklist = [
  { id: "readiness-1", text: "Create portfolio website", weight: 25, checked: false },
  { id: "readiness-2", text: "Optimize LinkedIn profile", weight: 20, checked: true },
  { id: "readiness-3", text: "Build 3 complex projects", weight: 25, checked: false },
  { id: "readiness-4", text: "Draft universal cover letter", weight: 15, checked: false },
  { id: "readiness-5", text: "Practice 10 mock interview questions", weight: 15, checked: true }
];

const mockLogs = [
  {
    id: "log-1",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    role: "Frontend Web Developer",
    score: 65,
    matchRate: 58,
    formatScore: 80,
    matchedCount: 7,
    missingCount: 5
  },
  {
    id: "log-2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    role: "React Engineer",
    score: 78,
    matchRate: 72,
    formatScore: 90,
    matchedCount: 9,
    missingCount: 3
  }
];

let appState = {
  profile: { ...defaultProfile },
  checklist: [...defaultChecklist],
  logs: [...mockLogs],
  lastScan: {
    atsScore: 0,
    formatScore: 0,
    matchRate: 0,
    matchedKeywords: [],
    missingKeywords: [],
    formattingAlerts: []
  }
};

// Global Chart variables
let activeChartType = "categories"; // categories, ratios, history
let chartInstance = null;

// Industry keywords definitions mapped to category checks
const keywordLibrary = {
  frontend: ["javascript", "react", "html5", "css3", "tailwindcss", "typescript", "webpack", "redux", "bootstrap", "vue", "angular"],
  backend: ["node.js", "express", "sql", "restful", "api", "database", "mongodb", "python", "django", "java"],
  devops: ["git", "github", "docker", "ci/cd", "aws", "deploy", "seo"],
  softskills: ["communication", "collaboration", "agile", "scrum", "leadership", "mentoring"]
};

// ==========================================================================
// App Loading and Startups
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadAppData();
  bindEventHandlers();

  // Renders
  renderProfile();
  renderReadinessChecklist();
  renderSummaryStats();
  renderScannerInputs();
  renderScanFeedback();
  renderHistoryLogs();
  initAnalyticsChart();

  lucide.createIcons();
});

function loadAppData() {
  const saved = localStorage.getItem("cvforge_state_v1");
  if (saved) {
    try {
      appState = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading CVForge app state.", e);
    }
  }

  const savedTheme = localStorage.getItem("cvforge_theme_v1");
  if (savedTheme) {
    document.body.className = savedTheme;
  }
}

function saveAppData() {
  localStorage.setItem("cvforge_state_v1", JSON.stringify(appState));
}

function bindEventHandlers() {
  // Theme Toggle switch
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light-theme" : "dark-theme";
    document.body.className = newTheme;
    localStorage.setItem("cvforge_theme_v1", newTheme);
    drawCharts();
  });

  // Mobile sidebar menu toggles
  document.getElementById("sidebar-toggle-open").addEventListener("click", () => {
    document.getElementById("app-sidebar").classList.add("active");
  });
  document.getElementById("sidebar-toggle-close").addEventListener("click", () => {
    document.getElementById("app-sidebar").classList.remove("active");
  });

  // Profile modal settings
  document.getElementById("edit-profile-btn").addEventListener("click", openProfileModal);
  document.getElementById("profile-modal-close").addEventListener("click", closeProfileModal);
  document.getElementById("profile-modal-cancel").addEventListener("click", closeProfileModal);
  document.getElementById("profile-form").addEventListener("submit", handleProfileSave);

  // ATS Scanner form analyze trigger
  document.getElementById("ats-scan-form").addEventListener("submit", handleATSScan);

  // Chart toggles switches
  document.getElementById("btn-chart-categories").addEventListener("click", () => switchChart("categories"));
  document.getElementById("btn-chart-ratios").addEventListener("click", () => switchChart("ratios"));
  document.getElementById("btn-chart-history").addEventListener("click", () => switchChart("history"));

  // Reset database actions
  document.getElementById("reset-btn").addEventListener("click", resetDatabase);

  // Backup configuration file controls
  document.getElementById("export-btn").addEventListener("click", exportDatabaseJSON);
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", importDatabaseJSON);
}

// ==========================================================================
// Profile Management
// ==========================================================================
function renderProfile() {
  document.getElementById("profile-name").textContent = appState.profile.name || "Developer";
  document.getElementById("profile-bio").textContent = appState.profile.bio || "Target career role details...";
  document.getElementById("profile-avatar").src = appState.profile.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=cvforge";
}

function openProfileModal() {
  document.getElementById("form-profile-name").value = appState.profile.name || "";
  document.getElementById("form-profile-bio").value = appState.profile.bio || "";
  document.getElementById("form-profile-avatar").value = appState.profile.avatar || "";
  document.getElementById("profile-modal").style.display = "flex";
}

function closeProfileModal() {
  document.getElementById("profile-modal").style.display = "none";
}

function handleProfileSave(e) {
  e.preventDefault();
  appState.profile.name = document.getElementById("form-profile-name").value.trim();
  appState.profile.bio = document.getElementById("form-profile-bio").value.trim();
  appState.profile.avatar = document.getElementById("form-profile-avatar").value.trim();

  saveAppData();
  renderProfile();
  closeProfileModal();
}

// ==========================================================================
// Career Readiness checklist
// ==========================================================================
function renderReadinessChecklist() {
  const container = document.getElementById("readiness-checklist-container");
  container.innerHTML = "";

  let securedWeight = 0;
  appState.checklist.forEach(item => {
    if (item.checked) securedWeight += item.weight;

    const row = document.createElement("label");
    row.className = `readiness-item ${item.checked ? 'checked' : ''}`;
    row.innerHTML = `
      <input type="checkbox" ${item.checked ? 'checked' : ''} onclick="toggleReadinessItem('${item.id}')">
      <span>${item.text}</span>
    `;
    container.appendChild(row);
  });

  // Render readiness progress metrics
  document.getElementById("readiness-percent-text").textContent = `${securedWeight}%`;
  document.getElementById("readiness-progress-bar").style.width = `${securedWeight}%`;

  // Sync to main metrics card
  document.getElementById("stat-readiness-score").textContent = `${securedWeight}%`;
}

window.toggleReadinessItem = function(id) {
  const item = appState.checklist.find(i => i.id === id);
  if (item) {
    item.checked = !item.checked;
    saveAppData();
    renderReadinessChecklist();
    renderSummaryStats();
  }
};

// ==========================================================================
// Dashboard mathematical stats calculators
// ==========================================================================
function renderSummaryStats() {
  const last = appState.lastScan;

  // Render ATS overall score and apply color indicator class
  const scoreCard = document.querySelector(".score-card");
  scoreCard.classList.remove("score-poor", "score-average", "score-good");

  if (last.atsScore > 0) {
    document.getElementById("stat-ats-score").textContent = last.atsScore;
    document.getElementById("stat-format-score").textContent = `${last.formatScore}%`;
    document.getElementById("stat-match-rate").textContent = `${last.matchRate}%`;

    // Visual classification thresholds
    if (last.atsScore >= 75) {
      scoreCard.classList.add("score-good");
      document.getElementById("stat-ats-grade").textContent = "Highly Optimized for ATS! 🚀";
    } else if (last.atsScore >= 50) {
      scoreCard.classList.add("score-average");
      document.getElementById("stat-ats-grade").textContent = "Average match. Optimize keywords.";
    } else {
      scoreCard.classList.add("score-poor");
      document.getElementById("stat-ats-grade").textContent = "Needs improvements! Check formatting.";
    }
  } else {
    document.getElementById("stat-ats-score").textContent = "0";
    document.getElementById("stat-format-score").textContent = "0%";
    document.getElementById("stat-match-rate").textContent = "0%";
    document.getElementById("stat-ats-grade").textContent = "Analyze resume to start";
  }
}

// ==========================================================================
// ATS Parser Scanner simulation algorithms
// ==========================================================================
function renderScannerInputs() {
  document.getElementById("input-job-desc").value = mockJobDescription;
  document.getElementById("input-resume-text").value = mockResume;
}

function handleATSScan(e) {
  e.preventDefault();
  
  const jobText = document.getElementById("input-job-desc").value.toLowerCase();
  const resumeText = document.getElementById("input-resume-text").value.toLowerCase();

  const matchedKeywords = [];
  const missingKeywords = [];
  const formattingAlerts = [];

  // 1. Keyword Extraction & Matching logic:
  // Flatten libraries lists to search
  const flatKeywords = [...new Set(Object.values(keywordLibrary).flat())];
  
  // Find which library keywords are requested in target job description
  const targetKeywords = flatKeywords.filter(k => jobText.includes(k));

  if (targetKeywords.length === 0) {
    // Fallback: If no library keywords found, parse raw words of length > 3
    const words = jobText.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(w => w.length > 4);
    const uniqueWords = [...new Set(words)];
    uniqueWords.slice(0, 15).forEach(word => targetKeywords.push(word));
  }

  // Scan resume for target keyword matches
  targetKeywords.forEach(k => {
    if (resumeText.includes(k)) {
      matchedKeywords.push(k);
    } else {
      missingKeywords.push(k);
    }
  });

  const matchRate = targetKeywords.length === 0 ? 0 : Math.round((matchedKeywords.length / targetKeywords.length) * 100);

  // 2. Formatting & Structure checks
  let formatPoints = 100;

  // Rule 1: Email detection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(resumeText)) {
    formattingAlerts.push({ type: "success", title: "Contact Information", desc: "Valid email address formatting identified." });
  } else {
    formatPoints -= 20;
    formattingAlerts.push({ type: "danger", title: "Contact Information Missing", desc: "No email address found. Add a contact information header." });
  }

  // Rule 2: Resume Length / density
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount > 600) {
    formatPoints -= 15;
    formattingAlerts.push({ type: "warning", title: "Resume Word Count Density", desc: "Resume contains over 600 words. Keep layout concise." });
  } else if (wordCount > 100) {
    formattingAlerts.push({ type: "success", title: "Resume Word Count Density", desc: "Standard word length count matches single page templates." });
  } else {
    formatPoints -= 30;
    formattingAlerts.push({ type: "danger", title: "Resume Content Too Short", desc: "Resume text is too brief. Expand skills, experience, and educational details." });
  }

  // Rule 3: Key Sections Presence (Experience, Education, Skills)
  const sections = ["experience", "education", "skills"];
  sections.forEach(sec => {
    if (resumeText.includes(sec)) {
      formattingAlerts.push({ type: "success", title: `Section present: ${sec.toUpperCase()}`, desc: `Structure parser identified section header cleanly.` });
    } else {
      formatPoints -= 15;
      formattingAlerts.push({ type: "warning", title: `Section Missing: ${sec.toUpperCase()}`, desc: `Ensure you have a section labeled '${sec.toUpperCase()}' for parser readability.` });
    }
  });

  const formatScore = Math.max(0, formatPoints);

  // Compute Overall ATS Score
  const atsScore = Math.round((matchRate * 0.6) + (formatScore * 0.4));

  // Update State
  appState.lastScan = {
    atsScore,
    formatScore,
    matchRate,
    matchedKeywords,
    missingKeywords,
    formattingAlerts
  };

  // Add scan to optimizations history log
  const newLog = {
    id: "log-" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    role: appState.profile.bio.replace("Target: ", "") || "Frontend Developer",
    score: atsScore,
    matchRate,
    formatScore,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length
  };
  appState.logs.unshift(newLog);

  saveAppData();
  renderSummaryStats();
  renderScanFeedback();
  renderHistoryLogs();
  updateCharts();

  // Show results view
  document.getElementById("analysis-results-section").style.display = "grid";
  document.getElementById("scan-time-label").textContent = `Last scan: ${new Date().toLocaleTimeString()}`;
  
  // Smooth scroll
  document.getElementById("analysis-results-section").scrollIntoView({ behavior: 'smooth' });
}

function renderScanFeedback() {
  const last = appState.lastScan;

  // 1. Matched Keywords Pills
  const matchedContainer = document.getElementById("matched-keywords-container");
  matchedContainer.innerHTML = "";
  if (last.matchedKeywords && last.matchedKeywords.length > 0) {
    last.matchedKeywords.forEach(k => {
      matchedContainer.innerHTML += `<span class="keyword-pill matched">${k}</span>`;
    });
  } else {
    matchedContainer.innerHTML = `<span class="empty-keywords-label">No keywords matched yet. Optimize content!</span>`;
  }

  // 2. Missing Keywords Pills
  const missingContainer = document.getElementById("missing-keywords-container");
  missingContainer.innerHTML = "";
  if (last.missingKeywords && last.missingKeywords.length > 0) {
    last.missingKeywords.forEach(k => {
      missingContainer.innerHTML += `<span class="keyword-pill missing">${k}</span>`;
    });
  } else {
    missingContainer.innerHTML = `<span class="empty-keywords-label">No missing keywords found. Great job!</span>`;
  }

  // 3. Formatting Checks alerts list
  const checksContainer = document.getElementById("formatting-checks-container");
  checksContainer.innerHTML = "";
  if (last.formattingAlerts && last.formattingAlerts.length > 0) {
    last.formattingAlerts.forEach(c => {
      const row = document.createElement("div");
      row.className = `check-row-item ${c.type}`;
      
      let icon = "check-circle";
      if (c.type === "warning") icon = "alert-triangle";
      else if (c.type === "danger") icon = "x-circle";

      row.innerHTML = `
        <i data-lucide="${icon}"></i>
        <div class="check-row-content">
          <h4>${c.title}</h4>
          <p>${c.desc}</p>
        </div>
      `;
      checksContainer.appendChild(row);
    });
  } else {
    checksContainer.innerHTML = `<div class="empty-deadline-state">No formatting results. Run scan first!</div>`;
  }

  lucide.createIcons();
}

// ==========================================================================
// Optimization History Lists Rendering
// ==========================================================================
function renderHistoryLogs() {
  const container = document.getElementById("history-logs-container");
  container.innerHTML = "";

  if (appState.logs.length === 0) {
    container.innerHTML = `<p class="empty-history-p">No optimizations scans found in history.</p>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "history-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date Scanned</th>
        <th>Target Role</th>
        <th>Keywords Matched</th>
        <th>Match Rate</th>
        <th>Format Score</th>
        <th>ATS Score</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="history-rows-tbody">
    </tbody>
  `;
  container.appendChild(table);

  const tbody = document.getElementById("history-rows-tbody");
  appState.logs.forEach(log => {
    const row = document.createElement("tr");
    
    let scoreClass = "poor";
    if (log.score >= 75) scoreClass = "good";
    else if (log.score >= 50) scoreClass = "average";

    row.innerHTML = `
      <td>${log.date}</td>
      <td>${log.role}</td>
      <td><span class="text-success">${log.matchedCount}</span> / <span class="text-danger">${log.missingCount} missing</span></td>
      <td>${log.matchRate}%</td>
      <td>${log.formatScore}%</td>
      <td><span class="history-score-badge ${scoreClass}">${log.score} / 100</span></td>
      <td>
        <button class="btn-history-del" onclick="deleteHistoryScan('${log.id}')" title="Delete Log">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  lucide.createIcons();
}

window.deleteHistoryScan = function(id) {
  if (confirm("Are you sure you want to delete this scan from history?")) {
    appState.logs = appState.logs.filter(l => l.id !== id);
    saveAppData();
    renderHistoryLogs();
    updateCharts();
  }
};

// ==========================================================================
// ChartJS Implementations
// ==========================================================================
function initAnalyticsChart() {
  drawCharts();
}

function switchChart(type) {
  activeChartType = type;
  document.getElementById("btn-chart-categories").classList.remove("active");
  document.getElementById("btn-chart-ratios").classList.remove("active");
  document.getElementById("btn-chart-history").classList.remove("active");

  document.getElementById(`btn-chart-${type}`).classList.add("active");
  drawCharts();
}

function updateCharts() {
  drawCharts();
}

function drawCharts() {
  const canvas = document.getElementById("resumeChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isLight = document.body.classList.contains("light-theme");
  const labelColor = isLight ? "#57606a" : "#8b949e";
  const gridColor = isLight ? "rgba(9, 105, 218, 0.08)" : "rgba(88, 166, 255, 0.08)";

  if (activeChartType === "categories") {
    // Categories Match Radar Chart
    const resumeText = document.getElementById("input-resume-text").value.toLowerCase();
    
    // Calculate category match densities
    const catScores = [];
    const catLabels = [];

    Object.entries(keywordLibrary).forEach(([cat, list]) => {
      const parsedCatMatches = list.filter(k => resumeText.includes(k)).length;
      catScores.push(parsedCatMatches);
      catLabels.push(cat.charAt(0).toUpperCase() + cat.slice(1));
    });

    chartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: catLabels,
        datasets: [{
          label: "Keywords Present",
          data: catScores,
          backgroundColor: "rgba(88, 166, 255, 0.2)",
          borderColor: "#58a6ff",
          borderWidth: 2,
          pointBackgroundColor: "#58a6ff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: { color: labelColor, font: { family: "Outfit", size: 11 } },
            ticks: { display: false, backdropColor: "transparent" }
          }
        }
      }
    });
  } else if (activeChartType === "ratios") {
    // Text structuring layout doughnut chart
    const resumeText = document.getElementById("input-resume-text").value.toLowerCase();
    
    // Measure string sizes for structures approximation
    const getLength = (term) => {
      const idx = resumeText.indexOf(term);
      return idx === -1 ? 50 : Math.max(10, idx);
    };

    const expLength = getLength("experience");
    const skillLength = getLength("skills");
    const eduLength = getLength("education");

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Experience Ratio", "Skills Ratio", "Education Ratio"],
        datasets: [{
          data: [expLength, skillLength, eduLength],
          backgroundColor: ["#388bfd", "#2ea44f", "#a371f7"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { color: labelColor, font: { family: "Outfit" } }
          }
        }
      }
    });
  } else {
    // History scans optimizations progressions
    const sortedScans = [...appState.logs].reverse();
    const dates = sortedScans.map(l => l.date);
    const scores = sortedScans.map(l => l.score);

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates.map(d => {
          const parts = d.split("-");
          return `${parts[1]}/${parts[2]}`; // MM/DD
        }),
        datasets: [{
          data: scores,
          borderColor: "#2ea44f",
          backgroundColor: "rgba(46, 164, 79, 0.1)",
          borderWidth: 2.5,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: labelColor }, grid: { display: false } },
          y: { ticks: { color: labelColor, stepSize: 10 }, grid: { color: gridColor } }
        }
      }
    });
  }
}

// ==========================================================================
// Backup System and Data Sync Reset Operations
// ==========================================================================
function exportDatabaseJSON() {
  const data = JSON.stringify(appState, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(data);
  const exportFileDefaultName = 'cvforge_resume_backup.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importDatabaseJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.profile && parsed.logs && Array.isArray(parsed.logs)) {
        appState = parsed;
        saveAppData();
        renderProfile();
        renderReadinessChecklist();
        renderSummaryStats();
        renderScanFeedback();
        renderHistoryLogs();
        drawCharts();
        alert("JSON Backup loaded successfully!");
      } else {
        alert("Invalid backup configuration layout.");
      }
    } catch (err) {
      alert("Error parsing backup JSON file.");
    }
  };
  reader.readAsText(file);
}

function resetDatabase() {
  if (confirm("Restore default resume templates and wipe current logs?")) {
    appState = {
      profile: { ...defaultProfile },
      checklist: [...defaultChecklist],
      logs: [...mockLogs],
      lastScan: {
        atsScore: 0,
        formatScore: 0,
        matchRate: 0,
        matchedKeywords: [],
        missingKeywords: [],
        formattingAlerts: []
      }
    };
    saveAppData();
    renderProfile();
    renderReadinessChecklist();
    renderSummaryStats();
    renderScanFeedback();
    renderHistoryLogs();
    drawCharts();
    alert("Database successfully reset.");
  }
}
