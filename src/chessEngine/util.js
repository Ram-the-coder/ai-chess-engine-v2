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
          default: console.error("This should not happen"); break;
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

export function isCapture(move) {
    return move.search(/x/) !== -1;
}

export function findToSquare(move, turn) {
  // debugger;
  if(move.search('O-O') !== -1) return turn === 'w' ? {i: 7, j: 6} : {i: 0, j: 6};
  if(move.search('O-O-O') !== -1) return turn === 'w' ? {i: 7, j: 2} : {i: 0, j: 2};
  let startInd = move.search(/[a-h][1-8]/);
  if(startInd === -1) 
    return null; //castling
  const toSquare = getCoords(move.slice(startInd, startInd+2));
  return toSquare;
}

export function getPieceTableIndex(move, turn) {
  // Assuming move is not castling or such non-standard moves
  const pieceTableIndex = {
    'r': 0,
    'n': 1,
    'b': 2,
    'q': 3,
    'k': 4,
    'p': 5
  }

  const isCastlingMove = isCastling(move);
  if(isCastlingMove !== -1)
    return isCastlingMove;

  let startInd = move.search(/[KQNRB]([a-h]|[1-8])?x?[a-h][1-8]/);
  if(startInd === -1)
    return turn === 'w' ? pieceTableIndex['p'] : pieceTableIndex['p'] + 6;
  else
    return turn === 'w' ? pieceTableIndex[(move[0]).toLowerCase()] : pieceTableIndex[move[0].toLowerCase()] + 6 ;
}

export function isCastling(move) {
  if(move.search(/O-O-O/) !== -1)
    return 12; // QUeen side castle
  else if(move.search(/O-O/) !== -1)
    return 13; // King side castle
  else
    return -1;
}



