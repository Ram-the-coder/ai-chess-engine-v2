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
import {makeRandomMove} from '../chessEngine/AI';
import {startGame} from '../App';


export function initGUI() {

	$('#undo-btn').click((e) => {
		this.game.undo();
		if(!this.game.turn() === 'w')
			this.game.undo();
		this.board.position(this.game.fen()); 
		ChessBoardUtil.updateMoves(this.game.board(), this.game.history());			
	});

	$('#reset-btn').click((e) => {
		this.game.reset();
		ChessBoardUtil.updateMoves(this.game.board(), this.game.history());
		startGame();
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
		this.searchDepth = e.target.value;
		console.log(searchDepth);
	});

	$('#morder').change((e) => {
	  this.doOrdering = e.target.checked;
	})

	$('#sdepth').val(this.searchDepth);
	$('#morder').prop('checked', this.doOrdering);

	this.board = Chessboard('myBoard', this.config);
	makeMove = makeMove.bind(this);
	setPromotion = setPromotion.bind(this);
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
		window.setTimeout(async() => {
			let status;
			({game: this.game, gameOver: this.gameOver, status} = await letAImakeMove(this.game));
			this.board.position(this.game.fen());
			if(this.gameOver)
				handleGameOver(status);
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

async function letAImakeMove(game) {
	let nomoves;
	({nomoves, game} = await makeRandomMove(game));
	ChessBoardUtil.updateMoves(game.board(), game.history());
	let gameOver, status;
	({gameOver, status} = ChessBoardUtil.checkGameEnd(game));
	return {game, gameOver, status};
}