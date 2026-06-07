// ==========================================================================
// Pre-populated Mock Data for Open Source Contribution Tracker
// ==========================================================================
const mockRepos = [
  "karthik2004-tech/student-notes-app",
  "facebook/react",
  "vercel/next.js",
  "tailwindlabs/tailwindcss"
];

const mockLogs = [
  {
    id: "log-1",
    title: "Fix responsive layout shift on dashboard sidebar",
    type: "Pull Request",
    status: "Merged",
    repo: "karthik2004-tech/student-notes-app",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago
    url: "https://github.com/karthik2004-tech/student-notes-app/pull/881",
    desc: "Adjusted flex basis bounds and added custom touch media queries for smaller viewport widths."
  },
  {
    id: "log-2",
    title: "Pomo-timer countdown freeze during tab switching",
    type: "Issue",
    status: "Closed",
    repo: "karthik2004-tech/student-notes-app",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days ago
    url: "https://github.com/karthik2004-tech/student-notes-app/issues/879",
    desc: "Timer intervals lag behind when background tabs sleep. Suggested using web workers."
  },
  {
    id: "log-3",
    title: "Implement visual achievement badge grid component",
    type: "Commit",
    status: "Merged",
    repo: "karthik2004-tech/student-notes-app",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 day ago
    url: "8ba2c4d",
    desc: "Created basic achievements card element, styling layouts, and loaded unlock check criteria."
  },
  {
    id: "log-4",
    title: "Update README guides with setup troubleshooting",
    type: "Commit",
    status: "Merged",
    repo: "facebook/react",
    date: new Date().toISOString().split("T")[0], // Today
    url: "c5d1e2f",
    desc: "Documented node versions dependencies constraints."
  }
];

const defaultProfile = {
  name: "Vishwa Mistry",
  bio: "Open Source Contributor & Dev",
  avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
};

let appState = {
  profile: { ...defaultProfile },
  repos: [...mockRepos],
  logs: [...mockLogs],
  goalTarget: 10,
  streak: 3,
  lastContributionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // yesterday
};

// Global References
let chartInstance = null;
let activeChartType = "types"; // types, timeline

// ==========================================================================
// App Loading and Bindings
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadAppData();
  bindEventHandlers();
  
  // Initial renders
  renderProfile();
  renderTrackedRepos();
  renderContributionLogs();
  renderGoalWidget();
  renderContributionCalendar();
  calculateDashboardMetrics();
  initAnalyticsChart();

  lucide.createIcons();
});

function loadAppData() {
  const saved = localStorage.getItem("octotracker_state_v1");
  if (saved) {
    try {
      appState = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading application state.", e);
    }
  }

  const savedTheme = localStorage.getItem("octotracker_theme_v1");
  if (savedTheme) {
    document.body.className = savedTheme;
  }
}

function saveAppData() {
  localStorage.setItem("octotracker_state_v1", JSON.stringify(appState));
}

function bindEventHandlers() {
  // Theme Switcher
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light-theme" : "dark-theme";
    document.body.className = newTheme;
    localStorage.setItem("octotracker_theme_v1", newTheme);
    drawCharts();
  });

  // Mobile sidebar menu toggles
  document.getElementById("sidebar-toggle-open").addEventListener("click", () => {
    document.getElementById("app-sidebar").classList.add("active");
  });
  document.getElementById("sidebar-toggle-close").addEventListener("click", () => {
    document.getElementById("app-sidebar").classList.remove("active");
  });

  // Edit profile modal actions
  document.getElementById("edit-profile-btn").addEventListener("click", openProfileModal);
  document.getElementById("profile-modal-close").addEventListener("click", closeProfileModal);
  document.getElementById("profile-modal-cancel").addEventListener("click", closeProfileModal);
  document.getElementById("profile-form").addEventListener("submit", handleProfileSave);

  // Tracked Repos add boxes
  document.getElementById("add-repo-btn").addEventListener("click", toggleAddRepoBox);
  document.getElementById("save-repo-btn").addEventListener("click", handleAddRepo);

  // Log Contribution Modals
  document.getElementById("add-contribution-btn").addEventListener("click", () => openContributionModal());
  document.getElementById("modal-close-btn").addEventListener("click", closeContributionModal);
  document.getElementById("modal-cancel-btn").addEventListener("click", closeContributionModal);
  document.getElementById("contribution-form").addEventListener("submit", handleContributionSubmit);

  // Quick Goal Target editors
  document.getElementById("edit-goal-btn").addEventListener("click", () => {
    document.getElementById("goal-target-input").value = appState.goalTarget;
    document.getElementById("inline-goal-form").style.display = "flex";
  });
  document.getElementById("save-goal-btn").addEventListener("click", () => {
    const targetVal = parseInt(document.getElementById("goal-target-input").value);
    if (targetVal > 0) {
      appState.goalTarget = targetVal;
      saveAppData();
      renderGoalWidget();
      calculateDashboardMetrics();
    }
    document.getElementById("inline-goal-form").style.display = "none";
  });

  // Search & Filter event bindings
  document.getElementById("log-search").addEventListener("input", renderContributionLogs);
  document.getElementById("filter-type").addEventListener("change", renderContributionLogs);
  document.getElementById("filter-status").addEventListener("change", renderContributionLogs);
  document.getElementById("filter-repo").addEventListener("change", renderContributionLogs);

  // Chart switches
  document.getElementById("btn-chart-types").addEventListener("click", () => switchChart("types"));
  document.getElementById("btn-chart-timeline").addEventListener("click", () => switchChart("timeline"));

  // Reset database actions
  document.getElementById("reset-btn").addEventListener("click", resetDatabase);

  // JSON configuration imports / exports
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
  document.getElementById("profile-name").textContent = appState.profile.name || "Username";
  document.getElementById("profile-bio").textContent = appState.profile.bio || "Bio summary details...";
  document.getElementById("profile-avatar").src = appState.profile.avatar || "https://avatars.githubusercontent.com/u/9919?v=4";
  updateStreakDisplay();
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

