const pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

const pawnEvalBlack = pawnEvalWhite.slice().reverse();

const knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];
const bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

const rookEvalBlack = rookEvalWhite.slice().reverse();

const bishopEvalBlack = bishopEvalWhite.slice().reverse();

const evalQueen =
    [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];


const kingEvalBlack = kingEvalWhite.slice().reverse();


export function getPieceValue(piece, i, j) {
  function getAbsoluteValue(piece, isWhite, i, j) {
    switch(piece.type) {
      case 'p': return 10 +  (i !== undefined ? (isWhite ? pawnEvalWhite[i][j] : pawnEvalBlack[i][j]) : 0);
      case 'r': return 50 + (i !== undefined ? (isWhite ? rookEvalWhite[i][j] : rookEvalBlack[i][j]) : 0);
      case 'n': return 30 + (i !== undefined ? knightEval[i][j] : 0);
      case 'b': return 30 + (i !== undefined ? (isWhite ? bishopEvalBlack[i][j] : bishopEvalBlack[i][j]) : 0);
      case 'q': return 90 + (i !== undefined ? evalQueen[i][j] : 0);
      case 'k': return 900 +  (i !== undefined ? (isWhite ? kingEvalWhite[i][j] : kingEvalBlack[i][j]) : 0);
      default: console.error("Unknown piece type " + piece, i); return 0;
    } 
  }
  if(piece === null)
    return 0;

  const absVal = getAbsoluteValue(piece, piece.color === 'w', i, j);
  return piece.color === 'w' ? absVal : -absVal;
}

export function evalBoard(board) {
  let points = 0;
  for(let i=0; i<8; ++i) {
    for(let j=0; j<8; ++j) {
      // console.log('piece[' + i + '][' + j + '] = ' + getPieceValue(board[i][j], i, j));
      points += getPieceValue(board[i][j], i, j);
    }
  }
  return points;
}

export function getCoords(square) {
  let col = square[0]; //a-h => 0-7
  let row = square[1]; //1-8 => 7-0
  return {
    i: 8 - (row - '0'),
    j: col.charCodeAt(0) - ('a').charCodeAt(0)
  }
}

export function calculatePointsByPiece(board) {
  let points = 0;
  for(let i=0; i<8; ++i) {
    for(let j=0; j<8; ++j) {
      if(board[i][j]) {
        let pt=0;
        switch(board[i][j].type) {
          case 'p': pt = 10; break;
          case 'r': pt = 50; break;
          case 'b': pt = 30; break;
          case 'n': pt = 30; break;
          case 'q': pt = 90; break;
          case 'k': break;
        }
        if(board[i][j].color === 'b')
          pt = -pt;
        points += pt;
      }
    }
  }
  return points;
}

export function isPromotion(source, target, board, turn) {
  const toSquare = getCoords(target);
  const fromSquare = getCoords(source);
  // console.log(toSquare, fromSquare, board[fromSquare.i][fromSquare.j]);
  const isP = (turn === 'w' 
                && toSquare.i === 0 
                && fromSquare.i === 1 
                && board[fromSquare.i][fromSquare.j] 
                && board[fromSquare.i][fromSquare.j].type === 'p'
                && board[fromSquare.i][fromSquare.j].color === 'w'
                ) || (turn === 'b' 
                && toSquare.i === 7 
                && fromSquare.i === 6 
                && board[fromSquare.i][fromSquare.j] 
                && board[fromSquare.i][fromSquare.j].type === 'p'
                && board[fromSquare.i][fromSquare.j].color === 'b'
                );
  return isP;
}