import React, {useState, useRef, useLayoutEffect} from 'react';
import Chessboard from 'chessboardjsx';
import chessPieces from './chessPieces';
import {isPromotion} from '../../chessEngine/util';
import './ChessBoard.css';

function ChessBoard({game, history, playerColor, orientation, onMove, hint, onHintShown, dimensionAdjustment, id}) {

	/********** States and Refs **********/
	const [fen, setFen] = useState('start'); // Used to set/update the board position
	const [squareStyles, setSquareStyles] = useState({}); // Defines special styles to apply to squares
	const [selectedSquare, setselectedSquare] = useState(''); // Contains the square selected
	const [squaresToHighlight, setSquaresToHighlight] = useState([]);
	const [isModalOpen, setModalState] = useState(false); // Piece Promotion Modal
	const promo_move_cfg = useRef({}); // Used to store the move_cfg between making a promotion move 
	// and selecting a piece to promote to
	const [undoMove, setUndoMove] = useState(false);


	/********** Effects **********/
	// Fires to update the board on change of game history
	// or to render style changes like selectedSquare, squaresToHighlight and hint
	useLayoutEffect(() => {
		if(game.fen() !== fen) {
			setFen(game.fen());
			setUndoMove(true);
		}
		let newSquareStyles = highlightSquareStyles(squaresToHighlight, history, selectedSquare);
		if(hint && JSON.stringify(hint) !== "{}") {
			newSquareStyles[hint.from] = {
				animation: "from-square 1.5s ease-in-out"
			}
	
			newSquareStyles[hint.to] = {
				animation: "to-square 1.5s ease-in-out",
				animationDelay: "1.5s"
			}	

			setTimeout(() => {
				onHintShown();
			}, 3000);
		}

		setSquareStyles(newSquareStyles);
	}, [history, selectedSquare, game, squaresToHighlight, hint, onHintShown, fen]);



	/********** Functions used by the component **********/

	function onMouseOutSquare(square) {
		if(selectedSquare !== '') return; // Don't change highlighting when a sq has been selected
		setSquaresToHighlight([]); // Remove highlighting of possible moves
	}
	
	function onMouseOverSquare(square) {
		if(game.turn() !== playerColor) return; // Don't highlight possible moves when opponent is playing
		if(selectedSquare !== '') return; // Don't highlight possible moves from the current sq when another sq has already been selected

		// Highlight possible moves
		let moves = game.moves({
			square,
			verbose: true
		});

		if(moves.length === 0) return;

		const newSquaresToHighlight = moves.map(move => move.to);
		setSquaresToHighlight(newSquaresToHighlight);
	}
	
	function onSquareClick(square) {
		// If this square has been previously selected than unselect it
		if(square === selectedSquare) {
			setselectedSquare('');
			setSquaresToHighlight([]);
			return;
		}

		// If a square is being click during the opponent's turn, then we do not need to perform any moves onSquareClick
		// So just select the new square
		if(game.turn() !== playerColor) {
			setselectedSquare(square);
			return;
		}

		// If a move is possible between previously selected square and the currently selected square
		// then make that move, else just update the selected square to the currently selected one
		// and highlight possible moves from that square
		let move = game.move({
			from: selectedSquare,
			to: square,
			promotion: 'q'
		});

		if(move === null) {
			// Move not possible
			let moves = game.moves({
				square,
				verbose: true
			});
			const newSquaresToHighlight = moves.map(move => move.to);
			setselectedSquare(square);
			setSquaresToHighlight(newSquaresToHighlight);
			return;
		}	
		
		// Move is possible
		game.undo();	
		makeMove({
			from: selectedSquare,
			to: square,
			promotion: 'q'
		});
	}
	
	function onDrop({sourceSquare, targetSquare, piece}) {
		const move_cfg = {
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q'
		};
		makeMove(move_cfg);	
	}

	function makeMove(move_cfg) {
		if(isPromotion(move_cfg.from, move_cfg.to, game.board(), game.turn())) {
			setModalState(true);
			promo_move_cfg.current = move_cfg;
			return;
		}
		let move = game.move(move_cfg);
		if(move === null) return;
		setselectedSquare('');
		setSquaresToHighlight([]);
		setUndoMove(false);
		setFen(game.fen());
		let newMove = {move: game.history()[game.history().length - 1], 
			from: move_cfg.from,
			to: move_cfg.to};
		onMove(newMove, history.length);
	}

	function setPromotion(piece) {
		promo_move_cfg.current.promotion = piece;
		console.log(promo_move_cfg);
		let move = game.move(promo_move_cfg.current);
		if(move === null) return;
		setselectedSquare('');
		let newMove = {move: game.history()[game.history().length - 1],
			from: promo_move_cfg.current.from,
			to: promo_move_cfg.current.to};
		onMove(newMove);
		setFen(game.fen());
		setModalState(false);
		setUndoMove(false);
	}

	function allowDrag({piece}) {
		return piece[0] === playerColor;
	}

	function calcWidth({screenHeight, screenWidth}) {
		if(!screenHeight || !screenWidth) return 560;
		let xadjust = 0, yadjust = 0;
		if(dimensionAdjustment && dimensionAdjustment.width.percent)
			xadjust += (screenWidth * dimensionAdjustment.width.percent) / 100;

		if(dimensionAdjustment && dimensionAdjustment.width.pixel)
			xadjust += dimensionAdjustment.width.pixel;

		if(dimensionAdjustment && dimensionAdjustment.height.percent)
			yadjust += (screenHeight * dimensionAdjustment.height.percent) / 100;

		if(dimensionAdjustment && dimensionAdjustment.height.pixel)
			yadjust += dimensionAdjustment.height.pixel;

		const availWidth = screenWidth - xadjust;
		const availHeight = screenHeight - yadjust;

		return Math.min(560, Math.min(availHeight, availWidth));
	}


	/********** JSX **********/

	return (
		<div className="myChessboard">
			<Chessboard 
				id={id}
				position={fen}
				orientation={orientation}
				onMouseOutSquare = {onMouseOutSquare}
				onMouseOverSquare = {onMouseOverSquare}
				onSquareClick = {onSquareClick}
				onDrop = {onDrop}
				squareStyles = {squareStyles}
				allowDrag = {allowDrag}
				calcWidth = {calcWidth}
				transitionDuration = {150}
				undo={undoMove}
			/>
			{
				isModalOpen &&
				<div id="myModal" className="pop-outer">
					<div className="pop-inner">
						<div className="modal-title">Promote to</div>
						<div className="pieces">
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('q')}><g>{game.turn() === 'w' ? chessPieces.wQ : chessPieces.bQ}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('r')}><g>{game.turn() === 'w' ? chessPieces.wR : chessPieces.bR}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('n')}><g>{game.turn() === 'w' ? chessPieces.wN : chessPieces.bN}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('b')}><g>{game.turn() === 'w' ? chessPieces.wB : chessPieces.bB}</g></svg>
						</div>
					</div>
	        	</div>
			}
		</div>
	);
}

function squareStyling({selectedSquare, history}) {
	// debugger;
    const sourceSquare = history.length && history[history.length - 1].from;
	const targetSquare = history.length && history[history.length - 1].to;

    return {
		...(selectedSquare && {
			[selectedSquare]: {backgroundColor: "rgba(255, 216, 7, 0.4)"}	
		}),
        ...(history.length && {
            [sourceSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.4)"
            }
        }),
        ...(history.length && {
            [targetSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.4)"
            }
        })
    };
}


/********** Functions that are independant of state and props **********/

// Return styles to highlight possible moves' to-square along with the selected square and last move
function highlightSquareStyles(squaresToHighlight, history, selectedSquare) {
	let newSquareStyles = squaresToHighlight.reduce(
		(all, cur) => ({
			...all,
			...{
				[cur]: {
					background: "radial-gradient(circle, rgba(0,0,0,0.3) 21%, transparent 21%)",
					borderRadius: "50%"
				}
			},
		}), {}
	);

	newSquareStyles = {...newSquareStyles, ...squareStyling({selectedSquare, history})};

	return newSquareStyles;
}

export default ChessBoard;