function updateStreakDisplay() {
  document.getElementById("streak-counter").textContent = `${appState.streak} Day${appState.streak === 1 ? '' : 's'}`;
}

// ==========================================================================
// Tracked Repositories Management
// ==========================================================================
function renderTrackedRepos() {
  const container = document.getElementById("repo-list-container");
  container.innerHTML = "";

  appState.repos.forEach(repo => {
    const li = document.createElement("li");
    li.className = "repo-item";
    li.innerHTML = `
      <span title="${repo}">${repo}</span>
      <button class="btn-repo-del" onclick="deleteRepo('${repo}')" title="Untrack Repository">
        <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
      </button>
    `;
    container.appendChild(li);
  });

  // Re-populate form dropdown filter selections
  populateRepoDropdowns();
  lucide.createIcons();
}

function toggleAddRepoBox() {
  const box = document.getElementById("repo-add-box");
  box.style.display = box.style.display === "none" ? "flex" : "none";
}

function handleAddRepo() {
  const repoName = document.getElementById("new-repo-name").value.trim();
  if (!repoName) return;

  // Simple validation check (must look like owner/repo)
  if (!repoName.includes("/")) {
    alert("Repository must be in 'owner/repo-name' format!");
    return;
  }

  if (appState.repos.includes(repoName)) {
    alert("Repository is already tracked!");
    return;
  }

  appState.repos.push(repoName);
  saveAppData();
  document.getElementById("new-repo-name").value = "";
  document.getElementById("repo-add-box").style.display = "none";
  renderTrackedRepos();
}

function deleteRepo(repo) {
  if (confirm(`Stop tracking contributions to ${repo}?`)) {
    appState.repos = appState.repos.filter(r => r !== repo);
    saveAppData();
    renderTrackedRepos();
  }
}

function populateRepoDropdowns() {
  const formSelect = document.getElementById("form-repo");
  const filterSelect = document.getElementById("filter-repo");

  // Keep original filter options
  filterSelect.innerHTML = `<option value="all">All Repositories</option>`;
  formSelect.innerHTML = "";

  appState.repos.forEach(repo => {
    formSelect.innerHTML += `<option value="${repo}">${repo}</option>`;
    filterSelect.innerHTML += `<option value="${repo}">${repo}</option>`;
  });
}

// ==========================================================================
// Contribution Logger Modals
// ==========================================================================
function openContributionModal(id = null) {
  if (appState.repos.length === 0) {
    alert("Please add at least one tracked repository first!");
    return;
  }

  const form = document.getElementById("contribution-form");
  const title = document.getElementById("modal-title");
  form.reset();

  // Load target date as today
  document.getElementById("form-date").value = new Date().toISOString().split("T")[0];

  if (id) {
    // Edit mode settings
    const log = appState.logs.find(l => l.id === id);
    if (log) {
      title.textContent = "Edit Logged Activity";
      document.getElementById("edit-log-id").value = log.id;
      document.getElementById("form-title").value = log.title;
      document.getElementById("form-type").value = log.type;
      document.getElementById("form-status").value = log.status;
      document.getElementById("form-repo").value = log.repo;
      document.getElementById("form-date").value = log.date;
      document.getElementById("form-url").value = log.url;
      document.getElementById("form-desc").value = log.desc;
    }
  } else {
    title.textContent = "Log Open Source Activity";
    document.getElementById("edit-log-id").value = "";
  }

  document.getElementById("contribution-modal").style.display = "flex";
}

