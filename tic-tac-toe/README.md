# GRID — Tic Tac Toe

A neon synthwave Tic Tac Toe game with an unbeatable AI opponent, animated win lines, particle bursts, and full score tracking. Built with vanilla HTML, CSS, and JavaScript — no libraries or build tools.

---

## How to Play

1. **Choose a mode** — 2 Players (local) or vs AI
2. Player X always goes first
3. Click any empty cell to place your symbol
4. First to get 3 in a row (horizontal, vertical, or diagonal) wins
5. If all 9 cells fill with no winner, it's a draw

---

## Features

- **2 Player mode** — pass and play on the same device
- **vs AI mode** — unbeatable AI using the Minimax algorithm with alpha-beta pruning
- **Animated win line** — neon SVG line draws across the winning combination
- **Particle burst** — colored particle explosion fires from the center on every win
- **Glitch title** — the GRID title has a synthwave glitch animation
- **Ghost preview** — see a faint preview of where your symbol will land on hover
- **Score tracking** — persistent across rounds (resets only on "Reset All")
- **Pop animations** — symbols scale in on placement; winning cells pulse
- **AI thinking delay** — AI has a realistic 400–700ms delay with a blinking indicator
- **Keyboard shortcuts** — `R` to start a new round, `Esc` to close the result panel

---

## AI: How It Works

The AI uses **Minimax with Alpha-Beta Pruning** — it evaluates every possible future board state recursively and always picks the optimal move. It is unbeatable: the best outcome vs the AI is always a draw if you play perfectly.

---

## Project Structure

```
tictactoe/
├── index.html   — App shell, board, overlays, particle layer
├── style.css    — Neon synthwave theme, animations, win line, glitch FX
├── app.js       — Game state, minimax AI, rendering, particle bursts
└── README.md    — This file
```

---

## Getting Started

No install needed. Just open `index.html` in any modern browser:

```bash
# Option 1: Double-click index.html

# Option 2: Local dev server
npx serve .
# or
python3 -m http.server 3000
```

---

## Customization

All colors are CSS variables in `:root` at the top of `style.css`:

```css
:root {
  --x-color:   #ff2d78;   /* Hot pink — Player X */
  --o-color:   #00e5ff;   /* Electric cyan — Player O / AI */
  --bg:        #08070e;   /* Deep dark background */
}
```

Change `--x-color` and `--o-color` to retheme the entire game instantly.

To make the AI beatable, replace `getBestMove` in `app.js` with a random-move picker:
```js
function getBestMove(board) {
  const empty = board.map((v,i) => v ? null : i).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}
```

---

## Browser Support

All modern browsers. Uses CSS `clip-path`, SVG `stroke-dashoffset` animation, and `backdrop-filter`.

---

## License

MIT — free to use and modify.
