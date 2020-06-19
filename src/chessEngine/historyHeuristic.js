import {findToSquare, getPieceTableIndex } from './util';



export default class HistoryHeuristic {
	constructor() {
		this.table = new Array(14);
		for(let i=0; i<14; ++i) {
			this.table[i] = new Array(64);
			for(let j=0; j<64; ++j)
				this.table[i][j] = 0;
		}
	}

	updateHistoryHeuristic(move, depth, turn) {
		let piece = getPieceTableIndex(move, turn);
		let toSquare;
		if(piece < 12)
			toSquare = findToSquare(move, turn);
		else
			toSquare = {i:0, j:0};

		const toSquareIdx = toSquare.i * 8 + toSquare.j;
		this.table[piece][toSquareIdx] += depth * depth;
	}

	getHistoryHeuristic(move, turn) {
		try {
			let piece = getPieceTableIndex(move, turn);
			let toSquare;
			if(piece < 12)
				toSquare = findToSquare(move, turn);
			else
				toSquare = {i:0, j:0};

			const toSquareIdx = toSquare.i * 8 + toSquare.j;

			return this.table[piece][toSquareIdx];
		} catch(e) {
			debugger;
		}
	}
}