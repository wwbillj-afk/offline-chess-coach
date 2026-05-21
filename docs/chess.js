let board = [];
let selectedSquare = null;
let currentPlayer = 'white';

const initialBoard = [
    'r','n','b','q','k','b','n','r',
    'p','p','p','p','p','p','p','p',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    'P','P','P','P','P','P','P','P',
    'R','N','B','Q','K','B','N','R'
];

function initGame() {

    board = [...initialBoard];

    selectedSquare = null;

    currentPlayer = 'white';

    updateStatus();

    renderBoard();
}

function updateStatus() {

    const status = document.getElementById('game-status');

    status.textContent =
        currentPlayer.charAt(0).toUpperCase() +
        currentPlayer.slice(1) +
        ' to move';
}

function isWhitePiece(piece) {

    return piece && piece === piece.toUpperCase();
}

function isBlackPiece(piece) {

    return piece && piece === piece.toLowerCase();
}

function getPieceColor(piece) {

    if (!piece) return null;

    return isWhitePiece(piece)
        ? 'white'
        : 'black';
}

function handleSquareClick(index) {

    const piece = board[index];

    if (selectedSquare === null) {

        if (!piece) return;

        const pieceColor = getPieceColor(piece);

        if (pieceColor !== currentPlayer) {
            return;
        }

        selectedSquare = index;

        renderBoard();

        highlightSquare(index);

    } else {

        if (selectedSquare === index) {

            selectedSquare = null;

            renderBoard();

            return;
        }

        if (isValidMove(selectedSquare, index)) {

            movePiece(selectedSquare, index);

            currentPlayer =
                currentPlayer === 'white'
                    ? 'black'
                    : 'white';

            updateStatus();
        }

        selectedSquare = null;

        renderBoard();
    }
}

function movePiece(from, to) {

    board[to] = board[from];

    board[from] = '';
}

function highlightSquare(index) {

    const squares = document.querySelectorAll('.square');

    if (squares[index]) {

        squares[index].style.outline =
            '4px solid #8bc34a';
    }
}

function isValidMove(from, to) {

    const piece = board[from];

    if (!piece) return false;

    const target = board[to];

    const pieceColor = getPieceColor(piece);

    if (
        target &&
        getPieceColor(target) === pieceColor
    ) {
        return false;
    }

    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;

    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    switch (piece.toLowerCase()) {

        case 'p':
            return validatePawnMove(
                piece,
                fromRow,
                fromCol,
                toRow,
                toCol,
                target
            );

        case 'r':
            return validateRookMove(
                fromRow,
                fromCol,
                toRow,
                toCol
            );

        case 'n':
            return (
                (
                    Math.abs(rowDiff) === 2 &&
                    Math.abs(colDiff) === 1
                ) ||
                (
                    Math.abs(rowDiff) === 1 &&
                    Math.abs(colDiff) === 2
                )
            );

        case 'b':
            return validateBishopMove(
                fromRow,
                fromCol,
                toRow,
                toCol
            );

        case 'q':
            return (
                validateRookMove(
                    fromRow,
                    fromCol,
                    toRow,
                    toCol
                ) ||
                validateBishopMove(
                    fromRow,
                    fromCol,
                    toRow,
                    toCol
                )
            );

        case 'k':
            return (
                Math.abs(rowDiff) <= 1 &&
                Math.abs(colDiff) <= 1
            );

        default:
            return false;
    }
}

function validatePawnMove(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    target
) {

    const direction =
        piece === 'P' ? -1 : 1;

    const startRow =
        piece === 'P' ? 6 : 1;

    if (
        fromCol === toCol &&
        !target
    ) {

        if (
            toRow === fromRow + direction
        ) {
            return true;
        }

        if (
            fromRow === startRow &&
            toRow === fromRow + direction * 2
        ) {

            const middleSquare =
                (fromRow + direction) * 8 + fromCol;

            if (!board[middleSquare]) {
                return true;
            }
        }
    }

    if (
        Math.abs(toCol - fromCol) === 1 &&
        toRow === fromRow + direction &&
        target
    ) {
        return true;
    }

    return false;
}

function validateRookMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (
        fromRow !== toRow &&
        fromCol !== toCol
    ) {
        return false;
    }

    const rowStep =
        toRow === fromRow
            ? 0
            : (toRow > fromRow ? 1 : -1);

    const colStep =
        toCol === fromCol
            ? 0
            : (toCol > fromCol ? 1 : -1);

    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (board[row * 8 + col]) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}

function validateBishopMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (
        Math.abs(toRow - fromRow) !==
        Math.abs(toCol - fromCol)
    ) {
        return false;
    }

    const rowStep =
        toRow > fromRow ? 1 : -1;

    const colStep =
        toCol > fromCol ? 1 : -1;

    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (
        row !== toRow &&
        col !== toCol
    ) {

        if (board[row * 8 + col]) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}
