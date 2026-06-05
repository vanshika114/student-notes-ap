// ==========================================================================
// Pre-populated Internship Applications Mock Data
// ==========================================================================
let appState = {
  applications: [
    {
      id: "app-1",
      company: "Stripe",
      role: "Backend Engineer Intern",
      locationType: "remote",
      stipend: 5000,
      jobUrl: "https://stripe.com/jobs",
      dateApplied: "2026-05-10",
      stage: "interviewing",
      notes: "Referral from senior dev. Recruiter call done. Technical round scheduled next week.",
      checklist: [
        { text: "Review SQL database index designs", done: true },
        { text: "Solve Stripe API mock problem", done: false },
        { text: "Revise System Design fundamentals", done: false }
      ]
    },
    {
      id: "app-2",
      company: "Google",
      role: "Software Engineering Intern",
      locationType: "hybrid",
      stipend: 6200,
      jobUrl: "https://careers.google.com",
      dateApplied: "2026-05-02",
      stage: "applied",
      notes: "Online Assessment completed. Waiting on results.",
      checklist: [
        { text: "Complete Google OA practice guides", done: true }
      ]
    },
    {
      id: "app-3",
      company: "Notion",
      role: "Product Design Intern",
      locationType: "onsite",
      stipend: 4500,
      jobUrl: "https://notion.so/careers",
      dateApplied: "2026-04-20",
      stage: "offered",
      notes: "Stipend offers $4500/mo. Response required by end of month.",
      checklist: [
        { text: "Discuss team location options", done: true }
      ]
    },
    {
      id: "app-4",
      company: "Figma",
      role: "Frontend Engineer Intern",
      locationType: "remote",
      stipend: 4800,
      jobUrl: "https://figma.com/careers",
      dateApplied: "2026-04-15",
      stage: "rejected",
      notes: "Rejected after portfolio review round. Ask recruiter for feedback details.",
      checklist: []
    }
  ],
  activeChart: "funnel" // funnel, timeline
};

// Global References
let chartInstance = null;
let tempChecklist = [];

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
  loadTrackerData();
  bindEventHandlers();
  renderBoard();
  calculateAnalytics();
  initCharts();
  lucide.createIcons();
});

// Load storage
function loadTrackerData() {
  const saved = localStorage.getItem("interncraft_tracker_state_v1");
  if (saved) {
    try {
      appState = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading saved state", e);
    }
  }
}

// Save storage
function saveTrackerData() {
  localStorage.setItem("interncraft_tracker_state_v1", JSON.stringify(appState));
}

// Binds actions
function bindEventHandlers() {
  // Theme switcher
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const body = document.body;
    if (body.classList.contains("dark-theme")) {
      body.classList.replace("dark-theme", "light-theme");
    } else {
      body.classList.replace("light-theme", "dark-theme");
    }
  });

  // Modal Open Trigger
  document.getElementById("add-app-btn").addEventListener("click", () => openAppModal());
  
  // Modal Close Triggers
  document.getElementById("modal-close-btn").addEventListener("click", closeAppModal);
  document.getElementById("form-cancel-btn").addEventListener("click", closeAppModal);
  
  // Submit Form
  document.getElementById("app-form").addEventListener("submit", handleFormSubmit);

  // Dynamic Add Checklist items buttons inside modal
  document.getElementById("checklist-add-item-btn").addEventListener("click", addTempChecklistItem);
  document.getElementById("checklist-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTempChecklistItem();
    }
  });

  // Chart Switchers
  document.getElementById("chart-btn-funnel").addEventListener("click", () => switchChartType("funnel"));
  document.getElementById("chart-btn-timeline").addEventListener("click", () => switchChartType("timeline"));

  // Search & Filter listeners
  document.getElementById("search-input").addEventListener("input", renderBoard);
  document.getElementById("filter-stipend").addEventListener("change", renderBoard);
  document.getElementById("filter-location").addEventListener("change", renderBoard);

  // Import/Export / Reset triggers
  document.getElementById("export-btn").addEventListener("click", exportTrackerJSON);
  
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", importTrackerJSON);

  document.getElementById("reset-btn").addEventListener("click", resetAllTrackerData);
  
  // Drag and drop events for board columns
  const columns = document.querySelectorAll(".board-column");
  columns.forEach(col => {
    col.addEventListener("dragover", dragOverColumn);
    col.addEventListener("dragenter", dragEnterColumn);
    col.addEventListener("dragleave", dragLeaveColumn);
    col.addEventListener("drop", dropOnColumn);
  });
}

// ==========================================================================
// Kanban Board Drag & Drop handlers
// ==========================================================================
function dragStartCard(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
  e.target.style.opacity = "0.5";
}

