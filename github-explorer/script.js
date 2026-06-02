const usernameInput = document.getElementById('username');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusEl = document.getElementById('status');
const profileGrid = document.getElementById('profileGrid');
const analyticsGrid = document.getElementById('analyticsGrid');
const reposCard = document.getElementById('reposCard');
const reposList = document.getElementById('reposList');
const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const profileUrl = document.getElementById('profileUrl');
const followersEl = document.getElementById('followers');
const followingEl = document.getElementById('following');
const reposEl = document.getElementById('repos');
const gistsEl = document.getElementById('gists');
const starsEl = document.getElementById('stars');
const forksEl = document.getElementById('forks');
const issuesEl = document.getElementById('issues');
const watchersEl = document.getElementById('watchers');
const languagesEl = document.getElementById('languages');

let currentUser = 'octocat';

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ffb4b4' : 'var(--muted)';
}

function showLoading() {
  profileGrid.hidden = false;
  analyticsGrid.hidden = false;
  reposCard.hidden = false;
  [avatar, nameEl, bioEl, profileUrl, followersEl, followingEl, reposEl, gistsEl, starsEl, forksEl, issuesEl, watchersEl].forEach((el) => {
    el.classList?.add('loading');
  });
}

function clearLoading() {
  [avatar, nameEl, bioEl, profileUrl, followersEl, followingEl, reposEl, gistsEl, starsEl, forksEl, issuesEl, watchersEl].forEach((el) => {
    el.classList?.remove('loading');
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json();
}

function renderLanguages(repos) {
  const counts = new Map();
  repos.forEach((repo) => {
    if (!repo.language) return;
    counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  });

  const topLanguages = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  languagesEl.innerHTML = topLanguages.length
    ? topLanguages.map(([language, count]) => `<span class="tag">${language} <strong>· ${count}</strong></span>`).join('')
    : '<span class="tag">No public language data found</span>';
}

function renderRepos(repos) {
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  reposList.innerHTML = topRepos.length
    ? topRepos.map((repo) => `
      <article class="repo">
        <div class="repo-top">
          <div>
            <h4><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></h4>
            <p>${repo.description || 'No description provided.'}</p>
          </div>
          ${repo.language ? `<span class="badge">${repo.language}</span>` : ''}
        </div>
        <div class="repo-meta">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🍴 ${repo.forks_count}</span>
          <span>🐛 ${repo.open_issues_count}</span>
          <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
      </article>
    `).join('')
    : '<div class="repo">No repositories found.</div>';
}

async function loadUser(username) {
  const cleanName = (username || '').trim();
  if (!cleanName) {
    setStatus('Please enter a GitHub username.', true);
    return;
  }

  currentUser = cleanName;
  setStatus(`Loading ${cleanName}...`);
  showLoading();

  try {
    const userUrl = `https://api.github.com/users/${encodeURIComponent(cleanName)}`;
    const reposUrl = `${userUrl}/repos?per_page=100&sort=updated`;

    const [profile, repos] = await Promise.all([
      fetchJson(userUrl),
      fetchJson(reposUrl)
    ]);

    avatar.src = profile.avatar_url;
    avatar.alt = `${profile.login} avatar`;
    nameEl.textContent = profile.name || profile.login;
    bioEl.textContent = profile.bio || 'No bio available.';
    profileUrl.href = profile.html_url;

    followersEl.textContent = profile.followers;
    followingEl.textContent = profile.following;
    reposEl.textContent = profile.public_repos;
    gistsEl.textContent = profile.public_gists;

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalIssues = repos.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const totalWatchers = repos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);

    starsEl.textContent = totalStars;
    forksEl.textContent = totalForks;
    issuesEl.textContent = totalIssues;
    watchersEl.textContent = totalWatchers;

    renderLanguages(repos);
    renderRepos(repos);

    profileGrid.hidden = false;
    analyticsGrid.hidden = false;
    reposCard.hidden = false;
    clearLoading();
    setStatus(`Showing public data for ${profile.login}.`);
  } catch (error) {
    clearLoading();
    profileGrid.hidden = true;
    analyticsGrid.hidden = true;
    reposCard.hidden = true;
    setStatus(`Could not load ${cleanName}. Check the username and try again.`, true);
    reposList.innerHTML = '';
    console.error(error);
  }
}

searchBtn.addEventListener('click', () => loadUser(usernameInput.value));
refreshBtn.addEventListener('click', () => loadUser(currentUser));
usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadUser(usernameInput.value);
  }
});

usernameInput.value = 'octocat';
loadUser('octocat');
