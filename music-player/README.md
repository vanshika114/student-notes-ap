# Music Player

A lightweight music player demo that uses the public iTunes Search API to search songs, albums, and artists, play preview clips, and save favorites locally.

Features
- Search songs, albums, artists
- In-app playback of preview clips
- Like and save favorites (stored in `localStorage`)
- Recently played history and simple recommendations

Files
- `index.html` — main UI
- `style.css` — styles
- `app.js` — application logic

How to run
1. Open `music-player/index.html` in a browser (works from file://, but some browsers block fetches from file protocol; use a simple server if needed):

```bash
# from project root
npx serve .
# or
python3 -m http.server 8000
```

2. Visit `http://localhost:8000/music-player/` and try search.

Notes
- Uses the iTunes Search API which provides 30-second preview clips in `previewUrl` entries.
- This demo stores favorites and recent plays in `localStorage` for personalization.

License: MIT
