import {findFromSquare, getCoords} from './util';

export let piecePositionValue = new Array(12);
const pieceTableIndex = {
	'r': 0,
	'n': 1,
	'b': 2,
	'q': 3,
	'k': 4,
	'p': 5
}
let collisionCheck = {};
for(var i=0; i<12; ++i) {
	piecePositionValue[i] = new Array(64);
	for(var j=0; j<64; ++j) {
		var randNum = Math.random()*Math.pow(2, 53);
		while(collisionCheck[randNum] !== undefined)
			randNum = Math.random()*Math.pow(2, 53);
		collisionCheck[randNum] = 1;
		piecePositionValue[i][j] = randNum;
	}
}
collisionCheck = {};

export function getHashValueOfPiece(piece, i, j) {
	if(piece === null)
		return 0;
	else
		return piecePositionValue[pieceTableIndex[piece.type] + (piece.color === 'w' ? 0 : 6)][i*8+j];
}

export function computeZobristHash(board) {
	let hash = 0;
	for(var i=0; i<8; ++i) 
		for(var j=0; j<8; ++j) {
			hash ^= getHashValueOfPiece(board[i][j], i, j);
		}
	return hash;
}

export function recomputeZobristHash(hash, board, move, turn) {
	let isWhite = turn === 'w';
	if(move.search(/=/) !== -1) {
		const toSquare = getCoords(move.slice(0, 2));
		const toPiece = {};
		let startInd = move.search(/=[QRNB]/);
		if(startInd === -1)
			console.error("Promotion piece not found");
		toPiece.type = (move.slice(startInd+1, startInd+2)).toLowerCase();
		toPiece.color = turn;
		const pawn = {type: 'p', color: turn}
		hash ^= isWhite ? getHashValueOfPiece(pawn, toSquare.i+1, toSquare.j) : getHashValueOfPiece(pawn, toSquare.i-1, toSquare.j);
		hash ^= isWhite ? getHashValueOfPiece(toPiece, toSquare.i, toSquare.j) : getHashValueOfPiece(toPiece, toSquare.i, toSquare.j);
		return hash;
	}
	if(move.search(/O-O-O/) !== -1) {
		const king = {type: 'k', color: turn};
		const rook = {type: 'r', color: turn};
		hash ^= isWhite ? getHashValueOfPiece(king, 7, 4) : getHashValueOfPiece(king, 0, 4);
		hash ^= isWhite ? getHashValueOfPiece(rook, 7, 0) : getHashValueOfPiece(rook, 0, 0);
		hash ^= isWhite ? getHashValueOfPiece(king, 7, 2) : getHashValueOfPiece(king, 0, 2);
		hash ^= isWhite ? getHashValueOfPiece(rook, 7, 3) : getHashValueOfPiece(rook, 0, 3);
		return hash;
	} else if(move.search(/O-O/) !== -1) {
		const king = {type: 'k', color: turn};
		const rook = {type: 'r', color: turn};
		hash ^= isWhite ? getHashValueOfPiece(king, 7, 4) : getHashValueOfPiece(king, 0, 4);
		hash ^= isWhite ? getHashValueOfPiece(rook, 7, 7) : getHashValueOfPiece(rook, 0, 7);
		hash ^= isWhite ? getHashValueOfPiece(king, 7, 6) : getHashValueOfPiece(king, 0, 6);
		hash ^= isWhite ? getHashValueOfPiece(rook, 7, 5) : getHashValueOfPiece(rook, 0, 5);
		return hash;
	} else {
		let piece = {};
		let startInd = move.search(/[KQNRB]([a-h]|[1-8])?x?[a-h][1-8]/);
		if(startInd === -1)
			piece.type = 'p';
		else
			piece.type = move[0].toLowerCase();

		piece.color = turn;

		startInd = move.search(/[a-h][1-8]/);
		const toSquare = getCoords(move.slice(startInd, startInd+2));
		const fromSquare = findFromSquare(board, move, turn);
		startInd = move.search(/x/);
		const isCapture = startInd !== -1;
		const checkSq = { // For enpassant
			i: toSquare.i + (isWhite ? 1 : -1),
			j: toSquare.j
		}
		let isEnp = false;
		if(isCapture) {
			if(piece.type === 'p' && board[checkSq.i][checkSq.j] && !board[toSquare.i][toSquare.j] && board[checkSq.i][checkSq.j].type === 'p' && board[checkSq.i][checkSq.j].color === turn) {
				isEnp = true;
				hash ^= getHashValueOfPiece(board[checkSq.i][checkSq.j], checkSq.i, checkSq.j);
			} else {
				hash ^= getHashValueOfPiece(board[toSquare.i][toSquare.j], toSquare.i, toSquare.j);
			}
		}
		hash ^= getHashValueOfPiece(piece, fromSquare.i, fromSquare.j);
		hash ^= getHashValueOfPiece(piece, toSquare.i, toSquare.j);
		return hash;
	}
}