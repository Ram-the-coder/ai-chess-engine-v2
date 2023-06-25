import ChessEngine from './AI';
import Chess from 'chess.js';

let game, engine;

export function handleInit(data) {
    initGame(data.startPosition);

    function initGame(startPosition) {
        game = startPosition ? new Chess(startPosition) : new Chess();
        engine = new ChessEngine();
    }
}

export function handleMove(data) {
    game.move(data.data);
}

export function handleSearch(data) {
    let bestMove = engine.getBestMove(game, data.data.searchDepth, data.data.evalCap, data.data.maxPly);
    self.postMessage({type: data.type, data: bestMove});
}

export function handleUndo(data) {
    game.undo();
}

export function handleSetPgn(data) {
    game.load_pgn(data.data);
}

export function handleSetFen(data) {
    game.load(data.data);
}

export function handleReset(data) {
    resetGame(data.startPosition);
    function resetGame(startPosition) {
        game = startPosition ? new Chess(startPosition) : new Chess();
    }
}

