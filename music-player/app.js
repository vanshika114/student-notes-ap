const apiBase = 'https://itunes.apple.com/search';

// DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchType = document.getElementById('searchType');
const resultsList = document.getElementById('resultsList');
const audio = document.getElementById('audio');
const playPause = document.getElementById('playPause');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerArtwork = document.getElementById('playerArtwork');
const favoritesBtn = document.getElementById('favoritesBtn');
const recentBtn = document.getElementById('recentBtn');
const recommendationsEl = document.getElementById('recommendations');
const seek = document.getElementById('seek');
const timeEl = document.getElementById('time');

let currentTrack = null;
let favorites = loadFavorites();
let recent = loadRecent();

// Events
searchBtn.addEventListener('click', () => doSearch());
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
favoritesBtn.addEventListener('click', showFavorites);
recentBtn.addEventListener('click', showRecent);
playPause.addEventListener('click', togglePlay);

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seek.value = pct;
  timeEl.textContent = formatTime(audio.currentTime);
});
seek.addEventListener('input', () => {
  if (!audio.duration) return;
  audio.currentTime = (seek.value / 100) * audio.duration;
});

// Search
async function doSearch(){
  const q = searchInput.value.trim();
  if (!q) return;
  const type = searchType.value;
  let entity = 'song';
  if (type === 'album') entity = 'album';
  if (type === 'artist') entity = 'musicArtist';
  const url = `${apiBase}?term=${encodeURIComponent(q)}&entity=${entity}&limit=30`;
  resultsList.innerHTML = '<div class="panel">Searching...</div>';
  try{
    const res = await fetch(url);
    const data = await res.json();
    renderResults(data.results, type);
  }catch(err){
    resultsList.innerHTML = '<div class="panel">Failed to fetch. Check network.</div>';
    console.error(err);
  }
}

function renderResults(items, type){
  if (!items || items.length === 0){
    resultsList.innerHTML = '<div class="panel">No results</div>';
    return;
  }
  resultsList.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';
    const artwork = document.createElement('img');
    let img = it.artworkUrl100 || it.artistLinkUrl || '';
    artwork.src = img.replace('100x100bb','200x200bb');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('div');
    title.className = 'title';
    const sub = document.createElement('div');
    sub.className = 'sub';

    const actions = document.createElement('div');
    actions.className = 'actions';

    if (type === 'artist'){
      title.textContent = it.artistName;
      sub.textContent = `Artist ID: ${it.artistId}`;
      const browse = document.createElement('button');
      browse.textContent = 'View Artist';
      browse.onclick = () => { searchInput.value = it.artistName; searchType.value='song'; doSearch(); };
      actions.appendChild(browse);
    } else if (type === 'album'){
      title.textContent = it.collectionName;
      sub.textContent = `${it.artistName} • ${it.trackCount || ''} tracks`;
      const view = document.createElement('button');
      view.textContent = 'View Album';
      view.onclick = () => { searchInput.value = `${it.collectionName} ${it.artistName}`; searchType.value='song'; doSearch(); };
      actions.appendChild(view);
    } else {
      // song
      title.textContent = it.trackName;
      sub.textContent = `${it.artistName} • ${it.collectionName || ''}`;
      const play = document.createElement('button');
      play.textContent = 'Play';
      play.onclick = () => playTrack(it);
      const like = document.createElement('button');
      like.textContent = isFavorite(it.trackId) ? '♥' : '♡';
      like.onclick = () => toggleFavorite(it, like);
      actions.appendChild(play);
      actions.appendChild(like);
    }

    meta.appendChild(title);
    meta.appendChild(sub);
    card.appendChild(artwork);
    card.appendChild(meta);
    card.appendChild(actions);
    resultsList.appendChild(card);
  });
}

// Playback
function playTrack(track){
  if (!track || !track.previewUrl) return alert('No preview available');
  currentTrack = track;
  audio.src = track.previewUrl;
  audio.play();
  playPause.textContent = 'Pause';
  playerTitle.textContent = track.trackName || track.collectionName || track.artistName;
  playerArtist.textContent = track.artistName || '';
  playerArtwork.src = (track.artworkUrl100||'').replace('100x100bb','200x200bb');
  saveRecent(track);
  updateRecommendations();
}

function togglePlay(){
  if (!audio.src) return; 
  if (audio.paused) { audio.play(); playPause.textContent='Pause'; }
  else { audio.pause(); playPause.textContent='Play'; }
}

// Favorites
function loadFavorites(){
  try{ return JSON.parse(localStorage.getItem('musicPlayerFavorites')||'[]'); }catch(e){return []}
}
function saveFavorites(){ localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites)); }
function isFavorite(trackId){ return favorites.some(f=>f.trackId===trackId); }
function toggleFavorite(track, btnEl){
  if (!track) return;
  const idx = favorites.findIndex(f=>f.trackId===track.trackId);
  if (idx >= 0){ favorites.splice(idx,1); btnEl.textContent='♡'; }
  else { favorites.unshift(track); btnEl.textContent='♥'; }
  saveFavorites();
  updateRecommendations();
}

function showFavorites(){
  if (!favorites.length) { resultsList.innerHTML = '<div class="panel">No favorites yet</div>'; return; }
  renderResults(favorites, 'song');
}

// Recent
function loadRecent(){
  try{ return JSON.parse(localStorage.getItem('musicPlayerRecent')||'[]'); }catch(e){return []}
}
function saveRecentList(){ localStorage.setItem('musicPlayerRecent', JSON.stringify(recent)); }
function saveRecent(track){
  if (!track) return;
  recent = recent.filter(r=>r.trackId !== track.trackId);
  recent.unshift({ ...track, playedAt: Date.now() });
  if (recent.length > 30) recent.pop();
  saveRecentList();
}
function showRecent(){
  if (!recent.length) { resultsList.innerHTML = '<div class="panel">No recent plays</div>'; return; }
  renderResults(recent.map(r=>r), 'song');
}

// Recommendations / Personalization
function updateRecommendations(){
  const topArtists = {};
  favorites.concat(recent).forEach(t => { if (!t) return; const name = t.artistName || 'unknown'; topArtists[name] = (topArtists[name]||0)+1; });
  const sorted = Object.entries(topArtists).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]);
  recommendationsEl.innerHTML = '';
  if (!sorted.length) { recommendationsEl.innerHTML = '<div class="sub">No recommendations yet — play some music!</div>'; return; }
  sorted.forEach(artist => {
    const b = document.createElement('button');
    b.textContent = `Explore ${artist}`;
    b.onclick = () => { searchInput.value = artist; searchType.value='song'; doSearch(); };
    recommendationsEl.appendChild(b);
  });
}

updateRecommendations();

// Utils
function formatTime(s){
  s = Math.floor(s||0);
  const m = Math.floor(s/60); const sec = s%60; return `${m}:${String(sec).padStart(2,'0')}`;
}
