export default class KillerTable {
	constructor(maxKillers) {
		this.table = {};
		this.maxKillers = maxKillers;
	}

	storeKillerMove(ply, move) {
		if(this.table[ply] === undefined) {
			this.table[ply] = [{
				move,
				weight: 1
			}];
		} else {
			let killers = this.table[ply];
			let found = false;

			for(let i=0; i<killers.length; ++i) {
				if(killers[i].move === move) {
					killers[i].weight++;
					found = true;
					break;
				}
			}

			killers.sort((a,b) => b.weight - a.weight);
			killers = killers.splice(0, this.maxKillers-1);

			if(!found) {
				killers.push({
					move,
					weight: 1
				});
				killers.sort((a,b) => b.weight - a.weight);	
			}

			this.table[ply] = killers;
		}
	}

	getKillerMoves(ply) {
		return this.table[ply];
	}
}