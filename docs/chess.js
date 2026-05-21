const PIECES = {
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚"
};

const INITIAL_BOARD = [
    "r","n","b","q","k","b","n","r",
    "p","p","p","p","p","p","p","p",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "P","P","P","P","P","P","P","P",
    "R","N","B","Q","K","B","N","R"
];

let board = [...INITIAL_BOARD];
let selectedSquare = null;
let currentTurn = "w";

function renderBoard() {
    const boardEl = document.getElementById("chessboard");

    if (!boardEl) return;

    boardEl.innerHTML = "";

    for (let i = 0; i < 64; i++) {
        const square = document.createElement("div");

        square.classList.add("square");

        const row = Math.floor(i / 8);
        const col = i % 8;

        if ((row + col) % 2 === 0) {
            square.classList.add("light");
        } else {
            square.classList.add("dark");
        }

        square.dataset.index = i;

        if (board[i]) {
            square.textContent = PIECES[board[i]];
        }

        square.addEventListener("click", () => {
            handleSquareClick(i);
        });

        boardEl.appendChild(square);
    }
}

function getPieceColor(piece) {
    if (!piece) return null;

    return piece === piece.toUpperCase() ? "w" : "b";
}

function handleSquareClick(index) {
    const piece = board[index];

    if (selectedSquare === null) {
        if (piece && getPieceColor(piece) === currentTurn) {
            selectedSquare = index;
        }
        return;
    }

    board[index] = board[selectedSquare];
    board[selectedSquare] = "";

    selectedSquare = null;

    currentTurn = currentTurn === "w" ? "b" : "w";

    updateStatus();
    renderBoard();
}

function updateStatus() {
    const statusEl = document.getElementById("game-status");

    if (statusEl) {
        statusEl.textContent =
            currentTurn === "w"
                ? "White to move"
                : "Black to move";
    }
}

function initGame() {
    board = [...INITIAL_BOARD];
    selectedSquare = null;
    currentTurn = "w";

    updateStatus();
    renderBoard();
}

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});
