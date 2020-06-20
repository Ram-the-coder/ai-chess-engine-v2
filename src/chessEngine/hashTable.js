import {recomputeZobristHash} from './zobristHash';

// Transposition Table / PV Table
const HFNONE = 0;
const HFALPHA = 1;
const HFBETA = 2;
const HFEXACT = 3;


export default class HashTable {
	constructor(size) {
		this.table = new Array(size);
		this.qtable = new Array(size);
		this.size = size;
		this.hit = 0;
		this.miss = 0;
		this.qhit = 0;
		this.qmiss = 0;
		this.us = 0;
		this.qus = 0;
	}

	storeHashEntry(bestMove, zobristKey, val, flags, depth, masterAncient) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;
		if(this.table[hash] === undefined) {
			this.table[hash] = new HashEntry(bestMove, zobristKey, val, flags, depth, masterAncient);
			return true;
		}
		else {
			if(zobristKey !== this.table[hash].zobristKey) {
				for(let i=1; i<=5; ++i) {
					if(this.table[hash+i] === undefined || (this.table[hash+i] && this.table[hash+i].ancient !== masterAncient)) {
						this.table[hash] = new HashEntry(bestMove, zobristKey, val, flags, depth, masterAncient);
						return true;	
					}
				}
				this.us++;
				return false;
			}

			if(this.table[hash].depth >= depth) {
				this.us++;
				return false;
			}

			this.table[hash] = new HashEntry(bestMove, zobristKey, val, flags, depth, masterAncient);
			return true;	
			
		}
	}

	probeHashEntry(zobristKey, alpha, beta, depth) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;
		if(this.table[hash] === undefined) {
			this.miss++;
			return {hit: false};
		}

		let found = false;
		if(this.table[hash].zobristKey !== zobristKey) {
			for(let i=1; i<=5; ++i) {
				if(this.table[hash+i] && this.table[hash+i].zobristKey === zobristKey) {
					//hit
					found = true;
					break;
				}
			}
			if(!found) {
				this.miss++;
				return {hit: false};
			}
		}

		if((this.table[hash].depth < depth) || (this.table[hash].flags < HFALPHA) || (this.table[hash].flags > HFEXACT)) {
			this.miss++;
			return {hit: false};
		}
		
		let score = this.table[hash].val;

		switch(this.table[hash].flags) {
			case HFEXACT: {
				this.hit++;
				return {hit: true, val: score};
			}
			case HFALPHA:
				if(score <= alpha) {
					score = alpha;
					this.hit++;
					return {hit: true, val: score};
				}
			case HFBETA:
				if(score >= beta) {
					score = beta;
					this.hit++;
					return {hit: true, val: score}
				}
			default: {
				this.miss++;
				return {hit: false};
			}
		}

		this.miss++;
		return {hit: false};

	}

	probePvMove(zobristKey) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;

		if(this.table[hash] === undefined) {
			this.miss++;
			return null;
		}

		let found = false;
		if(this.table[hash].zobristKey !== zobristKey) {
			for(let i=1; i<=5; ++i) {
				if(this.table[hash+i] && this.table[hash+i].zobristKey === zobristKey) {
					this.hit++;
					found = true;
					break;
				}
			}

			if(!found) {
				this.miss++;
				return null;
			}
		}

		this.hit++;
		return this.table[hash].bestMove;
	}

	probePvLine(game, zobristKey) {
		let pvLine = [];
		let pvMove;
		let count = 0;
		while(true) {
			pvMove = this.probePvMove(zobristKey);
			if(pvMove === null) break;
			pvLine.push(pvMove);
			const board = game.board(), turn = game.turn();
			if(game.move(pvMove) === null) break;
			zobristKey = recomputeZobristHash(zobristKey, board, pvMove, turn);
			++count;
		}

		while(count > 0) {
			game.undo();
			--count;
		}

		return pvLine;
	}

	storeQuiescenceHashEntry(bestMove, zobristKey, val, masterAncient) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;
		if(this.qtable[hash] === undefined) {
			this.qtable[hash] = new QuiescenceHashEntry(bestMove, zobristKey, val, masterAncient);
			return true;
		}
		else {
			if(zobristKey !== this.qtable[hash].zobristKey) {
				for(let i=1; i<=5; ++i) {
					if(this.qtable[hash+i] === undefined || (this.qtable[hash+i] && this.qtable[hash+i].ancient !== masterAncient)) {
						this.qtable[hash] = new QuiescenceHashEntry(bestMove, zobristKey, val, masterAncient);
						return true;	
					}
				}
				this.qus++;
				return false;
			}

			this.qtable[hash] = new QuiescenceHashEntry(bestMove, zobristKey, val, masterAncient);
			return true;	
		}
	}

	probeQuiescencePvMove(zobristKey) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;

		if(this.qtable[hash] === undefined) {
			this.qmiss++;
			return null;
		}

		let found = false;
		if(this.qtable[hash].zobristKey !== zobristKey) {
			for(let i=1; i<=5; ++i) {
				if(this.qtable[hash+i] && this.qtable[hash+i].zobristKey === zobristKey) {
					found = true;
					break;
				}
			}

			if(!found) {
				this.miss++;
				return null;
			}
		}

		this.qhit++;
		return this.qtable[hash].bestMove;
	}

}

class QuiescenceHashEntry {
	constructor(bestMove, zobristKey, val, ancient) {
		this.bestMove = bestMove;
		this.zobristKey = zobristKey;
		this.val = val;
		this.ancient = ancient;
	}
}

class HashEntry {
	constructor(bestMove, zobristKey, val, flags, depth, ancient) {
		this.bestMove = bestMove;
		this.zobristKey = zobristKey;
		this.val = val;
		this.flags = flags;
		this.depth = depth;
		this.ancient = ancient;
	}
}