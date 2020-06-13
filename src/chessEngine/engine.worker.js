import Chess from './chess.js/chess.js';
import ChessEngine from './AI';

let game, engine;

self.addEventListener('message', e => {
    console.log(e.data);
    switch(e.data.type) {

        case 'init': 
            initGame(e.startPosition); 
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
    }
})

function initGame(startPosition) {
    console.log('initGame');
    game = startPosition ? new Chess(startPosition) : new Chess();
    engine = new ChessEngine();
    console.log(game.ascii());
}