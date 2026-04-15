// Full Chess Logic and AI

const PIECES = {
    P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
    p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

const INITIAL_BOARD = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
];

let board = [...INITIAL_BOARD];
let turn = 'w'; // 'w' for white, 'b' for black
let selectedSquare = null;
let legalMoves = [];
let moveHistory = [];
let castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
let enPassantTarget = null;
let halfMoveClock = 0;
let fullMoveNumber = 1;

function initGame() {
    board = [...INITIAL_BOARD];
    turn = 'w';
    selectedSquare = null;
    legalMoves = [];
    moveHistory = [];
    castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    enPassantTarget = null;
    halfMoveClock = 0;
    fullMoveNumber = 1;
    renderBoard();
    updateStatus();
}

function getPieceColor(piece) {
    if (!piece) return null;
    return piece === piece.toUpperCase() ? 'w' : 'b';
}

function isSquareEmpty(index) {
    return board[index] === '';
}

function getSquareCoords(index) {
    return { row: Math.floor(index / 8), col: index % 8 };
}

function isKingInCheck(boardState, color) {
    const kingPiece = (color === 'w') ? 'K' : 'k';
    let kingIndex = -1;

    for (let i = 0; i < 64; i++) {
        if (boardState[i] === kingPiece) {
            kingIndex = i;
            break;
        }
    }

    if (kingIndex === -1) return false; // Should not happen in a valid game

    const opponentColor = (color === 'w') ? 'b' : 'w';

    // Check for pawn attacks
    const pawnDirection = (color === 'w') ? 1 : -1;
    const kingCoords = getSquareCoords(kingIndex);
    const pawnAttackOffsets = [[pawnDirection, -1], [pawnDirection, 1]];

    for (const offset of pawnAttackOffsets) {
        const targetRow = kingCoords.row + offset[0];
        const targetCol = kingCoords.col + offset[1];
        const targetIndex = getIndexFromCoords(targetRow, targetCol);
        if (targetIndex !== -1) {
            const piece = boardState[targetIndex];
            if (piece && getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'p') {
                return true;
            }
        }
    }

    // Check for knight attacks
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const move of knightMoves) {
        const targetRow = kingCoords.row + move[0];
        const targetCol = kingCoords.col + move[1];
        const targetIndex = getIndexFromCoords(targetRow, targetCol);
        if (targetIndex !== -1) {
            const piece = boardState[targetIndex];
            if (piece && getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'n') {
                return true;
            }
        }
    }

    // Check for rook/queen attacks (horizontal and vertical)
    const straightDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const d of straightDirections) {
        for (let i = 1; i < 8; i++) {
            const targetRow = kingCoords.row + d[0] * i;
            const targetCol = kingCoords.col + d[1] * i;
            const targetIndex = getIndexFromCoords(targetRow, targetCol);

            if (targetIndex === -1) break;

            const piece = boardState[targetIndex];
            if (piece) {
                if (getPieceColor(piece) === opponentColor && (piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q')) {
                    return true;
                }
                break; // Blocked by piece
            }
        }
    }

    // Check for bishop/queen attacks (diagonals)
    const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const d of diagonalDirections) {
        for (let i = 1; i < 8; i++) {
            const targetRow = kingCoords.row + d[0] * i;
            const targetCol = kingCoords.col + d[1] * i;
            const targetIndex = getIndexFromCoords(targetRow, targetCol);

            if (targetIndex === -1) break;

            const piece = boardState[targetIndex];
            if (piece) {
                if (getPieceColor(piece) === opponentColor && (piece.toLowerCase() === 'b' || piece.toLowerCase() === 'q')) {
                    return true;
                }
                break; // Blocked by piece
            }
        }
    }

    // Check for king attacks (should not happen in a legal position, but for completeness)
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    for (const move of kingMoves) {
        const targetRow = kingCoords.row + move[0];
        const targetCol = kingCoords.col + move[1];
        const targetIndex = getIndexFromCoords(targetRow, targetCol);
        if (targetIndex !== -1) {
            const piece = boardState[targetIndex];
            if (piece && getPieceColor(piece) === opponentColor && piece.toLowerCase() === 'k') {
                return true;
            }
        }
    }

    return false;
}

function getIndexFromCoords(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return -1;
    return row * 8 + col;
}

