// Transposition Table / PV Table
const HFNONE = 0;
const HFALPHA = 1;
const HFBETA = 2;
const HFEXACT = 3;


export default class HashTable {
	constructor(size) {
		this.table = new Array(size);
		this.size = size;
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
				return false;
			}

			if(this.table[hash].depth >= depth)
				return false;

			this.table[hash] = new HashEntry(bestMove, zobristKey, val, flags, depth, masterAncient);
			return true;	
			
		}
	}

	probeHashEntry(zobristKey, alpha, beta, depth) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;
		if(this.table[hash] === undefined)
			return {hit: false};

		let found = false;
		if(this.table[hash].zobristKey !== zobristKey) {
			for(let i=1; i<=5; ++i) {
				if(this.table[hash+i] && this.table[hash+i].zobristKey === zobristKey) {
					//hit
					found = true;
					break;
				}
			}
			if(!found)
				return {hit: false};
		}

		if((this.table[hash].depth < depth) || (this.table[hash].flags < HFALPHA) || (this.table[hash].flags > HFEXACT))
			return {hit: false};
		
		let score = this.table[hash].val;

		switch(this.table[hash].flags) {
			case HFEXACT:
				return {hit: true, val: score};
			case HFALPHA:
				if(score <= alpha) {
					score = alpha;
					return {hit: true, val: score};
				}
			case HFBETA:
				if(score >= beta) {
					score = beta;
					return {hit: true, val: score}
				}
			default: return {hit: false};
		}

		return {hit: false};

	}

	probePvMove(zobristKey) {
		if(zobristKey < 0)
			zobristKey += Math.pow(2, 53) - 1;
		const hash = zobristKey % this.size;

		if(this.table[hash] === undefined)
			return null;

		let found = false;
		if(this.table[hash].zobristKey !== zobristKey) {
			for(let i=1; i<=5; ++i) {
				if(this.table[hash+i] && this.table[hash+i].zobristKey === zobristKey) {
					found = true;
					break;
				}
			}

			if(!found)
				return null;
		}

		return this.table[hash].bestMove;
	}

	getPvLine(zobristKey, game) {

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