function dragEndCard(e) {
  e.target.style.opacity = "1";
}

function dragOverColumn(e) {
  e.preventDefault();
}

function dragEnterColumn(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function dragLeaveColumn() {
  this.classList.remove("drag-over");
}

function dropOnColumn(e) {
  this.classList.remove("drag-over");
  const cardId = e.dataTransfer.getData("text/plain");
  const cardEl = document.getElementById(cardId);
  if (!cardEl) return;
  
  const appId = cardEl.getAttribute("data-id");
  const newStage = this.getAttribute("data-stage");
  
  // Update state stage
  const appObj = appState.applications.find(a => a.id === appId);
  if (appObj && appObj.stage !== newStage) {
    appObj.stage = newStage;
    
    // Auto-adjust date applied if they move wishlist -> applied
    if (newStage === "applied" && !appObj.dateApplied) {
      appObj.dateApplied = new Date().toISOString().split("T")[0];
    }
    
    saveTrackerData();
    renderBoard();
    calculateAnalytics();
    updateCharts();
  }
}

// ==========================================================================
// Board & Cards Rendering
// ==========================================================================
function renderBoard() {
  // Clear lists
  const stages = ["wishlist", "applied", "interviewing", "offered", "rejected"];
  stages.forEach(stage => {
    document.getElementById(`list-${stage}`).innerHTML = "";
    document.getElementById(`count-${stage}`).textContent = "0";
  });

  const searchVal = document.getElementById("search-input").value.toLowerCase();
  const filterStipend = document.getElementById("filter-stipend").value;
  const filterLocation = document.getElementById("filter-location").value;

  // Filter application list
  const filteredApps = appState.applications.filter(app => {
    // Search filter
    const matchesSearch = app.company.toLowerCase().includes(searchVal) ||
                          app.role.toLowerCase().includes(searchVal) ||
                          (app.notes && app.notes.toLowerCase().includes(searchVal));
                          
    // Stipend filter
    let matchesStipend = true;
    const stipend = parseFloat(app.stipend) || 0;
    if (filterStipend === "unpaid") {
      matchesStipend = stipend === 0;
    } else if (filterStipend === "paid") {
      matchesStipend = stipend > 0;
    } else if (filterStipend === "high") {
      matchesStipend = stipend >= 2000;
    }
    
    // Location filter
    const matchesLocation = filterLocation === "all" || app.locationType === filterLocation;
    
    return matchesSearch && matchesStipend && matchesLocation;
  });

  // Inject cards
  filteredApps.forEach(app => {
    const listContainer = document.getElementById(`list-${app.stage}`);
    if (!listContainer) return;
    
    const card = document.createElement("div");
    card.className = "app-card";
    card.id = `card-${app.id}`;
    card.setAttribute("data-id", app.id);
    card.setAttribute("draggable", "true");
    
    // Bind Drag Actions
    card.addEventListener("dragstart", dragStartCard);
    card.addEventListener("dragend", dragEndCard);
    
    // Checklist meta string
    let checklistStr = "";
    if (app.checklist && app.checklist.length > 0) {
      const done = app.checklist.filter(item => item.done).length;
      checklistStr = `<span class="badge-location" title="Checklist progress"><i data-lucide="check-square" style="width:10px;height:10px;display:inline-block;vertical-align:-1px;"></i> ${done}/${app.checklist.length}</span>`;
    }
    
    card.innerHTML = `
      <div class="app-card-header">
        <div class="app-card-title-group">
          <h4>${app.company}</h4>
          <span>${app.role}</span>
        </div>
        <span class="badge-location">${app.locationType}</span>
      </div>
      
      <div class="app-card-meta">
        <span class="stipend-lbl">${app.stipend ? `$${app.stipend}/mo` : 'Unpaid'}</span>
        <div style="display:flex;gap:4px;align-items:center;">
          ${checklistStr}
          <span>${app.dateApplied ? app.dateApplied.substring(5) : 'Wishlist'}</span>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn btn-secondary btn-card-action" onclick="openAppModal('${app.id}')" title="Edit App">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn btn-danger-outline btn-card-action" onclick="deleteApplication('${app.id}')" title="Delete App">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    
    listContainer.appendChild(card);
  });

  // Update headers count badge
  stages.forEach(stage => {
    const listContainer = document.getElementById(`list-${stage}`);
    document.getElementById(`count-${stage}`).textContent = listContainer.children.length;
  });
  
  lucide.createIcons();
}

// Delete application card
function deleteApplication(id) {
  if (confirm("Are you sure you want to delete this application log?")) {
    appState.applications = appState.applications.filter(a => a.id !== id);
    saveTrackerData();
    renderBoard();
    calculateAnalytics();
    updateCharts();
  }
}

// ==========================================================================
// Modal Operations (Add / Edit Forms)
// ==========================================================================
function openAppModal(id = null) {
  const modal = document.getElementById("app-modal");
  const form = document.getElementById("app-form");
  const title = document.getElementById("modal-title");
  
  form.reset();
  tempChecklist = [];
  renderTempChecklist();

  if (id) {
    // Edit Mode
    const app = appState.applications.find(a => a.id === id);
    if (!app) return;
    
    title.textContent = `Update Application | ${app.company}`;
    document.getElementById("edit-app-id").value = app.id;
    document.getElementById("form-company").value = app.company;
    document.getElementById("form-role").value = app.role;
    document.getElementById("form-location-type").value = app.locationType;
    document.getElementById("form-stipend").value = app.stipend || "";
    document.getElementById("form-job-url").value = app.jobUrl || "";
    document.getElementById("form-date-applied").value = app.dateApplied || "";
    document.getElementById("form-stage").value = app.stage;
    document.getElementById("form-notes").value = app.notes || "";
    
    // Load checklist
    if (app.checklist) {
      tempChecklist = JSON.parse(JSON.stringify(app.checklist)); // clone
      renderTempChecklist();
    }
  } else {
    // Add Mode
    title.textContent = "Track New Application";
    document.getElementById("edit-app-id").value = "";
    document.getElementById("form-date-applied").value = new Date().toISOString().split("T")[0];
  }
  
  modal.style.display = "flex";
  lucide.createIcons();
}

function closeAppModal() {
  document.getElementById("app-modal").style.display = "none";
}

// Submit Application Details Form
function handleFormSubmit(e) {
  e.preventDefault();
  
  const editId = document.getElementById("edit-app-id").value;
  const company = document.getElementById("form-company").value.trim();
  const role = document.getElementById("form-role").value.trim();
  const locationType = document.getElementById("form-location-type").value;
  const stipend = parseInt(document.getElementById("form-stipend").value) || 0;
  const jobUrl = document.getElementById("form-job-url").value.trim();
  const dateApplied = document.getElementById("form-date-applied").value;
  const stage = document.getElementById("form-stage").value;
  const notes = document.getElementById("form-notes").value.trim();

  if (editId) {
    // Update Mode
    const appObj = appState.applications.find(a => a.id === editId);
    if (appObj) {
      appObj.company = company;
      appObj.role = role;
      appObj.locationType = locationType;
      appObj.stipend = stipend;
      appObj.jobUrl = jobUrl;
      appObj.dateApplied = dateApplied;
      appObj.stage = stage;
      appObj.notes = notes;
      appObj.checklist = tempChecklist;
    }
  } else {
    // Add Mode
    const newAppObj = {
      id: "app-" + Date.now(),
      company, role, locationType, stipend, jobUrl, dateApplied, stage, notes,
      checklist: tempChecklist
    };
    appState.applications.push(newAppObj);
  }

  saveTrackerData();
  closeAppModal();
  renderBoard();
  calculateAnalytics();
  updateCharts();
}

// Temporary checklist manipulation inside Modal
function addTempChecklistItem() {
  const input = document.getElementById("checklist-input");
  const text = input.value.trim();
  if (!text) return;
  
  tempChecklist.push({ text, done: false });
  input.value = "";
  renderTempChecklist();
}

function removeTempChecklistItem(idx) {
  tempChecklist.splice(idx, 1);
  renderTempChecklist();
}

function toggleTempChecklistItem(idx) {
  tempChecklist[idx].done = !tempChecklist[idx].done;
  renderTempChecklist();
}

function renderTempChecklist() {
  const container = document.getElementById("checklist-list-container");
  container.innerHTML = "";
  
  tempChecklist.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = `checklist-li-item ${item.done ? 'checked' : ''}`;
    
    li.innerHTML = `
      <input type="checkbox" ${item.done ? 'checked' : ''} onclick="toggleTempChecklistItem(${idx})">
      <span>${item.text}</span>
      <button type="button" class="btn-li-delete" onclick="removeTempChecklistItem(${idx})">&times;</button>
    `;
    
    container.appendChild(li);
  });
}

// ==========================================================================
// Placement Metrics Calculations
// ==========================================================================
function calculateAnalytics() {
  const total = appState.applications.length;
  
  // Exclude wishlist count from total applied for correct placement rates
  const wishlistCount = appState.applications.filter(a => a.stage === "wishlist").length;
  const appliedCount = total - wishlistCount;
  
  const interviewingCount = appState.applications.filter(a => a.stage === "interviewing").length;
  const offeredCount = appState.applications.filter(a => a.stage === "offered").length;
  const rejectedCount = appState.applications.filter(a => a.stage === "rejected").length;
  
  // Rate computations
  const convertRate = appliedCount === 0 ? 0 : Math.round(((interviewingCount + offeredCount) / appliedCount) * 100);
  const successRate = (offeredCount + rejectedCount) === 0 ? 0 : Math.round((offeredCount / (offeredCount + rejectedCount)) * 100);
  
  // UI metrics output mappings
  document.getElementById("metric-total").textContent = appliedCount;
  document.getElementById("metric-wishlist").textContent = `${wishlistCount} In Wishlist`;
  document.getElementById("metric-interviewing").textContent = interviewingCount;
  document.getElementById("metric-interview-rate").textContent = `${convertRate}% Conversion`;
  document.getElementById("metric-offers").textContent = offeredCount;
  document.getElementById("metric-success-rate").textContent = `${successRate}% Success Rate`;
}

// ==========================================================================
// Charting visualizations (ChartJS configurations)
// ==========================================================================
function initCharts() {
  const ctx = document.getElementById("applicationsChart").getContext("2d");
  
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          "#3b82f6", "#a855f7", "#f59e0b", "#10b981", "#ef4444"
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#b794f4", boxWidth: 12, font: { family: "Outfit" } }
        }
      }
    }
  });
  
  updateCharts();
}

function switchChartType(type) {
  appState.activeChart = type;
  
  // Toggle active button style
  document.getElementById("chart-btn-funnel").classList.remove("active");
  document.getElementById("chart-btn-timeline").classList.remove("active");
  
  if (type === "funnel") {
    document.getElementById("chart-btn-funnel").classList.add("active");
  } else {
    document.getElementById("chart-btn-timeline").classList.add("active");
  }
  
  updateCharts();
}

function updateCharts() {
  if (!chartInstance) return;
  
  if (appState.activeChart === "funnel") {
    // Doughnut distribution of stages
    const stageCounts = {
      "Wishlist": 0, "Applied": 0, "Interviewing": 0, "Offered": 0, "Rejected": 0
    };
    
    appState.applications.forEach(a => {
      const label = a.stage.charAt(0).toUpperCase() + a.stage.slice(1);
      stageCounts[label] = (stageCounts[label] || 0) + 1;
    });
    
    chartInstance.config.type = "doughnut";
    chartInstance.data.labels = Object.keys(stageCounts);
    chartInstance.data.datasets[0].data = Object.values(stageCounts);
    chartInstance.options.scales = {}; // Clear scales for doughnut
    
  } else {
    // Monthly applications timeline bar chart
    const monthlyData = {};
    appState.applications.forEach(a => {
      if (a.dateApplied && a.stage !== "wishlist") {
        const month = a.dateApplied.substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    const sortedCounts = sortedMonths.map(m => monthlyData[m]);
    
    chartInstance.config.type = "bar";
    chartInstance.data.labels = sortedMonths.map(m => {
      const parts = m.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[parseInt(parts[1]) - 1]} ${parts[0].substring(2)}`;
    });
    chartInstance.data.datasets[0].data = sortedCounts;
    
    // Scale constraints for Bar Chart
    chartInstance.options.scales = {
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#b794f4", stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#b794f4" }
      }
    };
  }
  
  // Re-sync label colors for light/dark modes
  const isLight = !document.body.classList.contains("dark-theme");
  chartInstance.options.plugins.legend.labels.color = isLight ? "#8b5cf6" : "#b794f4";
  if (chartInstance.options.scales && chartInstance.options.scales.y) {
    chartInstance.options.scales.y.ticks.color = isLight ? "#8b5cf6" : "#b794f4";
    chartInstance.options.scales.x.ticks.color = isLight ? "#8b5cf6" : "#b794f4";
  }
  
  chartInstance.update();
}

// ==========================================================================
// Backup import / export / reset
// ==========================================================================
function exportTrackerJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `internship_applications_backup.json`);
  dlAnchor.click();
}

function importTrackerJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.applications && Array.isArray(parsed.applications)) {
        appState = parsed;
        saveTrackerData();
        renderBoard();
        calculateAnalytics();
        updateCharts();
        alert("Applications backup imported successfully!");
      } else {
        alert("Invalid JSON configuration layout.");
      }
    } catch (err) {
      alert("Error parsing JSON configuration file.");
    }
  };
  reader.readAsText(file);
}

function resetAllTrackerData() {
  if (confirm("Are you sure you want to clear ALL tracked applications? This cannot be undone.")) {
    appState.applications = [];
    saveTrackerData();
    renderBoard();
    calculateAnalytics();
    updateCharts();
    alert("Workspace cleared successfully!");
  }
}
