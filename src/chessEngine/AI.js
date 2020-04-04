import {searchPosition} from './search';
import HashTable from'./hashTable';

export default class ChessEngine {
	constructor() {
		this.hashTable = new HashTable(125003);
		this.masterAncient = 0;
	}

	makeRandomMove(game) {
		var possibleMoves = game.moves();
		// game over
		if (possibleMoves.length === 0) {
			return {nomoves: true, game};
		}

		var randomIdx = Math.floor(Math.random() * possibleMoves.length);
		game.move(possibleMoves[randomIdx]);
		return {nomoves: false, game};
	}

	makeBestMove(game, maxDepth, evalCap) {
		this.masterAncient = this.masterAncient ? 0 : 1;
		const start = new Date().getTime();
		let bestMove, nodesEvaluated;
		({bestMove, nodesEvaluated} = searchPosition(game, maxDepth, this.hashTable, this.masterAncient));	
		const end = new Date().getTime();

		let stats = "<br><b>Positions Evaluated: </b> " + nodesEvaluated +  "<br><b>Time taken: </b> " + ((end-start)/60000).toPrecision(3) + " minutes";
		console.log(this.hashTable);

		if(!bestMove) 
			return {nomoves: true, game};	

		game.move(bestMove);
		return {nomoves: false, game, stats};
	}
}



