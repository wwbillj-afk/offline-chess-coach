function updateStatus() {
    const statusEl = document.getElementById('game-status');
    const currentTurnColor = turn;
    const opponentColor = (currentTurnColor === 'w') ? 'b' : 'w';

    let allLegalMoves = [];

    for (let i = 0; i < 64; i++) {
        if (getPieceColor(board[i]) === currentTurnColor) {
            allLegalMoves = allLegalMoves.concat(generateLegalMoves(i));
        }
    }

    const inCheck = isKingInCheck(board, currentTurnColor);

    if (allLegalMoves.length === 0) {
        if (inCheck) {
            statusEl.textContent = `Checkmate! ${opponentColor.toUpperCase()} wins.`;

            document.getElementById('coach-feedback').textContent =
                `Oh no! ${opponentColor.toUpperCase()} delivered a checkmate. Better luck next time!`;

        } else {
            statusEl.textContent = "Stalemate!";

            document.getElementById('coach-feedback').textContent =
                "It's a stalemate! No legal moves, but no check.";
        }

    } else if (inCheck) {
        statusEl.textContent =
            `${currentTurnColor.toUpperCase()} to move (in check)`;

        document.getElementById('coach-feedback').textContent =
            `Watch out! Your ${currentTurnColor.toUpperCase()} king is in check!`;

    } else {
        statusEl.textContent =
            `${currentTurnColor.toUpperCase()} to move`;
    }
}
