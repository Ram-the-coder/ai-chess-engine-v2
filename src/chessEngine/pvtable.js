import {recomputeZobristHash} from './zobristHash';

export default class PvTable {
	constructor() {
		this.table = {};
	}

	storePvMove(positionHash, move) {
		this.table[positionHash] = move;
	}

	probePvTable(positionHash) {

		if(this.table[positionHash] !== undefined)
			return this.table[positionHash];
		else
			return null;

	}

	getPvLine(game, positionHash, depth) {

		let move = this.probePvTable(positionHash);
		let pvLine = [];
		let count = 0;

		while(move && pvLine.length < depth) {

			positionHash = recomputeZobristHash(positionHash, game.board(), move, game.turn());

			if(game.moves().indexOf(move) !== -1) {

				game.move(move);
				++count;
				pvLine.push(move);

			} else {
				break;
			}
			move = this.probePvTable(positionHash);
		}

		while(count--)
			game.undo();

		return  pvLine;
	}
}