import {searchPosition} from './search';
import HashTable from'./hashTable';

export default class ChessEngine {
	constructor() {
		this.hashTable = new HashTable(125003);
		this.masterAncient = 0;
	}

	getRandomMove(game) {
		var possibleMoves = game.moves();
		// game over
		if (possibleMoves.length === 0) {
			return {nomoves: true, game};
		}

		var randomIdx = Math.floor(Math.random() * possibleMoves.length);
		return {nomoves: false, move: possibleMoves[randomIdx]};
	}

	getBestMove(game, maxDepth, evalCap, maxPly) {
		this.masterAncient = this.masterAncient ? 0 : 1;
		const start = new Date().getTime();
		let bestMove, nodesEvaluated, pvLine;
		({bestMove, nodesEvaluated, pvLine} = searchPosition(game, maxDepth, this.hashTable, this.masterAncient, evalCap, maxPly));	
		const end = new Date().getTime();
		const timeTaken = ((end-start)/60000).toPrecision(3);
		// console.log(this.hashTable);
		return bestMove ? {nomoves: false, move: bestMove, pvLine, timeTaken, nodesEvaluated} : {nomoves: true};
	}
}



