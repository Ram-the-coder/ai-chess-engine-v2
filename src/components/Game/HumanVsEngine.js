import React, { useRef, useEffect, useState } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import Modal from './Modal';
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
    const [playerColor, setPlayerColor] = useState('w'); // Used to check whose turn it is (AI's or human's) and to set board orientation
    const [openSettings, setOpenSettings] = useState(false); // State of AI settings modal

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
    });

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
        setHistory(history => {
            let newHistory = [...history];
            newHistory.pop();
            if(game.current.turn() !== playerColor) { // Undo the previous move of AI too
                game.current.undo();
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

    }

    function switchSides() {
        setPlayerColor(playerColor === 'w' ? 'b' : 'w');
    }

    function handleWorkerMessage(e) {
        switch(e.data.type) {
            case 'search':
                game.current.move(e.data.data.move);
                setHistory(history => [...history, e.data.data.move]);
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
            <div className="chessboard-wrapper">
                <ChessBoard 
                    game = {game.current}
                    onMove = {updateGameState}
                    orientation = {playerColor === 'w' ? 'white' : 'black'}
                />
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