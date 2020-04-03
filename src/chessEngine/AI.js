import {searchPosition} from './search';

export function makeRandomMove(game) {
	var possibleMoves = game.moves();
	// game over
	if (possibleMoves.length === 0) {
		return {nomoves: true, game};
	}

	var randomIdx = Math.floor(Math.random() * possibleMoves.length);
	game.move(possibleMoves[randomIdx]);
	return {nomoves: false, game};
}

export function makeBestMove(game, maxDepth) {
	const bestMove = searchPosition(game, maxDepth);	
	if(!bestMove) 
		return {nomoves: true, game};	

	game.move(bestMove);
	return {nomoves: false, game};
}

