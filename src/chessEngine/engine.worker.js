import Chess from 'chess.js';
import ChessEngine from './AI';

let game, engine;

self.addEventListener('message', e => {
    console.log(e.data);
    switch(e.data.type) {

        case 'init': 
            initGame(e.data.startPosition); 
            break;

        case 'move':
            game.move(e.data.data);
            console.log(game.ascii());
            break;        

        case 'search':
            let bestMove = engine.getBestMove(game, e.data.data.searchDepth, e.data.data.evalCap, e.data.data.maxPly);
            if(!bestMove.nomoves) game.move(bestMove.move);
            self.postMessage({type: 'search', data: bestMove});
            console.log(game.ascii());
            break;

        case 'undo':
            game.undo();
            console.log(game.ascii());
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
    console.log('initGame');
    game = startPosition ? new Chess(startPosition) : new Chess();
    engine = new ChessEngine();
    console.log(game.ascii());
}

function resetGame(startPosition) {
    game = startPosition ? new Chess(startPosition) : new Chess();
}