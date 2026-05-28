const statusEl = document.getElementById("status");
const boardEl = document.getElementById("board");
const restartBtn = document.getElementById("restart");
const cells = Array.from(document.querySelectorAll(".cell"));

let currentPlayer = "X";
let board = Array(9).fill("");
let isGameOver = false;

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const checkWinner = () => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const handleCellClick = (event) => {
  const cell = event.target;
  const index = parseInt(cell.dataset.index, 10);

  if (isGameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.disabled = true;

  const winner = checkWinner();
  if (winner) {
    updateStatus(`Player ${winner} wins!`);
    isGameOver = true;
    boardEl.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
    return;
  }

  if (!board.includes("")) {
    updateStatus("It's a draw!");
    isGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s turn`);
};

const resetGame = () => {
  board = Array(9).fill("");
  currentPlayer = "X";
  isGameOver = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
  });
  updateStatus("Player X's turn");
};

boardEl.addEventListener("click", (event) => {
  if (event.target.matches(".cell")) {
    handleCellClick(event);
  }
});

restartBtn.addEventListener("click", resetGame);

resetGame();
