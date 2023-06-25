import ChessJS from 'chess.js';

// chessGame will serve as an API to ChessJS to avoid tight coupling to the chess.js lib
function chessGame(fen) {
    const game = new ChessJS(fen);
    return {
        ...game
    }
}

export default {
    getNewChessGame(fen) {
        return chessGame(fen);
    }
}