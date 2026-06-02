const API_BASE = 'http://localhost:5000/api';
let patternsData = [];
let userProgress = JSON.parse(localStorage.getItem('patternwise_progress')) || {
  solved: [],
  lastActive: null,
  streak: 0
};

// DOM Elements
const views = {
  landing: document.getElementById('landing-view'),
  dashboard: document.getElementById('dashboard-view'),
  pattern: document.getElementById('pattern-view')
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  fetchPatterns();
  updateStats();
});

function initNav() {
  document.getElementById('nav-home').addEventListener('click', () => switchView('landing'));
  document.getElementById('nav-dashboard').addEventListener('click', () => switchView('dashboard'));
  document.getElementById('nav-roadmap').addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btn-start-learning').addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btn-back-dashboard').addEventListener('click', () => switchView('dashboard'));

  // Search
  document.getElementById('search-patterns').addEventListener('input', (e) => {
    renderRoadmap(e.target.value);
  });
}

function switchView(viewName) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[viewName].classList.add('active');
  window.scrollTo(0,0);
}

async function fetchPatterns() {
  try {
    const res = await fetch(`${API_BASE}/patterns`);
    patternsData = await res.json();
    renderRoadmap();
  } catch (e) {
    console.error("Make sure the backend server is running on port 5000!");
    // Fallback if backend isn't running for demo purposes
    document.getElementById('roadmap-grid').innerHTML = `<p style="color:var(--accent-2)">Error fetching patterns. Is the backend running on port 5000?</p>`;
  }
}

function renderRoadmap(search = '') {
  const grid = document.getElementById('roadmap-grid');
  grid.innerHTML = '';

  const filtered = patternsData.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  filtered.forEach(p => {
    // Calculate progress
    const totalProbs = p.problems.length;
    const solvedProbs = p.problems.filter(slug => userProgress.solved.includes(slug)).length;
    const progressPct = totalProbs === 0 ? 0 : Math.round((solvedProbs / totalProbs) * 100);

    const card = document.createElement('div');
    card.className = 'pattern-card glass';
    card.innerHTML = `
      <div class="pcard-header">
        <div class="pcard-title">${p.name}</div>
        <div class="pcard-diff ${p.difficulty.toLowerCase()}">${p.difficulty}</div>
      </div>
      <div class="pcard-desc">${p.description}</div>
      <div class="pcard-meta">
        <span>${p.estimatedTime}</span>
        <span>${solvedProbs} / ${totalProbs} Solved</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
      </div>
    `;
    
    card.addEventListener('click', () => openPatternDetails(p.id));
    grid.appendChild(card);
  });
}

