import {evalBoard, getCoords, getPieceValue, isCapture} from './util';
// import PvTable from './pvtable';
import KillerTable from './killer';
import HistoryHeuristic from './historyHeuristic';
import {recomputeZobristHash, computeZobristHash} from './zobristHash';

const HFNONE = 0;
const HFALPHA = 1;
const HFBETA = 2;
const HFEXACT = 3;

export function searchPosition(game, searchDepth, hashTable, masterAncient) {
	// Iterative Deepening
	let bestMove;
	let bestScore = -Infinity;
	let currentDepth ;
	let nodesEvaluated = 0;
	// let pvtable = new PvTable();
	let killerTable = new KillerTable(3);
	let historyHeuristic = new HistoryHeuristic();
	let fh = 0, fhf = 0;
	const MAX_PLY = 10;


	startSearch(game);

	return bestMove;

	function startSearch(game) {

		for(currentDepth = 1; currentDepth <= searchDepth; ++currentDepth) {

			const hash = computeZobristHash(game.board());

			const bestStats = miniMax(-Infinity, Infinity, currentDepth, game, hash, 0);
			bestScore = bestStats.val;
			// console.log()
			// pvMoves = pvtable.getPvLine(game, hash, currentDepth);
			bestMove = hashTable.probePvMove(hash);
			console.log({perf: fhf/fh, currentDepth, bestScore, bestMove, nodesEvaluated, detail: bestStats.detail});
		}

	}

	function orderMoves(moves, hash, game) {
		let board = game.board();
		let turn = game.turn();
		let history = game.history();
		let prevMove = history[history.length - 1];
		let orderedMoves = [];
		let pvMove = hashTable.probePvMove(hash);
		moves.forEach(move => {
			const newhash = recomputeZobristHash(hash, board, move, turn);
			let bonus = 0;

			if(pvMove && move === pvMove)
				bonus += 10000000;
			else if(hashTable.probePvMove(newhash))
				bonus += 5000000;

			const gameBoard = game.board();
			let pieceBeingMoved = {};
			switch(move[0]) {
				case 'K': pieceBeingMoved.type = 'k'; break;
				case 'Q': pieceBeingMoved.type = 'q'; break;
				case 'B': pieceBeingMoved.type = 'b'; break;
				case 'N': pieceBeingMoved.type = 'n'; break;
				case 'R': pieceBeingMoved.type = 'r'; break;
				default: pieceBeingMoved.type = 'p'; break;
			}
		
			if(move.search(/\+/) !== -1)
				bonus += 10;
			if(isCapture(move)) {
				let startIndex = move.search(/[a-h][1-8]/);
				let toSquare = move.slice(startIndex, startIndex+2);
				let toSquareCoords = getCoords(toSquare);
				let capturedPiece = gameBoard[toSquareCoords.i][toSquareCoords.j]; 
				bonus += (Math.abs(getPieceValue(pieceBeingMoved)*10) - Math.abs(getPieceValue(capturedPiece)))*100;
				if(prevMove) {
					startIndex = prevMove.search(/[a-h][1-8]/);
					let squareOfPieceMovedByOpponent = prevMove.slice(startIndex, startIndex+2);
					if(squareOfPieceMovedByOpponent === toSquare)
						bonus += 100100;	
				}
			} else {
				const killers = killerTable.getKillerMoves(history.length);
				if(killers) {
					for(let i=0; i<killers.length; ++i) {
						if(killers[i].move === move) {
							// console.log("ki/ller")
							bonus += (50 - i)*100;	
						}
					}
				} else {
					bonus += historyHeuristic.getHistoryHeuristic(move, turn);
				}
				
			}
			if(move.search(/0-/) !== -1)
				bonus += 5;				
		
			
			
			orderedMoves.push({
				move,
				bonus,
			})
		})
		orderedMoves.sort((a,b) => b.bonus-a.bonus);
		// console.log(orderedMoves);
		let refinedOrderedMoves = orderedMoves.map(move => move.move);
		return refinedOrderedMoves;	
	}

	function miniMax(alpha, beta, depth, game, hash, ply) {

		const probe = hashTable.probeHashEntry(hash, alpha, beta, depth);

		if(probe.hit) {
			console.log("hit");
			return {val: probe.val};
		}

		if(game.in_checkmate()) {
			// console.log(game.history());
			++nodesEvaluated;
			let val = -10000 + (currentDepth - depth);
			if(game.turn() === 'b')
				val = -val;
			return {val};
		}

		if(game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) { 
			++nodesEvaluated;
			const val = 0;
			return {val};
		}

		if(depth === 0) {
			const val = quiescence(alpha, beta, game, hash, ply);
			// const val = evalBoard(game.board());
			return {val};
		}

		if(ply >= MAX_PLY - 1) {
			const val = evalBoard(game.board());
			return {val};
		}

		let possibleMoves = game.moves();
		possibleMoves = orderMoves(possibleMoves, hash, game);

		if(game.turn() === 'w') {
			// Max
			let score = -Infinity;
			let bestMove;
			let bestScore = -Infinity;
			let oldAlpha = alpha;
			let detail = {};

			for(let i=0; i<possibleMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), possibleMoves[i], game.turn());

				game.move(possibleMoves[i]);
				let moveStats = miniMax(alpha, beta, depth-1, game, newhash, ply+1);
				game.undo();

				score = moveStats.val;
				detail[possibleMoves[i]] = {
					val: score,
					detail: moveStats.detail
				}

				if(score > bestScore) {
					bestScore = score;
					bestMove = possibleMoves[i];

					if(score > alpha) {

						if(score >= beta) {
							++fhf;
							if(!isCapture(possibleMoves[i]))
								killerTable.storeKillerMove(game.history().length, possibleMoves[i]);

							hashTable.storeHashEntry(bestMove, hash, beta, HFBETA, depth, masterAncient);
							return {val: beta, detail};
						}

						++fh;
						alpha = score;
						if(!isCapture(possibleMoves[i]))
							historyHeuristic.updateHistoryHeuristic(possibleMoves[i], depth, game.turn());
						bestMove = possibleMoves[i];
						// console.log({bestMove});
					}
				}

				

			}

			if(alpha != oldAlpha) {
				hashTable.storeHashEntry(bestMove, hash, bestScore, HFEXACT, depth, masterAncient);
			} else {
				hashTable.storeHashEntry(bestMove, hash, alpha, HFALPHA, depth, masterAncient);
			}

			return {val: alpha, detail};

		} else {
			// Min
			let score = Infinity;
			let bestMove;
			let bestScore = Infinity;
			let oldBeta = beta;
			let detail = {};

			for(let i=0; i<possibleMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), possibleMoves[i], game.turn());

				game.move(possibleMoves[i]);
				let moveStats = miniMax(alpha, beta, depth-1, game, newhash, ply+1);
				game.undo();

				score = moveStats.val;
				detail[possibleMoves[i]] = {
					val: score,
					detail: moveStats.detail
				}

				if(score < bestScore) {

					bestScore = score;
					bestMove = possibleMoves[i];

					if(score < beta) {

						if(score <= alpha) {
							++fhf;
							if(!isCapture(possibleMoves[i]))
								killerTable.storeKillerMove(game.history().length, possibleMoves[i]);

							hashTable.storeHashEntry(bestMove, hash, alpha, HFALPHA, depth, masterAncient);
							return {val: alpha, detail}					
						}

						++fh
						beta = score;
						if(!isCapture(possibleMoves[i]))
							historyHeuristic.updateHistoryHeuristic(possibleMoves[i], depth, game.turn());
						bestMove = possibleMoves[i];
					}	
				}
				
			}

			if(beta != oldBeta) {
				hashTable.storeHashEntry(bestMove, hash, bestScore, HFEXACT, depth, masterAncient);
			} else {
				hashTable.storeHashEntry(bestMove, hash, beta, HFBETA, depth, masterAncient);
			}

			return {val: beta, detail};
		}
	} 


	function quiescence(alpha, beta, game, hash, ply) {
		++nodesEvaluated;

		if(game.in_checkmate()) {
			++nodesEvaluated;
			let val = -10000 + (currentDepth);
			if(game.turn() === 'b')
				val = -val;
			return val;
		}

		if(game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) { 
			++nodesEvaluated;
			const val = 0;
			return val;
		}

		let score = evalBoard(game.board());

		let capMoves = game.moves().filter(move => move.search(/x/) !== -1);

		if(capMoves.length === 0 || ply >= MAX_PLY - 1)
			return score;

		if(game.turn() === 'w') {
			// Max
			if(score >= beta) {
				++fhf;
				return beta;
			}

			if(score > alpha) 
				alpha = score;

			let bestMove;
			let oldAlpha = alpha;
			// let detail = {};

			for(let i=0; i<capMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), capMoves[i], game.turn());

				game.move(capMoves[i]);
				score = quiescence(alpha, beta, game, newhash);
				game.undo();

				if(score > alpha) {

					if(score >= beta) {
						++fhf;
						return beta;
					}

					++fh;
					alpha = score;
					bestMove = capMoves[i];
				}

			}

			// if(alpha != oldAlpha) {
			// 	pvtable.storePvMove(hash, bestMove);
			// 	// console.log({player: game.turn(), depth, history: game.history(), detail, bestMove, "miniMax": "max"});
			// }
			return alpha;

		} else {
			// Min

			if(score <= alpha) {
				++fhf;
				return alpha;
			}

			if(score < beta)
				beta = score;

			let bestMove;
			let oldBeta = beta;

			for(let i=0; i<capMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), capMoves[i], game.turn());

				game.move(capMoves[i]);
				score = quiescence(alpha, beta, game, newhash);
				game.undo();

				if(score < beta) {

					if(score <= alpha) {
						++fhf;
						return alpha;
					}

					++fh
					beta = score;
					bestMove = capMoves[i];
				}
			}

			// if(beta != oldBeta) {
			// 	pvtable.storePvMove(hash, bestMove);
			// }

			return beta;
		}
	}

}


