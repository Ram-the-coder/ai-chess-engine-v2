import wK from './assets/wikipedia/wK.png';
import wQ from './assets/wikipedia/wQ.png';
import wB from './assets/wikipedia/wB.png';
import wN from './assets/wikipedia/wN.png';
import wR from './assets/wikipedia/wR.png';
import wP from './assets/wikipedia/wP.png';
import bK from './assets/wikipedia/bK.png';
import bQ from './assets/wikipedia/bQ.png';
import bB from './assets/wikipedia/bB.png';
import bN from './assets/wikipedia/bN.png';
import bR from './assets/wikipedia/bR.png';
import bP from './assets/wikipedia/bP.png';

import {isPromotion} from './chessEngine/util';
import ChessEngine from 'worker-loader!./chessEngine/engine.worker';
import Chess from './chessEngine/chess.js/chess.js';
import * as ChessBoardUtil from './ChessBoardUtil';

let gameParams = {
	searchDepth: 3,
	evalCap: 10000,
	maxPly: 5,
}

gameParams.chessEngine = new ChessEngine();
gameParams.chessEngine.onmessage = handleWokerMessage;
//gameParams.gameState - A copy of the game state in the main thread
	// Useful for performing checks like valid move, gameover, etc.
gameParams.gameState = new Chess(); 

/**Inititalize Chessboard.js**/
gameParams.config = {
	draggable: true,
	position: 'start',
	onDragStart,
	onDrop,
	onSnapEnd,
	onMouseoutSquare,
	onMouseoverSquare,
	pieceTheme: 'img/{piece}.png'
};

gameParams.board = Chessboard('myBoard', gameParams.config);

/**Setup event listeners and initialize engine settings' values**/
$('#undo-btn').click((e) => {
	gameParams.gameState.undo();
	gameParams.chessEngine.postMessage({type: 'undo'});
	const gameEnd = ChessBoardUtil.checkGameEnd(gameParams.gameState);
	if(!gameEnd.gameOver)
		gameParams.gameOver = false;
	gameParams.board.position(gameParams.gameState.fen()); 
	ChessBoardUtil.updateMoves(gameParams.gameState.board(), gameParams.gameState.history());			
});

$('#reset-btn').click((e) => {
	newGame();
});

$('#mkmv').click(async (e) => {
	playWhiteAI();
});

$('#q').click((e) => setPromotion('q'));

$('#r').click((e) => setPromotion('r'));

$('#n').click((e) => setPromotion('n'));

$('#b').click((e) => setPromotion('b'));

$('#sdepth').change((e) => {
	gameParams.searchDepth = parseInt(e.target.value);
});

$('#ecap').change((e) => {
	gameParams.evalCap = parseInt(e.target.value);
});

$('#mply').change((e) => {
	gameParams.maxPly = parseInt(e.target.value);
});

//Initialize The Values
$('#sdepth').val(gameParams.searchDepth);
$('#ecap').val(gameParams.evalCap);
$('#mply').val(gameParams.maxPly);


function handleWokerMessage(e) {
	switch(e.data.type) {
		case 'search':
			let stats = "<br><b>Positions Evaluated: </b> " + e.data.data.nodesEvaluated +  "<br><b>Time taken: </b> " + e.data.data.timeTaken + " minutes";
			$('#other-stats').html(stats);
			gameParams.gameState.move(e.data.data.move);
			ChessBoardUtil.updateMoves(gameParams.gameState.board(), gameParams.gameState.history());
			let gameOver, status;
			({gameOver, status} = ChessBoardUtil.checkGameEnd(gameParams.gameState));
			gameParams.gameOver = gameOver;
			gameParams.board.position(gameParams.gameState.fen());
			$('#thinking-loader').toggleClass('hide');
			document.getElementById('ring').play();
			setTimeout(() => {
				if(gameOver)
					handleGameOver(status);		
			}, 200);
			break;
	}
}

export function newGame() {
	gameParams.gameState.reset();
	gameParams.gameOver = false;
	gameParams.chessEngine.postMessage({type: 'init'});
	gameParams.board.position(gameParams.gameState.fen()); 
	ChessBoardUtil.updateMoves(gameParams.gameState.board(), gameParams.gameState.history());
}

function onDragStart(source, piece, position, orientation) {
	// do not pick up pieces if the game is over
	if (gameParams.gameState.game_over()) return false;

	// only pick up pieces for White
	if (piece.search(/^b/) !== -1) return false;

	// Highlight squares to indicate possible moves
	let moves = gameParams.gameState.moves({
		square: source,
		verbose: true

	});

	if(moves.length === 0) return;

	ChessBoardUtil.greySquare(source);
	moves.forEach(move => ChessBoardUtil.greySquare(move.to));

	return true;
}

