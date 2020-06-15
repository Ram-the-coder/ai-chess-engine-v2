import React, {useState, useEffect, useRef} from 'react';
import Chessboard from 'chessboardjsx';
import chessPieces from './chessPieces';
import {isPromotion} from '../../chessEngine/util';
import './ChessBoard.css';

function ChessBoard({game, orientation, onMove, hint, onHintShown}) {
	const [fen, setFen] = useState('start'); // Used to set/update the board position
	const [squareStyles, setSquareStyles] = useState({}); // Defines special styles to apply to squares
	const [selectedSquare, setselectedSquare] = useState(''); // Contains the square selected
	const [isModalOpen, setModalState] = useState(false); // Piece Promotion Modal
	const promo_move_cfg = useRef({});

	// Update the board on change of game history
	useEffect(() => {
		setFen(game.fen());
	}, [game.history()]);

	// Check for hints
	useEffect(() => {
		if(JSON.stringify(hint) === "{}") return;
		let newSquareStyles = squareStyling({history: game.history(), selectedSquare});
		newSquareStyles[hint.from] = {
			animation: "from-square 1.5s ease-in-out"
		}

		newSquareStyles[hint.to] = {
			animation: "to-square 1.5s ease-in-out",
			animationDelay: "1.5s"
		}

		setSquareStyles(newSquareStyles);

		setTimeout(() => {
			setSquareStyles(squareStyling({history: game.history(), selectedSquare}));
			onHintShown();
		}, 3000);
	}, [hint])

	function onMouseOutSquare(square) {
		// Remove highlighting of possible moves
		setSquareStyles(noHighlightSquareStyles(square, game.history(), selectedSquare));
	}
	
	function onMouseOverSquare(square) {
		// Highlight possible moves
		let moves = game.moves({
			square,
			verbose: true
		});

		if(moves.length === 0) return;

		const squaresToHighlight = moves.map(move => move.to);
		setSquareStyles(highlightSquareStyles(square, squaresToHighlight, game.history(), selectedSquare));
	}
	
	function onSquareClick(square) {
		if(square == selectedSquare) {
			// If this square has been previously selected than unselect it
			setselectedSquare('');
			setSquareStyles(squareStyling({selectedSquare: '', history: game.history()}));
			return;
		}

		// If a move is possible between previously selected square and the currently selected square
		// then make that move, else just update the selected square to the currently selected one
		// and remove highlighting of possible moves
		let move = game.moves({
			from: selectedSquare,
			to: square,
			promotion: 'q'
		});

		setselectedSquare(square);
		setSquareStyles(squareStyling({selectedSquare: square, history: game.history()}));

		if(move === null || !selectedSquare) return;		
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
		onMove(game.history()[game.history().length - 1]);
		setSquareStyles(squareStyling({selectedSquare: '', history: game.history()}));
		setFen(game.fen());
	}

	function setPromotion(piece) {
		promo_move_cfg.current.promotion = piece;
		let move = game.move(promo_move_cfg.current);
		if(move === null) return;
		setselectedSquare('');
		onMove(game.history()[game.history().length - 1]);
		setSquareStyles(squareStyling({selectedSquare: '', history: game.history()}));
		setFen(game.fen());
		setModalState(false);
	}

	function allowDrag({piece}) {
		return piece[0] == game.turn();
	}

	return (
		<div className="myChessboard">
			<Chessboard 
				position={fen}
				orientation={orientation}
				onMouseOutSquare = {onMouseOutSquare}
				onMouseOverSquare = {onMouseOverSquare}
				onSquareClick = {onSquareClick}
				onDrop = {onDrop}
				squareStyles = {squareStyles}
				allowDrag = {allowDrag}
				calcWidth = {({screenWidth, screenHeight}) => {
					const availableDisplaySize = Math.min(screenWidth, screenHeight);
					return availableDisplaySize >= 600 ?  560 : availableDisplaySize - 40;
				}}
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
    const sourceSquare = history.length && history[history.length - 1].from;
    const targetSquare = history.length && history[history.length - 1].to;

    return {
        [selectedSquare]: {backgroundColor: "rgba(255, 255, 0, 0.4)"},
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

// Return styles to highlight possible moves' to-square along with the selected square and last move
function highlightSquareStyles(source, squaresToHighlight, history, selectedSquare) {
	let newSquareStyles = [source, ...squaresToHighlight].reduce(
		(all, cur) => ({
			...all,
			...{
				[cur]: {
					background: "radial-gradient(circle, #fffc00 26%, transparent 30%)",
					borderRadius: "50%"
				}
			},
		}), {}
	);

	if(selectedSquare) 
		newSquareStyles = {...newSquareStyles, ...squareStyling({selectedSquare, history})};

	return newSquareStyles;
}

// Return styles that only highlight the selected square and last move
function noHighlightSquareStyles(square, history, selectedSquare) {
	return squareStyling({selectedSquare, history});
}

export default ChessBoard;