function generateLegalMoves(index) {
    const piece = board[index];
    if (!piece) return [];
    const color = getPieceColor(piece);
    if (color !== turn) return [];

    const type = piece.toLowerCase();
    const coords = getSquareCoords(index);
    let moves = [];

    if (type === 'p') {
        // Pawns
        const direction = (color === 'w') ? -1 : 1;
        const startRow = (color === 'w') ? 6 : 1;

        // Single push
        let targetIndex = getIndexFromCoords(coords.row + direction, coords.col);
        if (targetIndex !== -1 && isSquareEmpty(targetIndex)) {
            moves.push(targetIndex);
            // Double push
            if (coords.row === startRow) {
                targetIndex = getIndexFromCoords(coords.row + 2 * direction, coords.col);
                if (isSquareEmpty(targetIndex)) {
                    moves.push(targetIndex);
                }
            }
        }

        // Captures
        const captureCols = [coords.col - 1, coords.col + 1];
        captureCols.forEach(c => {
            const captureIndex = getIndexFromCoords(coords.row + direction, c);
            if (captureIndex !== -1 && !isSquareEmpty(captureIndex) && getPieceColor(board[captureIndex]) !== color) {
                moves.push(captureIndex);
            }
        });

        // En passant
        if (enPassantTarget) {
            const epRow = getSquareCoords(enPassantTarget).row;
            const epCol = getSquareCoords(enPassantTarget).col;
            if (coords.row + direction === epRow && (coords.col - 1 === epCol || coords.col + 1 === epCol)) {
                moves.push(enPassantTarget);
            }
        }
    } else if (type === 'r') {
        // Rooks
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E
        directions.forEach(d => {
            for (let i = 1; i < 8; i++) {
                const targetRow = coords.row + d[0] * i;
                const targetCol = coords.col + d[1] * i;
                const targetIndex = getIndexFromCoords(targetRow, targetCol);

                if (targetIndex === -1) break; // Out of bounds

                if (isSquareEmpty(targetIndex)) {
                    moves.push(targetIndex);
                } else {
                    if (getPieceColor(board[targetIndex]) !== color) {
                        moves.push(targetIndex); // Capture
                    }
                    break; // Blocked by piece
                }
            }
        });
    } else if (type === 'n') {
        // Knights
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(move => {
            const targetRow = coords.row + move[0];
            const targetCol = coords.col + move[1];
            const targetIndex = getIndexFromCoords(targetRow, targetCol);

            if (targetIndex !== -1 && getPieceColor(board[targetIndex]) !== color) {
                moves.push(targetIndex);
            }
        });
    } else if (type === 'b') {
        // Bishops
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // NW, NE, SW, SE
        directions.forEach(d => {
            for (let i = 1; i < 8; i++) {
                const targetRow = coords.row + d[0] * i;
                const targetCol = coords.col + d[1] * i;
                const targetIndex = getIndexFromCoords(targetRow, targetCol);

                if (targetIndex === -1) break; // Out of bounds

                if (isSquareEmpty(targetIndex)) {
                    moves.push(targetIndex);
                } else {
                    if (getPieceColor(board[targetIndex]) !== color) {
                        moves.push(targetIndex); // Capture
                    }
                    break; // Blocked by piece
                }
            }
        });
    } else if (type === 'q') {
        // Queens (Rook moves + Bishop moves)
        const rookDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E
        rookDirections.forEach(d => {
            for (let i = 1; i < 8; i++) {
                const targetRow = coords.row + d[0] * i;
                const targetCol = coords.col + d[1] * i;
                const targetIndex = getIndexFromCoords(targetRow, targetCol);

                if (targetIndex === -1) break;

                if (isSquareEmpty(targetIndex)) {
                    moves.push(targetIndex);
                } else {
                    if (getPieceColor(board[targetIndex]) !== color) {
                        moves.push(targetIndex);
                    }
                    break;
                }
            }
        });

        const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // NW, NE, SW, SE
        bishopDirections.forEach(d => {
            for (let i = 1; i < 8; i++) {
                const targetRow = coords.row + d[0] * i;
                const targetCol = coords.col + d[1] * i;
                const targetIndex = getIndexFromCoords(targetRow, targetCol);

                if (targetIndex === -1) break;

                if (isSquareEmpty(targetIndex)) {
                    moves.push(targetIndex);
                } else {
                    if (getPieceColor(board[targetIndex]) !== color) {
                        moves.push(targetIndex);
                    }
                    break;
                }
            }
        });
    } else if (type === 'k') {
        // Kings
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        kingMoves.forEach(move => {
            const targetRow = coords.row + move[0];
            const targetCol = coords.col + move[1];
            const targetIndex = getIndexFromCoords(targetRow, targetCol);

            if (targetIndex !== -1 && getPieceColor(board[targetIndex]) !== color) {
                moves.push(targetIndex);
            }
        });

        // Castling (simplified for now, needs full validation)
        if (color === 'w') {
            if (castlingRights.wK && board[61] === '' && board[62] === '') { // Kingside
                moves.push(62);
            }
            if (castlingRights.wQ && board[59] === '' && board[58] === '' && board[57] === '') { // Queenside
                moves.push(58);
            }
        } else {
            if (castlingRights.bK && board[5] === '' && board[6] === '') { // Kingside
                moves.push(6);
            }
            if (castlingRights.bQ && board[1] === '' && board[2] === '' && board[3] === '') { // Queenside
                moves.push(2);
            }
        }
    }

    // Filter out moves that leave the king in check
    const validMoves = [];
    for (const move of moves) {
        const newBoard = [...board];
        const originalPiece = newBoard[index];
        const targetPiece = newBoard[move];

        // Simulate the move
        const tempPiece = newBoard[move];
        newBoard[move] = originalPiece;
        newBoard[index] = "";

        if (!isKingInCheck(newBoard, color)) {
            validMoves.push(move);
        }

        // Undo the move
        newBoard[index] = originalPiece;
        newBoard[move] = tempPiece;
    }

    return validMoves;
}

