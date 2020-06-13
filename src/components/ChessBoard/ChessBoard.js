import React, {useState, useEffect, useRef} from 'react';
import Chessboard from 'chessboardjsx';
import chessPieces from './chessPieces';
import {isPromotion} from '../../chessEngine/util';

function ChessBoard(props) {
	const [fen, setFen] = useState('start');
	const [squareStyles, setSquareStyles] = useState({});
	const [selectedSquare, setselectedSquare] = useState('');
	const [isModalOpen, setModalState] = useState(false);
	const promo_move_cfg = useRef({});

	function onMouseOutSquare(square) {
		// Remove highlighting of possible moves
		setSquareStyles(noHighlightSquareStyles(square, props.history, selectedSquare));
	}
	
	function onMouseOverSquare(square) {
		// Highlight possible moves
		let moves = props.game.moves({
			square,
			verbose: true
		});

		if(moves.length === 0) return;

		const squaresToHighlight = moves.map(move => move.to);
		setSquareStyles(highlightSquareStyles(square, squaresToHighlight, props.history, selectedSquare));
	}
	
	function onSquareClick(square) {
		// select square and remove highlighting of possible moves
		if(square == selectedSquare) {
			setselectedSquare('');
			setSquareStyles(squareStyling({selectedSquare: '', history: props.history}));
			return;
		}

		let move = props.game.moves({
			from: selectedSquare,
			to: square,
			promotion: 'q'
		});

		setselectedSquare(square);
		setSquareStyles(squareStyling({selectedSquare: square, history: props.history}));

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
		if(isPromotion(move_cfg.from, move_cfg.to, props.game.board(), props.game.turn())) {
			setModalState(true);
			promo_move_cfg.current = move_cfg;
			return;
		}
		let move = props.game.move(move_cfg);
		if(move === null) return;
		props.updateHistory([...props.history, props.game.history()[props.game.history()-1]]);
		setselectedSquare('');
		setSquareStyles(squareStyling({selectedSquare: '', history: props.history}));
		setFen(props.game.fen());
	}

	function setPromotion(piece) {
		promo_move_cfg.current.promotion = piece;
		let move = props.game.move(promo_move_cfg.current);
		if(move === null) return;
		props.updateHistory([...props.history, props.game.history()[props.game.history()-1]]);
		setselectedSquare('');
		setSquareStyles(squareStyling({selectedSquare: '', history: props.history}));
		setFen(props.game.fen());
		setModalState(false);
	}

	function allowDrag({piece}) {
		return piece[0] == props.game.turn();
	}

	return (
		<div className="myChessboard">
			<Chessboard 
				position={fen}
				onMouseOutSquare = {onMouseOutSquare}
				onMouseOverSquare = {onMouseOverSquare}
				onSquareClick = {onSquareClick}
				onDrop = {onDrop}
				squareStyles = {squareStyles}
				allowDrag = {allowDrag}
			/>
			{
				isModalOpen &&
				<div id="myModal" className="pop-outer col-lg-5">
					<div className="pop-inner">
						<div className="modal-title">Promote to</div>
						<div className="pieces">
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('q')}><g>{props.game.turn() === 'w' ? chessPieces.wQ : chessPieces.bQ}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('r')}><g>{props.game.turn() === 'w' ? chessPieces.wR : chessPieces.bR}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('n')}><g>{props.game.turn() === 'w' ? chessPieces.wN : chessPieces.bN}</g></svg>
							<svg width="70" height="70" viewBox="0 0 43 43" onClick={() => setPromotion('b')}><g>{props.game.turn() === 'w' ? chessPieces.wB : chessPieces.bB}</g></svg>
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