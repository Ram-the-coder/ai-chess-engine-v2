import React, { useRef, useEffect, useState } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece, findFromSquare, findToSquare} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import Modal from './Modal';
import PlayerInfo from './PlayerInfo';
import ChessEngineWorker from '../../chessEngine/engine.worker';

import './HumanVsEngine.css';


function HumanVsEngine() {

	// game - used to store game state, generate moves, etc.
	// Can't be set as state as it has many hidden attributes that change when using its methods.
	// So we can't make ues of setState on game
	const game = useRef(new Chess());
	const chessEngineWorker = useRef(); // The worker thread
	// The worker thread is initialized in the useEffect function as for some reason using useRef to initialize causes it 
	// to initialize more than once - in result creating more than one worker thread

    const [history, setHistory] = useState([]); // Used as state -> condition on which to re-render
    const [searchDepth, setSearchDepth] = useState(3); // Search engine-related state
    const [maxDepth, setMaxDepth] = useState(5); // Search engine-related state
    const [evalCap, setEvalCap] = useState(20000); // Search engine-related state
	const [playerColor, _setPlayerColor] = useState('w'); // Used to check whose turn it is (AI's or human's) and to set board orientation
	const [openSettings, setOpenSettings] = useState(false); // State of AI settings modal
	const [hint, setHint] = useState({});

	const playerColorRef = useRef('w');
	const setPlayerColor = (newColor) => {
		playerColorRef.current = newColor;
		_setPlayerColor(newColor);
	}

    useEffect(() => {
		// Instantiate the thread in which the chess engine will run
        chessEngineWorker.current = new ChessEngineWorker();
        chessEngineWorker.current.onmessage = handleWorkerMessage;
        chessEngineWorker.current.postMessage({type:'init'});

        return function cleanup() {
			// Delete the thread in which the chess engine ran
			chessEngineWorker.current.terminate();
		}
    }, []);

    useEffect(() => {
		// Let AI make the move if it is its turn
        if(game.current.turn() !== playerColor) letAiMakeMove();
    }, [playerColor, history]);

    function letAiMakeMove() {
        const searchData = {
            searchDepth,
            evalCap,
            maxPly: maxDepth
        }
        setTimeout(() => chessEngineWorker.current.postMessage({type: 'search', data: searchData}), 250);
    }

    function undoGame() {
		if(game.current.turn() !== playerColor) return; // Disable undo while AI is thinking
		game.current.undo();
		chessEngineWorker.current.postMessage({type: 'undo'});
        setHistory(history => {
            let newHistory = [...history];
            newHistory.pop();
            if(game.current.turn() !== playerColor) { // Undo the previous move of AI too
				game.current.undo();
				chessEngineWorker.current.postMessage({type: 'undo'});
                newHistory.pop();
            }
            return newHistory;
        });
    }

    function newGame() {
		game.current = new Chess();
		chessEngineWorker.current.postMessage({type: 'reset'});
        setHistory([]);
    }

    function showHint() {
		const searchData = {
            searchDepth,
            evalCap,
            maxPly: maxDepth
        }
		chessEngineWorker.current.postMessage({type: 'search', data: searchData});
    }

    function switchSides() {
        setPlayerColor(playerColor === 'w' ? 'b' : 'w');
    }

    function handleWorkerMessage(e) {
        switch(e.data.type) {
            case 'search':
				if(game.current.turn() !== playerColorRef) {
					// AI's move
					game.current.move(e.data.data.move);
					chessEngineWorker.current.postMessage({type: 'move', data: e.data.data.move});
                	setHistory(history => [...history, e.data.data.move]);
				} else {
					// Hint from AI
					const fromSquare = findFromSquare(game.current.board(), e.data.data.move, game.current.turn());
					const toSquare = findToSquare(e.data.data.move);
					const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
					const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
					setHint({from, to});
				}
                
				break;
				
			default: 
				console.log("Unhandled message from worker", e.data);
				break;
        }
    }

    function updateGameState(move) {
        setHistory(history => [...history, move]);
        chessEngineWorker.current.postMessage({type: 'move', data: move});
    }

	return (
        <div className="game">
            {
                openSettings && 
                <Modal 
                    searchDepth = {searchDepth}
                    setSearchDepth = {setSearchDepth}
                    maxDepth = {maxDepth}
                    setMaxDepth = {setMaxDepth}
                    evalCap = {evalCap}
                    setEvalCap = {setEvalCap}
                    setOpenSettings = {setOpenSettings}
                />
            }
            <div className="bounding-box">
                <PlayerInfo name="AI" isThinking={game.current.turn() !== playerColor} thinkingText="AI is Thinking..." />
                <div className="chessboard-wrapper">
                    <ChessBoard 
                        game = {game.current}
                        onMove = {updateGameState}
                        orientation = {playerColor === 'w' ? 'white' : 'black'}
                        hint = {hint}
                        onHintShown = {() => setHint({})}
                        dimensionAdjustment = {{
                            width: {percent: 4},
                            height: {pixel: 84}
                        }}
                    />
                </div>
                <PlayerInfo name="You" isThinking={game.current.turn() === playerColor} thinkingText="Your Turn" />
            </div>
            <div className="sidebar">
                <div className="controls">
                    <button className="btn btn-dark controls-half-width" 
                            onClick={() => undoGame()} 
                            disabled={game.current.turn() !== playerColor}>Undo</button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => newGame()} 
                            disabled={game.current.turn() !== playerColor}>New Game</button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => showHint()} 
                            disabled={game.current.turn() !== playerColor}>Hint</button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => switchSides()} 
                            disabled={game.current.turn() !== playerColor}>Switch Sides</button>
                    <button className="btn btn-dark btn-block" 
                            onClick={() => setOpenSettings(true)}>AI Settings</button>
                    <hr className='hr' />
                </div>
				<div className="text-center">
                    <span className="sidebar-heading">{'Points balance: '}</span>{calculatePointsByPiece(game.current.board())}
                    <hr className='hr' />
                </div>
                <MoveHistory history={history} />
            </div>
        </div>
    );
}

export default HumanVsEngine;