function handleSquareClick(index) {
    if (turn !== 'w') return; // Only allow white to move for now

    if (selectedSquare === null) {
        if (getPieceColor(board[index]) === turn) {
            selectedSquare = index;
            legalMoves = generateLegalMoves(index);
            renderBoard();
        }
    } else {
        if (legalMoves.includes(index)) {
            makeMove(selectedSquare, index);
            selectedSquare = null;
            legalMoves = [];
            renderBoard();
            updateStatus();
            setTimeout(makeAIMove, 500); // AI move delay
        } else if (getPieceColor(board[index]) === turn) {
            selectedSquare = index;
            legalMoves = generateLegalMoves(index);
            renderBoard();
        } else {
            selectedSquare = null;
            legalMoves = [];
            renderBoard();
        }
    }
}

function makeMove(from, to, promoteTo = 'Q') {
    const piece = board[from];
    const fromCoords = getSquareCoords(from);
    const toCoords = getSquareCoords(to);
    const captured = board[to];
    // Handle en passant capture
    if (piece.toLowerCase() === 'p' && to === enPassantTarget) {
        board[getIndexFromCoords(fromCoords.row, toCoords.col)] = '';
    }

    board[to] = piece;
    board[from] = '';

    // Handle pawn promotion
    if (piece.toLowerCase() === 'p' && (toCoords.row === 0 || toCoords.row === 7)) {
        board[to] = (getPieceColor(piece) === 'w') ? promoteTo.toUpperCase() : promoteTo.toLowerCase();
    }

    // Handle castling
    if (piece.toLowerCase() === 'k' && Math.abs(fromCoords.col - toCoords.col) === 2) {
        // Kingside castling
        if (toCoords.col === 6) {
            const rook = board[getIndexFromCoords(fromCoords.row, 7)];
            board[getIndexFromCoords(fromCoords.row, 5)] = rook;
            board[getIndexFromCoords(fromCoords.row, 7)] = '';
        }
        // Queenside castling
        else if (toCoords.col === 2) {
            const rook = board[getIndexFromCoords(fromCoords.row, 0)];
            board[getIndexFromCoords(fromCoords.row, 3)] = rook;
            board[getIndexFromCoords(fromCoords.row, 0)] = '';
        }
    }
    // Update castling rights
    if (piece === 'K') castlingRights.wK = castlingRights.wQ = false;
    if (piece === 'k') castlingRights.bK = castlingRights.bQ = false;
    if (piece === 'R' && from === 63) castlingRights.wK = false;
    if (piece === 'R' && from === 56) castlingRights.wQ = false;
    if (piece === 'r' && from === 7) castlingRights.bK = false;
    if (piece === 'r' && from === 0) castlingRights.bQ = false;

    // Update en passant target
    enPassantTarget = null;
    if (piece.toLowerCase() === 'p' && Math.abs(fromCoords.row - toCoords.row) === 2) {
        enPassantTarget = getIndexFromCoords(fromCoords.row + (getPieceColor(piece) === 'w' ? -1 : 1), fromCoords.col);
    }

    turn = turn === 'w' ? 'b' : 'w';
    if (turn === 'w') fullMoveNumber++;
    halfMoveClock = (piece.toLowerCase() === 'p' || captured) ? 0 : halfMoveClock + 1;
    
    const feedback = document.getElementById('coach-feedback');
    if (captured) {
        feedback.textContent = `Good capture! You took a ${PIECES[captured]}.`;
    } else if (piece.toLowerCase() === 'k' && Math.abs(fromCoords.col - toCoords.col) === 2) {
        feedback.textContent = "Nice castling!";
    } else if (piece.toLowerCase() === 'p' && (toCoords.row === 0 || toCoords.row === 7)) {
        feedback.textContent = "Pawn promoted! Well done.";
    } else {
        feedback.textContent = "Solid move.";
    }
}