async function openPatternDetails(id) {
  switchView('pattern');
  const header = document.getElementById('pattern-header');
  header.innerHTML = '<p>Loading pattern details...</p>';
  document.getElementById('problems-list').innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/patterns/${id}`);
    const data = await res.json();
    renderPatternView(data);
  } catch (e) {
    header.innerHTML = '<p style="color:var(--accent-2)">Error fetching details from backend.</p>';
  }
}

function renderPatternView(data) {
  // Update Header
  document.getElementById('pattern-header').innerHTML = `
    <h1>${data.name}</h1>
    <p style="color: var(--text-muted)">Difficulty: <span style="color: var(--primary)">${data.difficulty}</span> • Estimated Time: ${data.estimatedTime}</p>
  `;

  // Update Content
  document.getElementById('pattern-intuition').innerText = data.intuition || 'Intuition goes here...';
  
  document.getElementById('pattern-whentouse').innerHTML = (data.whenToUse || []).map(item => `<li>${item}</li>`).join('');
  document.getElementById('pattern-mistakes').innerHTML = (data.commonMistakes || []).map(item => `<li>${item}</li>`).join('');
  
  document.getElementById('pattern-template').innerText = data.template || '// Code template...';

  // Render Problems
  const list = document.getElementById('problems-list');
  list.innerHTML = '';
  
  data.problems.forEach(prob => {
    const isChecked = userProgress.solved.includes(prob.titleSlug);
    const item = document.createElement('div');
    item.className = 'problem-item';
    item.innerHTML = `
      <div class="prob-title">
        <input type="checkbox" data-slug="${prob.titleSlug}" ${isChecked ? 'checked' : ''}>
        <a href="https://leetcode.com/problems/${prob.titleSlug}/" target="_blank" style="color:inherit; text-decoration:none;">${prob.title}</a>
      </div>
      <div class="prob-diff" style="color: ${prob.difficulty === 'Easy' ? 'var(--primary)' : prob.difficulty === 'Medium' ? 'orange' : 'var(--accent-2)'}">${prob.difficulty}</div>
    `;
    list.appendChild(item);
  });

  // Attach Checkbox Listeners
  document.querySelectorAll('#problems-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const slug = e.target.getAttribute('data-slug');
      if (e.target.checked) {
        if(!userProgress.solved.includes(slug)) userProgress.solved.push(slug);
      } else {
        userProgress.solved = userProgress.solved.filter(s => s !== slug);
      }
      saveProgress();
      updateStats();
      // Update road map in background to reflect new progress
      renderRoadmap(document.getElementById('search-patterns').value);
    });
  });

  // Setup Visualizer
  setupVisualizer(data.id);
}

function saveProgress() {
  localStorage.setItem('patternwise_progress', JSON.stringify(userProgress));
}

function updateStats() {
  document.getElementById('stat-problems').innerText = userProgress.solved.length;
  // Calculate patterns mastered (all problems in a pattern solved)
  let mastered = 0;
  patternsData.forEach(p => {
    const total = p.problems.length;
    const solved = p.problems.filter(slug => userProgress.solved.includes(slug)).length;
    if (total > 0 && total === solved) mastered++;
  });
  document.getElementById('stat-patterns').innerText = mastered;
  document.getElementById('stat-streak').innerText = userProgress.streak || 1;
}

// Basic Animated Visualizer Logic for Sliding Window
function setupVisualizer(patternId) {
  const stage = document.getElementById('visualizer-stage');
  const playBtn = document.getElementById('btn-play-viz');
  
  if (patternId === 'sliding-window') {
    stage.innerHTML = `
      <div class="viz-array">
        <div class="viz-box">1</div>
        <div class="viz-box">3</div>
        <div class="viz-box">-1</div>
        <div class="viz-box">-3</div>
        <div class="viz-box">5</div>
        <div class="viz-box">3</div>
      </div>
      <div id="viz-window" style="position:absolute; width:102px; height:36px; border:2px solid var(--primary); border-radius:4px; left:50%; transform:translateX(-95px); top:50%; margin-top:-18px; transition: transform 0.5s;"></div>
    `;
    
    playBtn.onclick = () => {
      const win = document.getElementById('viz-window');
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if(step > 3) {
          clearInterval(interval);
          win.style.transform = `translateX(-95px)`; // Reset
          return;
        }
        win.style.transform = `translateX(${-95 + (step * 34)}px)`;
      }, 1000);
    };
  } else if (patternId === 'two-pointers') {
    stage.innerHTML = `
      <div class="viz-array" style="position:relative;">
        <div class="viz-box">1</div><div class="viz-box">2</div><div class="viz-box">3</div><div class="viz-box">4</div><div class="viz-box">6</div>
        <div id="ptr-L" class="viz-pointer" style="left:10px;">L</div>
        <div id="ptr-R" class="viz-pointer" style="left:146px; color:var(--accent-2)">R</div>
      </div>
    `;
    playBtn.onclick = () => {
      const pL = document.getElementById('ptr-L');
      const pR = document.getElementById('ptr-R');
      setTimeout(() => pL.style.left = '44px', 1000);
      setTimeout(() => pR.style.left = '112px', 2000);
      setTimeout(() => { pL.style.left='10px'; pR.style.left='146px'; }, 3500);
    };
  } else {
    stage.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:2rem 0;">No visualizer configured for this pattern yet.</p>`;
    playBtn.onclick = null;
  }
}
