import {evalBoard, getCoords, getPieceValue, isCapture} from './util';
import PvTable from './pvtable';
import KillerTable from './killer';
import HistoryHeuristic from './historyHeuristic';
import {recomputeZobristHash, computeZobristHash} from './zobristHash';

export function searchPosition(game, maxDepth) {
	// Iterative Deepening
	let bestMove;
	let bestScore = -Infinity;
	let currentDepth ;
	let pvMoves = [];
	let pvNum;
	let nodesEvaluated = 0;
	let pvtable = new PvTable();
	let killerTable = new KillerTable(3);
	let historyHeuristic = new HistoryHeuristic();
	let fh = 0, fhf = 0;

	startSearch(game);

	return bestMove;

	function startSearch(game) {

		for(currentDepth = 1; currentDepth <= maxDepth; ++currentDepth) {

			const hash = computeZobristHash(game.board());

			const bestStats = miniMax(-Infinity, Infinity, currentDepth, game, hash);
			bestScore = bestStats.val;

			pvMoves = pvtable.getPvLine(game, hash, currentDepth);
			bestMove = pvMoves[0];
			console.log({currentDepth, bestScore, bestMove, pvMoves, nodesEvaluated, detail: bestStats.detail, perf: fhf/fh});
		}

	}

	function orderMoves(moves, hash, game) {
		let board = game.board();
		let turn = game.turn();
		let history = game.history();
		let prevMove = history[history.length - 1];
		let orderedMoves = [];
		let pvMove = pvtable.probePvTable(hash);
		moves.forEach(move => {
			const newhash = recomputeZobristHash(hash, board, move, turn);
			let bonus = 0;

			if(move === pvMove)
				bonus += 10000000;
			else if(pvtable.probePvTable(newhash))
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

	function miniMax(alpha, beta, depth, game, hash) {

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
			const val = quiescence(alpha, beta, game, hash);
			return {val};
		}

		let possibleMoves = game.moves();
		possibleMoves = orderMoves(possibleMoves, hash, game);

		if(game.turn() === 'w') {
			// Max
			let score = -Infinity;
			let bestMove;
			let oldAlpha = alpha;
			let detail = {};

			for(let i=0; i<possibleMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), possibleMoves[i], game.turn());

				game.move(possibleMoves[i]);
				let moveStats = miniMax(alpha, beta, depth-1, game, newhash);
				game.undo();

				score = moveStats.val;
				detail[possibleMoves[i]] = {
					val: score,
					detail: moveStats.detail
				}

				if(score > alpha) {

					if(score >= beta) {
						++fhf;
						if(!isCapture(possibleMoves[i]))
							killerTable.storeKillerMove(game.history().length, possibleMoves[i]);
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

			if(alpha != oldAlpha) {
				pvtable.storePvMove(hash, bestMove);
				// console.log({player: game.turn(), depth, history: game.history(), detail, bestMove, "miniMax": "max"});
			}

			return {val: alpha, detail};

		} else {
			// Min
			let score = Infinity;
			let bestMove;
			let oldBeta = beta;
			let detail = {};

			for(let i=0; i<possibleMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), possibleMoves[i], game.turn());

				game.move(possibleMoves[i]);
				let moveStats = miniMax(alpha, beta, depth-1, game, newhash);
				game.undo();

				score = moveStats.val;
				detail[possibleMoves[i]] = {
					val: score,
					detail: moveStats.detail
				}


				if(score < beta) {

					if(score <= alpha) {
						++fhf;
						if(!isCapture(possibleMoves[i]))
							killerTable.storeKillerMove(game.history().length, possibleMoves[i]);
						return {val: alpha, detail}					
					}

					++fh
					beta = score;
					if(!isCapture(possibleMoves[i]))
						historyHeuristic.updateHistoryHeuristic(possibleMoves[i], depth, game.turn());
					bestMove = possibleMoves[i];
				}
			}

			if(beta != oldBeta) {
				pvtable.storePvMove(hash, bestMove);
				// console.log({player: game.turn(), depth, history: game.history(), detail, bestMove,"miniMax": "min"});
			}

			return {val: beta, detail};
		}
	} 


	function quiescence(alpha, beta, game, hash) {
		++nodesEvaluated;

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

		let score = evalBoard(game.board());

		if(score >= beta)
			return beta;

		if(score > alpha)
			alpha = score;

		let capMoves = game.moves().filter(move => move.search(/x/) !== -1);

		if(game.turn() === 'w') {
			// Max
			// let score = -Infinity;
			let bestMove;
			let oldAlpha = alpha;
			// let detail = {};

			for(let i=0; i<capMoves.length; ++i) {

				let newhash = recomputeZobristHash(hash, game.board(), capMoves[i], game.turn());

				game.move(capMoves[i]);
				score = quiescence(alpha, beta, game, newhash);
				game.undo();

				// score = moveStats.val;
				// detail[possibleMoves[i]] = {
				// 	val: score,
				// 	detail: moveStats.detail
				// }

				if(score > alpha) {

					if(score >= beta) {
						++fhf;
						// return {val: beta, detail};
						return beta;
					}

					++fh;
					alpha = score;
					bestMove = capMoves[i];
				}

			}

			if(alpha != oldAlpha) {
				pvtable.storePvMove(hash, bestMove);
				// console.log({player: game.turn(), depth, history: game.history(), detail, bestMove, "miniMax": "max"});
			}

			return alpha;
		} else {
			// Min
			// let score = Infinity;
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

			if(beta != oldBeta) {
				pvtable.storePvMove(hash, bestMove);
			}

			return beta;
		}
	}

	// function alphaBeta(alpha, beta, depth, game, hash) {
	// 	// console.log("ab");
	// 	if(depth === 0) {
	// 		const val = evalBoard(game.board());
	// 		++nodesEvaluated;
	// 		return {val};
	// 	}

	// 	if(game.in_checkmate()) {
	// 		++nodesEvaluated;
	// 		const val = -10000 + (currentDepth - depth);
	// 		return {val};
	// 	}

	// 	if(game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) { 
	// 		++nodesEvaluated;
	// 		const val = 0;
	// 		return {val};
	// 	}

	// 	let possibleMoves = game.moves();
	// 	let score = -Infinity;
	// 	let bestMove;
	// 	let oldAlpha = alpha;
	// 	let detail = {};
	// 	for(let i=0; i<possibleMoves.length; ++i) {
	// 		let newhash = recomputeZobristHash(hash, game.board(), possibleMoves[i], game.turn())

	// 		game.move(possibleMoves[i]);
	// 		const moveStats = alphaBeta(-beta, -alpha, depth-1, game, newhash);
	// 		game.undo();

	// 		score = -moveStats.val;
	// 		detail[possibleMoves[i]] = {
	// 			val: score,
	// 			detail: moveStats.detail
	// 		};

	// 		if(score > alpha) {
	// 			if(score >= beta) {
	// 				return {val: beta, detail};
	// 			}

	// 			alpha = score;
	// 			bestMove = possibleMoves[i];
	// 		}
	// 	}

	// 	if(alpha != oldAlpha) {
	// 		console.log({player: game.turn(), depth, history: game.history(), detail, bestMove});
	// 		pvtable.storePvMove(hash, bestMove);
	// 	}

	// 	return {
	// 		val: alpha,
	// 		detail
	// 	};
	// }

}


