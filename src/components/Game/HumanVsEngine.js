import React, { useRef, useEffect, useState, useCallback } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece, findFromSquare, findToSquare} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import SettingsModal from './Modals/SettingsModal';
import GameoverModal from './Modals/GameoverModal';
import PositionModal from './Modals/PositionModal';
import PlayerInfo from './PlayerInfo';
import ChessEngineWorker from '../../chessEngine/engine.worker';
import MoveSound from '../../assets/Move.mp3';
import NewGameSound from '../../assets/NewGame.mp3';
import UndoSound from '../../assets/Undo.mp3';
import SwitchSound from '../../assets/Switch.mp3';

import './Game.css';


function HumanVsEngine() {

    /********** States and Refs **********/

	// game - used to store game state, generate moves, etc.
	// Can't be set as state as it has many hidden attributes that change when using its methods.
	// So we can't make ues of setState on game
    const game = useRef(new Chess());
	const chessEngineWorker = useRef(); // The worker thread
	// The worker thread is initialized in the useEffect function as for some reason using useRef to initialize causes it 
    // to initialize more than once - in result creating more than one worker thread

    
    const [searchDepth, _setSearchDepth] = useState(parseInt(localStorage.getItem('searchDepth')) || 3); // Search engine-related state
    const [maxDepth, _setMaxDepth] = useState(parseInt(localStorage.getItem('maxDepth')) || 3); // Search engine-related state
    const [evalCap, _setEvalCap] = useState(parseInt(localStorage.getItem('evalCap')) || 15000); // Search engine-related state

    // Save any changes to AI settings to localstorage
    const setSearchDepth = (newDepth) => {
        if(searchDepth < newDepth) {
            chessEngineWorker.current.postMessage({type: 'init'});
            const pgn = game.current.pgn();
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setSearchDepth(newDepth);
        localStorage.setItem('searchDepth', newDepth);
    }

    const setMaxDepth = (newDepth) => {
        if(maxDepth < newDepth) {
            chessEngineWorker.current.postMessage({type: 'init'});
            const pgn = game.current.pgn(); 
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setMaxDepth(newDepth);
        localStorage.setItem('maxDepth', newDepth);
    }

    const setEvalCap = (newCap) => {
        if(evalCap < newCap) {
            chessEngineWorker.current.postMessage({type: 'init'});
            const pgn = game.current.pgn();
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setEvalCap(newCap);
        localStorage.setItem('evalCap', newCap);
    }

    const [history, setHistory] = useState([]); // Used as state -> condition on which to re-render on move

    const [playerColor, _setPlayerColor] = useState(localStorage.getItem('orientation') || 'w'); // Used to check whose turn it is (AI's or human's) and to set board orientation
    const playerColorRef = useRef('w'); // Used to access player color info in on message event handler
	const setPlayerColor = (newColor) => {
        playerColorRef.current = newColor;
        localStorage.setItem('orientation', newColor);
		_setPlayerColor(newColor);
    }

    const [searchProgress, setSearchProgress] = useState(0);
    const [hint, setHint] = useState({});
    const [waitingForHint, _setWaitingForHint] = useState(false);

    const waitingForHintRef = useRef(false);
    const setWaitingForHint = state => {
        waitingForHintRef.current = state;
        _setWaitingForHint(state);
    }

    const [gameoverStatus, setGameoverStatus] = useState(0); // Contains 
    const [needToPlayMoveSound, setNeedToPlayMoveSound] = useState(false); // Used to defer playing of move sound after render

	const [openSettings, setOpenSettings] = useState(false); // State of AI settings modal
    const [openGameoverModal, setOpenGameoverModal ] = useState(false);
    const [getPosition, setGetPosition] = useState(null); 
    
    const moveAudio = useRef(null);
    const newGameAudio = useRef(null);
    const undoAudio = useRef(null);
    const switchAudio = useRef(null); 


    /********** Memoized functions **********/

    const letAiMakeMove = useCallback(
        () => {
            const searchData = {
                searchDepth,
                evalCap,
                maxPly: maxDepth
            };
            setTimeout(() => chessEngineWorker.current.postMessage({type: 'search', data: searchData}), 250);
        }, 
        [searchDepth, evalCap, maxDepth]
    ); 
    

    /********** Effects **********/

    useEffect(() => {
		// Instantiate the thread in which the chess engine will run
        chessEngineWorker.current = new ChessEngineWorker();
        chessEngineWorker.current.onmessage = handleWorkerMessage;
        chessEngineWorker.current.postMessage({type:'init'});

        function handleWorkerMessage(e) {
            // console.log(e.data);
            switch(e.data.type) {
                case 'search':{
                    // AI's move                    
                    chessEngineWorker.current.postMessage({type: 'move', data: e.data.data.move});
                    const fromSquare = findFromSquare(game.current.board(), e.data.data.move, game.current.turn());
                    const toSquare = findToSquare(e.data.data.move);
                    const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
                    const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
                    game.current.move(e.data.data.move);
                    setHistory(history => [...history, {move: e.data.data.move, from, to}]);
                    setNeedToPlayMoveSound(true);
                    setSearchProgress(0);
                    break;
                }
                case 'hint':{
                    // Hint from AI
                    if(!waitingForHintRef.current) return;
                    const fromSquare = findFromSquare(game.current.board(), e.data.data.move, game.current.turn());
                    const toSquare = findToSquare(e.data.data.move);
                    const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
                    const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
                    setHint({from, to});
                    setWaitingForHint(false);                
                    setSearchProgress(0);
                    break;
                }
                case 'search-update': {
                    const curDepth = e.data.data.currentDepth;
                    setSearchProgress(Math.floor((sumTillN(curDepth) * 100) / sumTillN(e.data.data.searchDepth)));
                    break;
                }

                default: 
                    console.log("Unhandled message from worker", e.data);
                    break;
            }
        }

        return function cleanup() {
			// Delete the thread in which the chess engine ran
			chessEngineWorker.current.terminate();
		}
    }, []);

    // Fires after move - to play move sound
    useEffect(() => {
        if(needToPlayMoveSound) {
            moveAudio.current.play(); 
            setNeedToPlayMoveSound(false);
        }
    }, [needToPlayMoveSound]);

    
    // Fires after change in playerColor or history to let AI make its move if it is its turn
    useEffect(() => {
        setWaitingForHint(false);
        let gameOver, status;
        ({gameOver, status} = checkGameEnd(game.current));
        if(gameOver) {
            setGameoverStatus(status);
            setOpenGameoverModal(true);
            return;
        }
		// Let AI make the move if it is its turn
        if(game.current.turn() !== playerColor) letAiMakeMove();

    }, [playerColor, history, letAiMakeMove]);    


    /********** Functions used by the component **********/

    function undoGame() {
        if(game.current.turn() !== playerColor) return; // Disable undo while AI is thinking
        setWaitingForHint(false);
        game.current.undo();
        chessEngineWorker.current.postMessage({type: 'undo'});
        setGameoverStatus(0);
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
        undoAudio.current.play();
    }

    function newGame() {
        if(gameoverStatus === 0 && !window.confirm("Are you sure that you want to reset the board?")) return;
		game.current = new Chess();
		chessEngineWorker.current.postMessage({type: 'reset'});
        setHistory([]);
        setGameoverStatus(0);
        setOpenGameoverModal(false);
        setWaitingForHint(false);
        newGameAudio.current.play();
    }

    function showHint() {
        if(waitingForHint) return;
		const searchData = {
            searchDepth,
            evalCap,
            maxPly: maxDepth
        }
        chessEngineWorker.current.postMessage({type: 'hint', data: searchData});
        setWaitingForHint(true);
    }

    function switchSides() {
        setWaitingForHint(false);
        setPlayerColor(playerColor === 'w' ? 'b' : 'w');
        switchAudio.current.play();
    }

    
    // Passed to ChessBoard component to call on move
    function updateGameState(newMove) {
        setWaitingForHint(false);
        setNeedToPlayMoveSound(true);
        setHistory(history => [...history, newMove]);
        chessEngineWorker.current.postMessage({type: 'move', data: newMove.move});
    }

    // Passed to ChessBoard component to call after the hint has been shown
    const onHintShown = useCallback(() => {setHint({})}, []);


    /********** JSX **********/

	return (
        <div className="game">
            {
                openSettings && 
                <SettingsModal 
                    searchDepth = {searchDepth}
                    setSearchDepth = {setSearchDepth}
                    maxDepth = {maxDepth}
                    setMaxDepth = {setMaxDepth}
                    evalCap = {evalCap}
                    setEvalCap = {setEvalCap}
                    setOpenSettings = {setOpenSettings}
                />
            }
            {
                openGameoverModal &&
                <GameoverModal 
                    playerColor = {playerColor}
                    statusCode = {gameoverStatus}
                    startNewGame = {newGame}
                    closeModal = {() => setOpenGameoverModal(false)}
                />
            }
            {
                getPosition &&
                <PositionModal
                    position = {getPosition.format === 'PGN' ? game.current.pgn() : game.current.fen()} 
                    positionFormat = {getPosition.format}
                    closeModal = {() => setGetPosition(null)}
                />
            }
            <div className="bounding-box">
                <PlayerInfo name="AI" isThinking={(gameoverStatus === 0) && (game.current.turn() !== playerColor)} thinkingText={`AI is Thinking...(${searchProgress}%)`} />
                <div className="chessboard-wrapper">
                    <ChessBoard 
                        id="vsAI"
                        game = {game.current}
                        history = {history}
                        playerColor = {playerColor}
                        onMove = {updateGameState}
                        orientation = {playerColor === 'w' ? 'white' : 'black'}
                        hint = {hint}
                        onHintShown = {onHintShown}
                        dimensionAdjustment = {{
                            width: {percent: 4},
                            height: {pixel: 84}
                        }}
                    />
                </div>
                <PlayerInfo name="You" isThinking={(gameoverStatus === 0) && (game.current.turn() === playerColor)} thinkingText="Your Turn" />
            </div>
            <div className="sidebar">
                <div className="controls">
                    <button className="btn btn-dark controls-half-width" 
                            onClick={() => undoGame()} 
                            disabled={(gameoverStatus !== 0) || (game.current.turn() !== playerColor)}>Undo</button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => newGame()} 
                            disabled={(gameoverStatus === 0) && (game.current.turn() !== playerColor)}>New Game</button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => showHint()} 
                            disabled={(waitingForHint) || (gameoverStatus !== 0) || (game.current.turn() !== playerColor)}
                    >
                            {!waitingForHint ? 'Hint' : `Analyzing...(${searchProgress}%)` }
                    </button>
                    <button className="btn btn-dark controls-half-width"
                            onClick={() => switchSides()} 
                            disabled={(gameoverStatus !== 0) || (game.current.turn() !== playerColor)}>Switch Sides</button>
                    <button className="btn btn-dark btn-block" 
                            onClick={() => setOpenSettings(true)}>AI Settings</button>
                    <hr className='hr' />
                </div>
				<div className="text-center">
                    <span className="sidebar-heading">{'Points balance: '}</span>{calculatePointsByPiece(game.current.board())}
                    <hr className='hr' />
                </div>
                <MoveHistory history={history} currentPosition={history.length-1} />
                <div className="controls">
                    <button className="btn btn-dark controls-half-width" onClick={() => setGetPosition({format: 'PGN'})} disabled = {history.length === 0}>Get PGN</button>
                    <button className="btn btn-dark controls-half-width" onClick={() => setGetPosition({format: 'FEN'})} disabled = {history.length === 0}>Get FEN</button>
                </div>
            </div>
            <audio ref={newGameAudio} src={NewGameSound} />
            <audio ref={moveAudio} src={MoveSound} />
            <audio ref={undoAudio} src={UndoSound} />
            <audio ref={switchAudio} src={SwitchSound} />
        </div>
    );
}

/********** Functions that are independant of state and props **********/

const gameEndStatusCode = {
	CHECKMATE_BY_WHITE: 1,
	CHECKMATE_BY_BLACK: 2,
	STALEMATE: 3,
	THREEFOLD_REP: 4,
	INSUFFICIENT_MAT: 5,
	FIFTY_MOVE: 6
};

function checkGameEnd(game) {
	let gameOver = true;
	let status;
	if(game.in_checkmate()) {
		status = game.turn() === 'b' ? gameEndStatusCode.CHECKMATE_BY_WHITE : gameEndStatusCode.CHECKMATE_BY_BLACK;
	} else if(game.in_stalemate()) { 
		status = gameEndStatusCode.STALEMATE;
	} else if(game.in_threefold_repetition()) {
		status = gameEndStatusCode.THREEFOLD_REP;
	} else if(game.insufficient_material()) {
		status = gameEndStatusCode.INSUFFICIENT_MAT;
	} else if(game.in_draw()) {
		status = gameEndStatusCode.FIFTY_MOVE;
	} else {
		gameOver = false;
	}
	return {gameOver, status};
}

function sumTillN(n) {
    return (n*(n+1))/2;
}

export default HumanVsEngine;