function onDrop(source, target) {
	// see if the move is legal
	gameParams.move_cfg = {
		from: source,
		to: target,
		promotion: 'q'
	};

	let move = gameParams.gameState.move(gameParams.move_cfg);

	ChessBoardUtil.removeGreySquares();
	if (move === null) return 'snapback' // Illegal Move

	document.getElementById('ring').play();
	gameParams.gameState.undo();

	if(isPromotion(source, target, gameParams.gameState.board(), gameParams.gameState.turn())) {
		showModal(gameParams.gameState.turn());
		return;
	}

	// make move
	let ret = makeMove();
	if(ret === 'snapback') return 'snapback';
}

function makeMove() {
	let move = gameParams.gameState.move(gameParams.move_cfg);
	if(move === null) return 'snapback'
	gameParams.chessEngine.postMessage({type: 'move', data: gameParams.move_cfg}); // Send the move to the engine so that it can update its state

	ChessBoardUtil.updateMoves(gameParams.gameState.board(), gameParams.gameState.history());
	const gameEnd = ChessBoardUtil.checkGameEnd(gameParams.gameState);
	if(gameEnd.gameOver) {
		gameParams.gameOver = true;
		handleGameOver(gameEnd.status);
	}

	if(!gameParams.gameOver) {
		$('#thinking-loader').toggleClass('hide');
		const searchData = {
			searchDepth: gameParams.searchDepth,
			evalCap: gameParams.evalCap,
			maxPly: gameParams.maxPly
		}
		setTimeout(() => gameParams.chessEngine.postMessage({type: 'search', data: searchData}), 250);
		
	}
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
	gameParams.board.position(gameParams.gameState.fen());
}

function onMouseoutSquare(square, piece) {
	ChessBoardUtil.removeGreySquares();
}

function onMouseoverSquare(square, piece) {
	// Highlight squares to indicate possible moves
	let moves = gameParams.gameState.moves({
		square: square,
		verbose: true

	});

	if(moves.length === 0) return;

	ChessBoardUtil.greySquare(square);
	moves.forEach(move => ChessBoardUtil.greySquare(move.to));
}

function showModal(turn) {
	const width = document.querySelector('.board-b72b1').offsetWidth;
	const offsetLeft = document.querySelector('.board-b72b1').offsetLeft;
	$('#myModal').css('height', width);
	$('#myModal').css('width', width);
	$('#myModal').css('margin-left', offsetLeft);
	$('#myModal').fadeIn();
	$('.pop-inner').fadeIn();
	const imgStr = '/img/';
	$('#q').attr('src', imgStr + turn + 'Q.png');
	$('#r').attr('src', imgStr + turn + 'R.png');
	$('#n').attr('src', imgStr + turn + 'N.png');
	$('#b').attr('src', imgStr + turn + 'B.png');
}

function hideModal() {
	$('#myModal').fadeOut();
	$('.pop-inner').fadeOut();
}

function setPromotion(piece) {
	gameParams.move_cfg.promotion = piece;
	hideModal();
	let ret = makeMove();
	if(ret === 'snapback') return 'snapback';
	gameParams.board.position(gameParams.gameState.fen());
}

async function playWhiteAI() {
	let status;
	$('#thinking-loader').toggleClass('hide');
	const searchData = {
		searchDepth: gameParams.searchDepth,
		evalCap: gameParams.evalCap,
		maxPly: gameParams.maxPly
	}
	gameParams.chessEngine.postMessage({type: 'search', data: searchData});		
}

function handleGameOver(status) {
	switch(status) {
		case ChessBoardUtil.gameEndStatusCode.CHECKMATE_BY_WHITE:
			window.alert("Congratulation, you've won by checkmate");
			break;
		case ChessBoardUtil.gameEndStatusCode.CHECKMATE_BY_BLACK:
			window.alert("AI defeats you by checkmate");
			break;
		case ChessBoardUtil.gameEndStatusCode.STALEMATE:
			window.alert("Game drawn by stalemate"); 
			break;
		case ChessBoardUtil.gameEndStatusCode.THREEFOLD_REP:
			window.alert("Game drawn by threefold repetition"); 
			break;
		case ChessBoardUtil.gameEndStatusCode.INSUFFICIENT_MAT:
			window.alert("Game drawn by insufficient_material"); 
			break;
		case ChessBoardUtil.gameEndStatusCode.FIFTY_MOVE:
			window.alert("Game drawn by fifty-move rule");
			break;
		default:
			window.alert("Game over");
	}
}