export function findFromSquare(board, move, turn) {
  if(move.search(/(O-O)|(O-O-O)/) !== -1) return turn === 'w' ? {i: 7, j:4} : {i: 0, j:4};
  let startInd = move.search(/=/);
  if(startInd !== -1) {
    // If it is a promotion move
    const j = move.charCodeAt(0) - 'a'.charCodeAt(0);
    const i = turn === 'w' ? 1 : 6;
    return {i, j};
  }
  startInd = move.search(/[a-h][1-8]/);
  const toSquare = getCoords(move.slice(startInd, startInd+2));
  startInd = move.search(/[a-h]x?[a-h][1-8]/);
  const sameRow = startInd !== -1 ? (move.slice(startInd, startInd+1).charCodeAt(0) - 'a'.charCodeAt(0)) : -1;
  startInd = move.search(/[1-8]x?[a-h][1-8]/);
  const sameAlpha = startInd !== -1 ? 8 - (move.slice(startInd, startInd+1) - '0') : -1;
  startInd = move.search(/[KQNRB]([a-h]|[1-8])?x?[a-h][1-8]/);
  const isPawn = startInd === -1;
  let piece = (move[0]).toLowerCase();
  let fromSquare = {};
  // console.log({sameAlpha, sameRow, isPawn, turn, piece});
  if(isPawn) {
    piece = 'p';
    startInd = move.search(/x/);
    const isCapture = startInd !== -1;
    let file;
    if(isCapture) {
      file = move.slice(startInd-1, startInd).charCodeAt(0) - 'a'.charCodeAt(0);
    } else {
      file = move[0].charCodeAt(0) - 'a'.charCodeAt(0);
    }
    let row1 = turn === 'w' ?  toSquare.i+1 : toSquare.i-1;
    let row2 = turn === 'w' ?  toSquare.i+2 : toSquare.i-2;
    let row3 = toSquare.i;
    if(row1 >= 0 && row1 < 8 && board[row1][file] && board[row1][file].type === 'p' && board[row1][file].color === turn)
      return {i: row1, j: file};
    if(row2 >= 0 && row2 < 8 && board[row2][file] && board[row2][file].type === 'p' && board[row2][file].color === turn)
      return {i: row2, j: file};
    if(row1 >= 0 && row3 < 8 && board[row3][file] && board[row3][file].type === 'p' && board[row3][file].color === turn)
      return {i: row3, j: file};
    console.error("Unknown");
    return {i: 0, j: 0};
  }
  switch(piece) {
    case 'q':   for(let i=toSquare.i-1, j=toSquare.j-1; i>=0 && j>=0; --i, --j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }
          for(let i=toSquare.i+1, j=toSquare.j+1; i<8 && j<8; ++i, ++j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn) {
              return {i, j};
            }
          }
          for(let i=toSquare.i+1, j=toSquare.j-1; i<8 && j>=0; ++i, --j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }
          for(let i=toSquare.i-1, j=toSquare.j+1; i>=0 && j<8; --i, ++j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }
          for(let j=0; j<8; ++j) {
            if(board[toSquare.i][j] && board[toSquare.i][j].type === piece && board[toSquare.i][j].color === turn)
              return {i: toSquare.i, j};
          }
          for(let i=0; i<8; ++i) {
            if(board[i][toSquare.j] && board[i][toSquare.j].type === piece && board[i][toSquare.j].color === turn)
              return {i, j: toSquare.j};
          }
          console.error("Unknown");
          return {i: 0, j: 0};

    case 'k':   for(let ioff=-1; ioff <= 1; ++ioff) {
            for(let joff=-1; joff<=1; ++joff) {
              let i = toSquare.i + ioff;
              let j = toSquare.j + joff;
              if(i >= 0 && i < 8 && j >=0 && j < 8 && board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
                return {i, j};
            }
          }
          console.error("Unknown");
          return {i: 0, j: 0};

    case 'r':   //sameRow => ifAlpha | sameAlpha => ifNum
          for(let j=0; j<8; ++j) {
            if(board[toSquare.i][j] && board[toSquare.i][j].type === piece && board[toSquare.i][j].color === turn) {
              let wrongOne = false;
              for(let oj=(j>toSquare.j ? toSquare.j+1 : j+1); oj < (j>toSquare.j ? j : toSquare.j); ++oj) {
                // console.log({j, to: toSquare.j, oj, board: board[toSquare.i][oj]});
                if(board[toSquare.i][oj] !== null) {
                  wrongOne = true;
                  break;
                }
              }
              if(wrongOne)
                continue;
              if((sameRow===-1 && sameAlpha===-1) || (sameRow === j) || (sameAlpha === toSquare.i))
                return {i: toSquare.i, j};
            }
          }
          for(let i=0; i<8; ++i) {
            if(board[i][toSquare.j] && board[i][toSquare.j].type === piece && board[i][toSquare.j].color === turn) {
              let wrongOne = false;
              for(let oi=(i>toSquare.i ? toSquare.i+1 : i+1); oi < (i>toSquare.i ? i : toSquare.i); ++oi) {
                if(board[oi][toSquare.j] !== null) {
                  wrongOne = true;
                  break;
                }
              }
              if(wrongOne)
                continue;
              if((sameRow===-1 && sameAlpha===-1) || (sameRow === toSquare.j) || (sameAlpha === i))
                return {i, j: toSquare.j};
            }
          }
          console.log("Unknown");
          console.error("Unknown");
          return {i: 0, j: 0};

    case 'b':   for(let i=toSquare.i-1, j=toSquare.j-1; i>=0 && j>=0; --i, --j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }
          for(let i=toSquare.i+1, j=toSquare.j+1; i<8 && j<8; ++i, ++j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn) {
              return {i, j};
            }
          }
          for(let i=toSquare.i+1, j=toSquare.j-1; i<8 && j>=0; ++i, --j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }
          for(let i=toSquare.i-1, j=toSquare.j+1; i>=0 && j<8; --i, ++j) {
            if(board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
              return {i, j};
          }

          console.error("Unknown");
          return {i: 0, j: 0};

    case 'n':   
          if(sameAlpha !== -1) {
            let i = sameAlpha;
            let j1, j2;
            switch(i - toSquare.i) {
              case -2:
              case 2: j1 = toSquare.j - 1;
                  j2 = toSquare.j + 1;
                  break;
              case -1:
              case 1: j1 = toSquare.j - 2;
                  j2 = toSquare.j + 2;
                  break;
              default: console.error("This should not happen"); break;
            }
            if(j1 >= 0 && board[i][j1] && board[i][j1].type === piece && board[i][j1].color === turn)
              return {i, j: j1}
            if(j2 < 8 && board[i][j2] && board[i][j2].type === piece && board[i][j2].color === turn)
              return {i, j: j2};

            console.error("Unknown");
            return {i: 0, j: 0};
          }

          if(sameRow !== -1) {
            let j = sameRow;
            let i1, i2;
            switch(j - toSquare.j) {
              case -2:
              case 2: i1 = toSquare.i - 1;
                  i2 = toSquare.i + 1;
                  break;
              case -1:
              case 1: i1 = toSquare.i - 2;
                  i2 = toSquare.i + 2;
                  break;
              default: console.error("This should not happen"); break;
            }
            if(i1 >= 0 && board[i1][j] && board[i1][j].type === piece && board[i1][j].color === turn)
              return {i: i1, j}
            if(i2 < 8 && board[i2][j] && board[i2][j].type === piece && board[i2][j].color === turn)
              return {i: i2, j}
            console.error("Unknown");
            return {i: 0, j: 0};
          }

          for(let ioff=-2; ioff <= 2; ++ioff) {
            for(let joff=-2; joff <= 2; ++joff) {
              if(Math.abs(ioff) + Math.abs(joff) !== 3)
                continue;
              let i = toSquare.i + ioff;
              let j = toSquare.j + joff;
              // console.log(i, j);
              if(i >= 0 && i < 8 && j >=0 && j < 8 && board[i][j] && board[i][j].type === piece && board[i][j].color === turn)
                return {i, j};
            }
          }

          console.error("Unknown");
          return {i: 0, j: 0};

    default: console.error("this should not happen"); break;
  }
  return fromSquare;
}