function closeContributionModal() {
  document.getElementById("contribution-modal").style.display = "none";
}

function handleContributionSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById("edit-log-id").value;
  const title = document.getElementById("form-title").value.trim();
  const type = document.getElementById("form-type").value;
  const status = document.getElementById("form-status").value;
  const repo = document.getElementById("form-repo").value;
  const date = document.getElementById("form-date").value;
  const url = document.getElementById("form-url").value.trim();
  const desc = document.getElementById("form-desc").value.trim();

  if (editId) {
    // Update logged activity
    const log = appState.logs.find(l => l.id === editId);
    if (log) {
      log.title = title;
      log.type = type;
      log.status = status;
      log.repo = repo;
      log.date = date;
      log.url = url;
      log.desc = desc;
    }
  } else {
    // Add new activity
    const newLog = {
      id: "log-" + Date.now(),
      title, type, status, repo, date, url, desc
    };
    appState.logs.unshift(newLog);
    
    // Manage Streak Counter
    manageStreakCalculation(date);
  }

  saveAppData();
  closeContributionModal();
  renderContributionLogs();
  renderGoalWidget();
  renderContributionCalendar();
  calculateDashboardMetrics();
  updateCharts();
}

function manageStreakCalculation(logDate) {
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (logDate === todayStr) {
    if (appState.lastContributionDate === yesterdayStr) {
      appState.streak++;
    } else if (appState.lastContributionDate !== todayStr) {
      appState.streak = 1;
    }
    appState.lastContributionDate = todayStr;
  }
}

function deleteContribution(id) {
  if (confirm("Are you sure you want to delete this contribution log?")) {
    appState.logs = appState.logs.filter(l => l.id !== id);
    saveAppData();
    renderContributionLogs();
    renderGoalWidget();
    renderContributionCalendar();
    calculateDashboardMetrics();
    updateCharts();
  }
}

