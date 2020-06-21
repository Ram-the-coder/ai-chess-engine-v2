import Chess from 'chess.js';
import ChessEngine from './AI';

let game, engine;

self.addEventListener('message', e => {
    // console.log(e.data);
    switch(e.data.type) {

        case 'init': 
            initGame(e.data.startPosition); 
            break;

        case 'move':
            game.move(e.data.data);
            // console.log(game.ascii());
            break;        

        case 'hint':
        case 'search':
            let bestMove = engine.getBestMove(game, e.data.data.searchDepth, e.data.data.evalCap, e.data.data.maxPly);
            self.postMessage({type: e.data.type, data: bestMove});
            break;

        case 'undo':
            game.undo();
            // console.log(game.ascii());
            break;        

        case 'set-pgn':
            game.load_pgn(e.data.data);
            // console.log(game.ascii());
            break;

        case 'set-fen':
            game.load(e.data.data);
            break;

        case 'reset':
            resetGame(e.data.startPosition);
            break;
        
        default: 
            console.log("Invalid message type");
            break;
    }
})

function initGame(startPosition) {
    // console.log('initGame');
    game = startPosition ? new Chess(startPosition) : new Chess();
    engine = new ChessEngine();
    // console.log(game.ascii());
}

function resetGame(startPosition) {
    game = startPosition ? new Chess(startPosition) : new Chess();
}