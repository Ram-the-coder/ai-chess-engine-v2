import {calculatePointsByPiece} from '../chessEngine/util';

export function updateMoves(board, history) {
  let str = "";
  let count=1;
  history.forEach((move, index) => {
    str += " ";
    if(index % 2 == 0)
      str += (count++) + ".";
    str += move;
    if(index % 2)
      str += "&nbsp";
  });
  $('#moves').html(str);
  $('#points').html(calculatePointsByPiece(board));
}

export var removeGreySquares = function() {
    $('#myBoard .square-55d63').css('background', '');
};

export var greySquare = function(square) {
    var squareEl = $('#myBoard .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

export function makeMove(game, move_cfg) {
	let move = game.move(move_cfg);
	// if(move === null) return 'snapback';
	if(move === null) return {valid: false}
	updateMoves(game.board(), game.history());
	const gameEnd = checkGameEnd(game);
	return gameEnd.gameOver ? {valid: true, gameEnd} : {valid: true, game, gameEnd};
}

export const gameEndStatusCode = {
	CHECKMATE_BY_WHITE: 1,
	CHECKMATE_BY_BLACK: 2,
	STALEMATE: 3,
	THREEFOLD_REP: 4,
	INSUFFICIENT_MAT: 5,
	FIFTY_MOVE: 6
}

export function checkGameEnd(game) {
	let gameOver = true;
	let status;
	if(game.in_checkmate()) {
		// endedByPlayer ? window.alert("Congratulation, you've won by checkmate") : window.alert("AI defeats you by checkmate");
		status = game.turn() === 'b' ? gameEndStatusCode.CHECKMATE_BY_WHITE : gameEndStatusCode.CHECKMATE_BY_BLACK;
	} else if(game.in_stalemate()) { 
		// window.alert("Game drawn by stalemate"); 
		status = gameEndStatusCode.STALEMATE;
	} else if(game.in_threefold_repetition()) {
		// window.alert("Game drawn by threefold repetition"); 
		status = gameEndStatusCode.THREEFOLD_REP;
	} else if(game.insufficient_material()) {
		// window.alert("Game drawn by insufficient_material"); 
		status = gameEndStatusCode.INSUFFICIENT_MAT;
	} else if(game.in_draw()) {
		//50-move rule
		status = gameEndStatusCode.FIFTY_MOVE;
	} else {
		gameOver = false;
	}
	return {gameOver, status};
}	

