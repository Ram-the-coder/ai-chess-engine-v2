import Chess from './chessEngine/chess.js/chess.js';
import * as ChessBoard from './chessboard/ChessBoard';
import ChessEngine from './chessEngine/AI';

let gameParams = {}
let onDragStart, onDrop, onSnapEnd, onMouseoverSquare, onMouseoutSquare, initGUI;

// let board, move_cfg, gameOver;
// let table, killerMoves, maxKillerMoves, foundNextBestMove;
// let startFEN, game;
// let searchDepth, doOrdering, useTranspositionTable;
// let config

export function startGame() {
	initVariables();
	initGUI();
}


function initVariables() {
	gameParams.board = null
	gameParams.table = {}
	gameParams.gameOver = false;
	gameParams.killerMoves = Array(300);
	gameParams.maxKillerMoves = 3;
	gameParams.searchDepth = 3;
	gameParams.doOrdering = true;
	gameParams.useTranspositionTable = true;
	gameParams.move_cfg = {};
	gameParams.chessEngine = new ChessEngine();

	gameParams.game = new Chess();

	// startFEN = "8/8/8/8/8/8/2K2pk1/8 w - - 0 1";
	// gameParams.startFEN = "8/6B1/1p2p3/3BN2R/3kp1P1/QPRN4/8/1K6 w - - 0 1";
	if(gameParams.startFEN !== undefined) {
		console.log(gameParams.game.load(gameParams.startFEN));
		console.log(gameParams.game.ascii());
	}

	onDragStart = ChessBoard.onDragStart.bind(gameParams);
	onDrop = ChessBoard.onDrop.bind(gameParams);
	onSnapEnd =  ChessBoard.onSnapEnd.bind(gameParams);
	onMouseoverSquare =  ChessBoard.onMouseoverSquare.bind(gameParams);
	onMouseoutSquare =  ChessBoard.onMouseoutSquare.bind(gameParams);
	initGUI = ChessBoard.initGUI.bind(gameParams);

	gameParams.config = {
		draggable: true,
		position: gameParams.startFEN !== undefined ? gameParams.startFEN : 'start',
		onDragStart: onDragStart,
		onDrop: onDrop,	
		onSnapEnd: onSnapEnd,
		onMouseoutSquare: onMouseoutSquare,
		onMouseoverSquare: onMouseoverSquare,
		pieceTheme: 'img/{piece}.png',
	}
	// debugger;
}