import wK from '../assets/wikipedia/wK.png';
import wQ from '../assets/wikipedia/wQ.png';
import wB from '../assets/wikipedia/wB.png';
import wN from '../assets/wikipedia/wN.png';
import wR from '../assets/wikipedia/wR.png';
import wP from '../assets/wikipedia/wP.png';
import bK from '../assets/wikipedia/bK.png';
import bQ from '../assets/wikipedia/bQ.png';
import bB from '../assets/wikipedia/bB.png';
import bN from '../assets/wikipedia/bN.png';
import bR from '../assets/wikipedia/bR.png';
import bP from '../assets/wikipedia/bP.png';

import {isPromotion} from '../chessEngine/util';
import * as ChessBoardUtil from './ChessBoardUtil';
import {startGame} from '../App';


export function initGUI() {

	$('#undo-btn').click((e) => {
		this.game.undo();
		this.board.position(this.game.fen()); 
		ChessBoardUtil.updateMoves(this.game.board(), this.game.history());			
	});

	$('#reset-btn').click((e) => {
		this.game.reset();
		ChessBoardUtil.updateMoves(this.game.board(), this.game.history());
		startGame();
	});

	$('#mkmv').click(async (e) => {
		playWhiteAI();
	});

	$('#q').click((e) => {
		setPromotion('q');
	});

	$('#r').click((e) => {
		setPromotion('r');
	});

	$('#n').click((e) => {
		setPromotion('n');	
	});

	$('#b').click((e) => {
		setPromotion('b');	
	});

	$('#sdepth').change((e) => {
		setSearchDepth(parseInt(e.target.value));
	});

	$('#ecap').change((e) => {
		setEvalCap(parseInt(e.target.value));
	});

	$('#mply').change((e) => {
		setMaxPly(parseInt(e.target.value));
	});

	$('#sdepth').val(this.searchDepth);
	$('#ecap').val(this.evalCap);
	$('#mply').val(this.maxPly);

	this.board = Chessboard('myBoard', this.config);
	makeMove = makeMove.bind(this);
	setPromotion = setPromotion.bind(this);
	setSearchDepth = setSearchDepth.bind(this);
	setEvalCap = setEvalCap.bind(this);
	setMaxPly = setMaxPly.bind(this);
	playWhiteAI = playWhiteAI.bind(this);
	letAImakeMove = letAImakeMove.bind(this);
}

function setMaxPly(mply) {
	this.maxPly = mply;
	console.log("Max Ply: " + mply);
}

function setEvalCap(cap) {
	this.evalCap = cap;
	console.log("Eval cap: " + cap);
}

function setSearchDepth(depth) {
	this.searchDepth = depth;
	console.log("depth: " + this.searchDepth);
}

async function playWhiteAI() {
	let status;
	// debugger;
	$('#thinking-loader').toggleClass('hide');
	setTimeout( async () => {
		({game: this.game, gameOver: this.gameOver, status} = await letAImakeMove(this.game, this.searchDepth));
		this.board.position(this.game.fen());
		$('#thinking-loader').toggleClass('hide');
		document.getElementById('ring').play();
		setTimeout(() => {
			if(this.gameOver)
				handleGameOver(status);		
		}, 200);
	}, 250);
	
}

export function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (this.game.game_over()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;

  var moves = this.game.moves({
      square: source,
      verbose: true
  });

  if (moves.length === 0) return;

  ChessBoardUtil.greySquare(source);

  for (var i = 0; i < moves.length; i++) {
      ChessBoardUtil.greySquare(moves[i].to);
  }
  return true;
}

export function onDrop (source, target) {
  // see if the move is legal
  	this.move_cfg = {
		from: source,
		to: target,
		promotion: 'q' // NOTE: always promote to a queen for example simplicity
	};

	var move = this.game.move(this.move_cfg);

	ChessBoardUtil.removeGreySquares();
	// illegal move
	if (move === null) return 'snapback'

	document.getElementById('ring').play();
	this.game.undo();

	if(isPromotion(source, target, this.game.board(), this.game.turn())) {
		showModal(this.game.turn());
		return;
	}

	// make move
	let ret = makeMove();
	if(ret === 'snapback')
		return 'snapback';
}

function makeMove() {
	let move = this.game.move(this.move_cfg);
	if(move === null) return 'snapback'
	ChessBoardUtil.updateMoves(this.game.board(), this.game.history());
	const gameEnd = ChessBoardUtil.checkGameEnd(this.game);
	if(gameEnd.gameOver) {
		this.gameOver = true;
		handleGameOver(gameEnd.status);
	}

	if(!this.gameOver) {

		$('#thinking-loader').toggleClass('hide');
		setTimeout(async () => {
			let status;
			({game: this.game, gameOver: this.gameOver, status} = await letAImakeMove(this.game, this.searchDepth));
			this.board.position(this.game.fen());
			$('#thinking-loader').toggleClass('hide');
			document.getElementById('ring').play();
			setTimeout(() => {
				if(this.gameOver)
					handleGameOver(status);		
			}, 200);
		}, 250);

	}
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

// update the board position after the piece snap
// for castling, en passant, pawn promotion
export function onSnapEnd () {
  this.board.position(this.game.fen());
}

export var onMouseoverSquare = function(square, piece) {
    var moves = this.game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    ChessBoardUtil.greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        ChessBoardUtil.greySquare(moves[i].to);
    }
};

export var onMouseoutSquare = function(square, piece) {
    ChessBoardUtil.removeGreySquares();
};


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
	this.move_cfg.promotion = piece;
	hideModal();
	let ret = makeMove();
	if(ret === 'snapback')
		return 'snapback';
	this.board.position(this.game.fen());
}

async function letAImakeMove(game, searchDepth) {
	let nomoves, stats;
	({nomoves, game, stats} = await this.chessEngine.makeBestMove(game, searchDepth, this.evalCap, this.maxPly));
	$('#other-stats').html(stats);
	ChessBoardUtil.updateMoves(game.board(), game.history());
	let gameOver, status;
	({gameOver, status} = ChessBoardUtil.checkGameEnd(game));
	return {game, gameOver, status};
}