// ==========================================================================
// Contribution Logs List rendering
// ==========================================================================
function renderContributionLogs() {
  const container = document.getElementById("logs-list-container");
  container.innerHTML = "";

  const searchQuery = document.getElementById("log-search").value.toLowerCase();
  const typeFilter = document.getElementById("filter-type").value;
  const statusFilter = document.getElementById("filter-status").value;
  const repoFilter = document.getElementById("filter-repo").value;

  const filteredLogs = appState.logs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchQuery) ||
                          log.repo.toLowerCase().includes(searchQuery) ||
                          (log.desc && log.desc.toLowerCase().includes(searchQuery)) ||
                          (log.url && log.url.toLowerCase().includes(searchQuery));
    
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesRepo = repoFilter === "all" || log.repo === repoFilter;

    return matchesSearch && matchesType && matchesStatus && matchesRepo;
  });

  if (filteredLogs.length === 0) {
    container.innerHTML = `<div class="empty-state-p">No contributions matching filters logged.</div>`;
    return;
  }

  filteredLogs.forEach(log => {
    const card = document.createElement("div");
    card.className = `log-item-card type-${log.type.replace(" ", "")}`;

    // Category iconography
    let icon = "git-commit";
    if (log.type === "Pull Request") icon = "git-pull-request";
    else if (log.type === "Issue") icon = "alert-circle";

    const descBlock = log.desc ? `<p class="log-desc">${log.desc}</p>` : "";
    const urlBlock = log.url ? `<a href="${log.url}" target="_blank" class="log-meta-tag"><i data-lucide="link"></i> Reference Link</a>` : "";

    card.innerHTML = `
      <div class="log-icon-box">
        <i data-lucide="${icon}"></i>
      </div>
      <div class="log-content-box">
        <div class="log-title-row">
          <h4>${log.title}</h4>
          <span class="badge-status ${log.status.toLowerCase()}">${log.status}</span>
        </div>
        ${descBlock}
        <div class="log-meta-row">
          <span class="log-meta-tag"><i data-lucide="folder"></i> ${log.repo}</span>
          <span class="log-meta-tag"><i data-lucide="calendar"></i> ${log.date}</span>
          ${urlBlock}
        </div>
      </div>
      <div class="log-actions-box">
        <button class="btn btn-secondary btn-action-log" onclick="openContributionModal('${log.id}')" title="Edit Activity">
          <i data-lucide="edit-3" style="width:12px;height:12px;"></i>
        </button>
        <button class="btn btn-secondary btn-action-log" onclick="deleteContribution('${log.id}')" title="Delete Activity">
          <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

// ==========================================================================
// Goal tracking systems
// ==========================================================================
function renderGoalWidget() {
  document.getElementById("goal-target").textContent = appState.goalTarget;
  
  // Calculate contributions logged in the current month (June)
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. '2026-06'
  const monthlyLogs = appState.logs.filter(l => l.date && l.date.startsWith(currentMonthStr));
  const currentCount = monthlyLogs.length;

  document.getElementById("goal-current").textContent = currentCount;

  // progress bar widths
  const percent = Math.min(100, Math.round((currentCount / appState.goalTarget) * 100));
  document.getElementById("goal-progress-bar").style.width = `${percent}%`;
}

// ==========================================================================
// Contribution Heatmap calculations
// ==========================================================================
function renderContributionCalendar() {
  const container = document.getElementById("heatmap-grid-container");
  container.innerHTML = "";

  // Compile contribution log counts by date YYYY-MM-DD
  const dateCounts = {};
  appState.logs.forEach(log => {
    if (log.date) {
      dateCounts[log.date] = (dateCounts[log.date] || 0) + 1;
    }
  });

  // Calculate calendar layout offsets:
  // Render grid mapping the last 371 days (53 columns x 7 rows) to align nicely
  const today = new Date();
  const calendarCellsCount = 53 * 7;
  const startDate = new Date();
  startDate.setDate(today.getDate() - calendarCellsCount + 1);

  // Generate cells
  for (let i = 0; i < calendarCellsCount; i++) {
    const cellDateStr = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const count = dateCounts[cellDateStr] || 0;
    
    let levelClass = "level-0";
    if (count === 1) levelClass = "level-1";
    else if (count === 2) levelClass = "level-2";
    else if (count === 3) levelClass = "level-3";
    else if (count >= 4) levelClass = "level-4";

    const cell = document.createElement("div");
    cell.className = `heatmap-cell ${levelClass}`;
    cell.setAttribute("title", `${cellDateStr}: ${count} contribution${count === 1 ? '' : 's'}`);
    
    container.appendChild(cell);
  }
}

// ==========================================================================
// Dashboard mathematical calculators
// ==========================================================================
function calculateDashboardMetrics() {
  const total = appState.logs.length;
  
  const prs = appState.logs.filter(l => l.type === "Pull Request");
  const mergedPrs = prs.filter(l => l.status === "Merged").length;
  
  const activeIssues = appState.logs.filter(l => l.type === "Issue" && l.status === "Open").length;
  const closedIssues = appState.logs.filter(l => l.type === "Issue" && l.status === "Closed").length;
  
  const commits = appState.logs.filter(l => l.type === "Commit").length;

  // Merge rate computations
  const prMergeRate = prs.length === 0 ? 0 : Math.round((mergedPrs / prs.length) * 100);

  // Set Metric panels output
  document.getElementById("stat-total").textContent = total;
  
  // Target percentage mapping
  const targetPercent = Math.min(100, Math.round((total / (appState.goalTarget * 3)) * 100)); // normalized index
  document.getElementById("stat-goal-progress").textContent = `Target: ${targetPercent}% reached`;

  document.getElementById("stat-prs").textContent = prs.length;
  document.getElementById("stat-pr-merge-rate").textContent = `${prMergeRate}% Merged`;

  document.getElementById("stat-issues").textContent = activeIssues;
  document.getElementById("stat-issues-closed").textContent = `${closedIssues} Solved`;

  document.getElementById("stat-commits").textContent = commits;
  
  // Weekly averages math
  const weeklyAvg = total === 0 ? 0 : (total / 4).toFixed(1);
  document.getElementById("stat-weekly-avg").textContent = `${weeklyAvg} / week avg`;

  // Dynamic achievement grids checkers
  renderAchievements();
}

// ==========================================================================
// Achievements Trophies logic
// ==========================================================================
const achievementDefinitions = [
  { id: "badge-oss-1", title: "First PR", desc: "Log your first Pull Request.", icon: "git-pull-request", check: (state) => state.logs.filter(l => l.type === "Pull Request").length >= 1 },
  { id: "badge-oss-5", title: "Merge Master", desc: "Get 3 Pull Requests merged.", icon: "zap", check: (state) => state.logs.filter(l => l.type === "Pull Request" && l.status === "Merged").length >= 3 },
  { id: "badge-issue-3", title: "Open Source Scout", desc: "Open or solve 3 issues.", icon: "alert-circle", check: (state) => state.logs.filter(l => l.type === "Issue").length >= 3 },
  { id: "badge-commit-10", title: "Commit Crusher", desc: "Log 5+ commit pushes.", icon: "git-commit", check: (state) => state.logs.filter(l => l.type === "Commit").length >= 5 },
  { id: "badge-goal-pm", title: "Hackathon Hero", desc: "Reach your monthly target goal.", icon: "target", check: (state) => {
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      return state.logs.filter(l => l.date && l.date.startsWith(currentMonthStr)).length >= state.goalTarget;
    } 
  },
  { id: "badge-streak-5", title: "GitHub Streak", desc: "Build a contribution streak of 3+ days.", icon: "flame", check: (state) => state.streak >= 3 }
];

function renderAchievements() {
  const container = document.getElementById("badges-grid-container");
  container.innerHTML = "";

  achievementDefinitions.forEach(badge => {
    const isUnlocked = badge.check(appState);
    const card = document.createElement("div");
    card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;

    card.innerHTML = `
      <div class="badge-icon">
        <i data-lucide="${badge.icon}"></i>
      </div>
      <h4>${badge.title}</h4>
      <p>${badge.desc}</p>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// ==========================================================================
// ChartJS implementations
// ==========================================================================
function initAnalyticsChart() {
  drawCharts();
}

function switchChart(type) {
  activeChartType = type;
  document.getElementById("btn-chart-types").classList.remove("active");
  document.getElementById("btn-chart-timeline").classList.remove("active");

  if (type === "types") {
    document.getElementById("btn-chart-types").classList.add("active");
  } else {
    document.getElementById("btn-chart-timeline").classList.add("active");
  }

  drawCharts();
}

function drawCharts() {
  const canvas = document.getElementById("contributionChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isLight = !document.body.classList.contains("dark-theme");
  const labelColor = isLight ? "#57606a" : "#8b949e";
  const gridColor = isLight ? "rgba(9, 105, 218, 0.08)" : "rgba(88, 166, 255, 0.08)";

  if (activeChartType === "types") {
    // Activity distribution doughnut chart
    const prCount = appState.logs.filter(l => l.type === "Pull Request").length;
    const issueCount = appState.logs.filter(l => l.type === "Issue").length;
    const commitCount = appState.logs.filter(l => l.type === "Commit").length;

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pull Requests", "Issues", "Commits"],
        datasets: [{
          data: [prCount, issueCount, commitCount],
          backgroundColor: ["#a371f7", "#58a6ff", "#2ea44f"],
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
    // Contribution growth line chart by month
    const timelineData = {};
    appState.logs.forEach(l => {
      if (l.date) {
        const monthStr = l.date.substring(0, 7); // YYYY-MM
        timelineData[monthStr] = (timelineData[monthStr] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(timelineData).sort();
    const sortedCounts = sortedMonths.map(m => timelineData[m]);

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedMonths.map(m => {
          const parts = m.split("-");
          const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return `${monthLabels[parseInt(parts[1]) - 1]} ${parts[0].substring(2)}`;
        }),
        datasets: [{
          label: "Contributions Logged",
          data: sortedCounts,
          borderColor: "#2ea44f",
          backgroundColor: "rgba(46, 164, 79, 0.1)",
          fill: true,
          tension: 0.3,
          borderWidth: 2
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
          y: { ticks: { color: labelColor, stepSize: 1 }, grid: { color: gridColor } }
        }
      }
    });
  }
}

// ==========================================================================
// Backup Export / Reset Actions
// ==========================================================================
function exportDatabaseJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `octotracker_backup.json`);
  dlAnchor.click();
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
        renderTrackedRepos();
        renderContributionLogs();
        renderGoalWidget();
        renderContributionCalendar();
        calculateDashboardMetrics();
        drawCharts();
        alert("OctoTracker backup configuration loaded successfully!");
      } else {
        alert("Invalid OctoTracker configuration layout.");
      }
    } catch (err) {
      alert("Error parsing JSON configuration backup file.");
    }
  };
  reader.readAsText(file);
}

function resetDatabase() {
  if (confirm("Are you sure you want to restore original default contributor templates? This will wipe your current database edits.")) {
    appState = {
      profile: { ...defaultProfile },
      repos: [...mockRepos],
      logs: [...mockLogs],
      goalTarget: 10,
      streak: 3,
      lastContributionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };
    saveAppData();
    renderProfile();
    renderTrackedRepos();
    renderContributionLogs();
    renderGoalWidget();
    renderContributionCalendar();
    calculateDashboardMetrics();
    drawCharts();
    alert("Database reloaded successfully!");
  }
}