function makeAIMove() {
    if (turn !== 'b') return;

    const aiRating = parseInt(localStorage.getItem('chessCoachRating') || '1200');
    let possibleMoves = [];

    for (let i = 0; i < 64; i++) {
        if (getPieceColor(board[i]) === 'b') {
            const moves = generateLegalMoves(i);
            moves.forEach(to => {
                possibleMoves.push({ from: i, to: to });
            });
        }
    }

    if (possibleMoves.length === 0) {
        // No legal moves, AI is in checkmate or stalemate
        return;
    }

    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
        // Simulate move
        const originalBoard = [...board];
        const originalTurn = turn;
        const originalCastlingRights = { ...castlingRights };
        const originalEnPassantTarget = enPassantTarget;
        const simulatedCapturedPiece = board[move.to];
        const originalHalfMoveClock = halfMoveClock;
        const originalFullMoveNumber = fullMoveNumber;

        makeMove(move.from, move.to);

        let score = evaluateBoard(board, aiRating);

        // Add bonus for captures for medium/higher ratings
        if (aiRating >= 1000 && simulatedCapturedPiece) {
            score += pieceValues[simulatedCapturedPiece.toLowerCase()] * 0.5; // Half the value of captured piece as bonus
        }

        // Undo move
        board = originalBoard;
        turn = originalTurn;
        castlingRights = originalCastlingRights;
        enPassantTarget = originalEnPassantTarget;
        halfMoveClock = originalHalfMoveClock;
        fullMoveNumber = originalFullMoveNumber;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    if (bestMove) {
        makeMove(bestMove.from, bestMove.to);
        renderBoard();
        updateStatus();
    }
}

function evaluateBoard(boardState, rating) {
    let score = 0;
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };

    for (let i = 0; i < 64; i++) {
        const piece = boardState[i];
        if (piece) {
            const color = getPieceColor(piece);
            const value = pieceValues[piece.toLowerCase()];
            score += (color === 'b' ? value : -value);
        }
    }

    // Add some randomness for lower ratings
    if (rating < 1000) {
        score += (Math.random() - 0.5) * 2; // -1 to 1 randomness
    }

    // Prefer captures and avoid hanging pieces for medium/higher ratings
    if (rating >= 1000) {
        // Add bonus for captures
        // This logic is better placed within the move generation/evaluation loop in makeAIMove
        // For now, let's keep material evaluation as primary.

        // Penalize hanging pieces (simplified: check if king is in check after move)
        // This is already handled by generateLegalMoves filtering moves that leave king in check.
        // More advanced hanging piece detection would involve checking if the moved piece is attacked
        // by a less valuable piece after the move.
    }

    return score;
}

function renderBoard() {
    const boardContainer = document.getElementById('chess-board');
    boardContainer.innerHTML = '';

    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        const coords = getSquareCoords(i);
        if ((coords.row + coords.col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        if (selectedSquare === i) {
            square.style.backgroundColor = '#8bc34a'; // Highlight selected
        } else if (legalMoves.includes(i)) {
            const dot = document.createElement('div');
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            dot.style.borderRadius = '50%';
            square.appendChild(dot);
        }

        const piece = board[i];
        if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.classList.add('piece');
            pieceEl.textContent = PIECES[piece];
            pieceEl.style.fontSize = '40px';
            pieceEl.style.color = getPieceColor(piece) === 'w' ? '#fff' : '#000';
            pieceEl.style.textShadow = getPieceColor(piece) === 'w' ? '0 1px 2px #000' : '0 1px 2px #fff';
            square.appendChild(pieceEl);
        }

        square.addEventListener('click', () => handleSquareClick(i));
        boardContainer.appendChild(square);
    }
}

function updateStatus() {
    const statusEl = document.getElementById(\'game-status\');
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
            document.getElementById('coach-feedback').textContent = `Oh no! ${opponentColor.toUpperCase()} delivered a checkmate. Better luck next time!`;
        } else {
            statusEl.textContent = "Stalemate!";
            document.getElementById('coach-feedback').textContent = "It's a stalemate! No legal moves, but no check.";
        }
    } else if (inCheck) {
        statusEl.textContent = `${currentTurnColor.toUpperCase()} to move (in check)`;
        document.getElementById('coach-feedback').textContent = `Watch out! Your ${currentTurnColor.toUpperCase()} king is in check!`;
    } else {
        statusEl.textContent = `${currentTurnColor.toUpperCase()} to move`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    document.getElementById('new-game-btn').addEventListener('click', initGame);
});
