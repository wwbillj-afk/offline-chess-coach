const pieces = {
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    p: "♟",

    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    P: "♙"
};

let board = [];
let selectedSquare = null;
let currentPlayer = "white";

function startGame() {

    board = [

        ["r","n","b","q","k","b","n","r"],
        ["p","p","p","p","p","p","p","p"],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["P","P","P","P","P","P","P","P"],
        ["R","N","B","Q","K","B","N","R"]

    ];

    currentPlayer = "white";

    document.getElementById("coach-feedback").innerText =
        "Game started. White moves first.";

    renderBoard();
}

function renderBoard() {

    const boardElement = document.getElementById("board");

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            const piece = board[row][col];

            if (piece !== "") {

                const pieceElement =
                    document.createElement("div");

                pieceElement.classList.add("piece");

                pieceElement.innerText = pieces[piece];

                square.appendChild(pieceElement);
            }

            square.addEventListener("click", () => {
                handleClick(row, col);
            });

            boardElement.appendChild(square);
        }
    }

    document.getElementById("game-status").innerText =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1) +
        " to move";
}

function handleClick(row, col) {

    const clickedPiece = board[row][col];

    if (!selectedSquare) {

        if (clickedPiece === "") return;

        const isWhite =
            clickedPiece === clickedPiece.toUpperCase();

        if (
            (currentPlayer === "white" && !isWhite) ||
            (currentPlayer === "black" && isWhite)
        ) {
            return;
        }

        selectedSquare = { row, col };

        renderBoard();

        return;
    }

    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;

    const movingPiece = board[fromRow][fromCol];

    board[row][col] = movingPiece;

    board[fromRow][fromCol] = "";

    selectedSquare = null;

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";

    document.getElementById("coach-feedback").innerText =
        "Move played.";

    renderBoard();
}

startGame();

if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
            console.log("Service Worker Registered");
        });

}
