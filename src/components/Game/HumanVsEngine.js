import React, { useRef, useEffect, useState, useCallback } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import {calculatePointsByPiece, findFromSquare, findToSquare} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import SettingsModal from './Modals/SettingsModal';
import GameoverModal from './Modals/GameoverModal';
import PositionModal from './Modals/PositionModal';
import PlayerInfo from './PlayerInfo';
import { ControlBtnBlock, ControlBtnHalf } from './compUtils/compUtils';
import ChessEngineWorker from '../../chessEngine/engine.worker';
import MoveSound from '../../assets/Move.mp3';
import NewGameSound from '../../assets/NewGame.mp3';
import UndoSound from '../../assets/Undo.mp3';
import SwitchSound from '../../assets/Switch.mp3';
import ChessGame from './ChessGame'

import './Game.css';
import { chessEngineInterface } from './workerInterface';
import useSearchEngineOptions from './useSearchEngineOptions';


function HumanVsEngine({ 
    createChessEnginerWorker = () => new ChessEngineWorker() ,
    getNewChessGame = ChessGame.getNewChessGame
}) {

    /********** States and Refs **********/

	// game - used to store game state, generate moves, etc.
	// Can't be set as state as it has many hidden attributes that change when using its methods.
	// So we can't make ues of setState on game
    const game = useRef(getNewChessGame());
	const chessEngineWorker = useRef(); // The worker thread
	// The worker thread is initialized in the useEffect function as for some reason using useRef to initialize causes it 
    // to initialize more than once - in result creating more than one worker thread
    const chessEngine = chessEngineInterface(chessEngineWorker)
    
    const [options, setOptions] = useSearchEngineOptions(chessEngine)
    const { searchDepth, maxDepth, evalCap } = options;
    const { setSearchDepth, setMaxDepth, setEvalCap } = setOptions;

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

    const [gameStatus, setgameStatus] = useState(0); // Contains 
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
            setTimeout(() => chessEngine.search(searchData), 250);
        }, 
        [searchDepth, evalCap, maxDepth]
    ); 
    

    /********** Effects **********/

    useEffect(() => {
		// Instantiate the thread in which the chess engine will run
        chessEngineWorker.current = createChessEnginerWorker();
        chessEngineWorker.current.onmessage = handleWorkerMessage;
        chessEngine.init();

        function handleWorkerMessage(e) {
            // console.log(e.data);
            switch(e.data.type) {
                case 'search':{
                    // AI's move     
                    const { move } = e.data.data;
                    chessEngine.move(move)
                    const fromSquare = findFromSquare(game.current.board(), move, game.current.turn());
                    const toSquare = findToSquare(move);
                    const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
                    const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
                    game.current.move(move);
                    setHistory(history => [...history, {move, from, to}]);
                    setNeedToPlayMoveSound(true);
                    setSearchProgress(0);
                    break;
                }
                case 'hint':{
                    // Hint from AI
                    const { move } = e.data.data;
                    if(!waitingForHintRef.current) return;
                    const fromSquare = findFromSquare(game.current.board(), move, game.current.turn());
                    const toSquare = findToSquare(move);
                    const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
                    const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
                    setHint({from, to});
                    setWaitingForHint(false);                
                    setSearchProgress(0);
                    break;
                }
                case 'search-update': {
                    const { currentDepth, searchDepth } = e.data.data;
                    setSearchProgress(Math.floor((sumTillN(currentDepth) * 100) / sumTillN(searchDepth)));
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
            setgameStatus(status);
            setOpenGameoverModal(true);
            return;
        }
		// Let AI make the move if it is its turn
        if(!isPlayersTurn()) letAiMakeMove();

    }, [playerColor, history, letAiMakeMove]);    


    /********** Functions used by the component **********/

    function undoGame() {
        if(!isPlayersTurn()) return; // Disable undo while AI is thinking
        setWaitingForHint(false);
        game.current.undo();
        chessEngine.undo();
        setgameStatus(0);
        setHistory(history => {
            let newHistory = [...history];
            newHistory.pop();
            if(!isPlayersTurn()) { // Undo the previous move of AI too
				game.current.undo();
				chessEngine.undo();
                newHistory.pop();
            }
            return newHistory;
        });
        undoAudio.current.play();
    }

    function newGame() {
        if(gameStatus === 0 && !window.confirm("Are you sure that you want to reset the board?")) return;
		game.current = getNewChessGame();
		chessEngine.reset();
        setHistory([]);
        setgameStatus(0);
        setOpenGameoverModal(false);
        setWaitingForHint(false);
        newGameAudio.current.play();
    }

    function showHint() {
        if(waitingForHint) return;
        chessEngine.hint({
            searchDepth,
            evalCap,
            maxPly: maxDepth
        });
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
        chessEngine.move(newMove.move);
    }

    // Passed to ChessBoard component to call after the hint has been shown
    const onHintShown = useCallback(() => {setHint({})}, []);


    /********** JSX **********/

    function renderSettingsModal() {
        return openSettings && <SettingsModal 
            searchDepth = {searchDepth}
            setSearchDepth = {setSearchDepth}
            maxDepth = {maxDepth}
            setMaxDepth = {setMaxDepth}
            evalCap = {evalCap}
            setEvalCap = {setEvalCap}
            setOpenSettings = {setOpenSettings}
        />
    }

    function renderGameoverModal() {
        return openGameoverModal && <GameoverModal 
            playerColor = {playerColor}
            statusCode = {gameStatus}
            startNewGame = {newGame}
            closeModal = {() => setOpenGameoverModal(false)}
        />
    }

    function renderPositionModal() {
        return getPosition && <PositionModal
            position = {getPosition.format === 'PGN' ? game.current.pgn() : game.current.fen()} 
            positionFormat = {getPosition.format}
            closeModal = {() => setGetPosition(null)}
        />
    }

    function Modals() {
        return (
            <>
            {renderSettingsModal()}
            {renderGameoverModal()}
            {renderPositionModal()}
            </>
        )
    }

    function isGameOver() {
        return gameStatus !== gameStatusCode.IN_PROGRESS
    }

    function isGameInProgress() {
        return gameStatus === gameStatusCode.IN_PROGRESS
    }


    function isPlayersTurn() {
        return game.current.turn() === playerColor
    }

    function SideBar() {
        const shouldDisableUndo = isGameOver() || !isPlayersTurn();
        const shouldDisableNewGameButton = isGameInProgress() && !isPlayersTurn();
        const shouldDisableShowHint = waitingForHint || isGameOver() || !isPlayersTurn();
        const shouldDisableSwitchSides = isGameOver() || !isPlayersTurn();
        const shouldDisableGetPosition = history.length === 0
        const getHintButtonText = () => !waitingForHint ? 'Hint' : `Analyzing...(${searchProgress}%)`
        const openSettings = () => setOpenSettings(true)
        const getPng = () => setGetPosition({format: 'PGN'})
        const getFen = () => setGetPosition({format: 'FEN'})
        const pointsBalance = calculatePointsByPiece(game.current.board())
        return (
            <div className="sidebar" data-testid="sidebar">
                <div className="controls">
                    <ControlBtnHalf onClick={undoGame} disabled={shouldDisableUndo}>Undo</ControlBtnHalf>
                    <ControlBtnHalf onClick={newGame} disabled={shouldDisableNewGameButton}>New Game</ControlBtnHalf>
                    <ControlBtnHalf onClick={showHint} disabled={shouldDisableShowHint}>{getHintButtonText()}</ControlBtnHalf>
                    <ControlBtnHalf onClick={switchSides} disabled={shouldDisableSwitchSides}>Switch Sides</ControlBtnHalf>
                    <ControlBtnBlock onClick={openSettings}>AI Settings</ControlBtnBlock>
                    <hr className='hr' />
                </div>
				<div className="text-center">
                    <span className="sidebar-heading">{`Points balance: ${pointsBalance}`}</span>
                    <hr className='hr' />
                </div>
                <MoveHistory history={history} currentPosition={history.length-1} />
                <div className="controls">
                    <ControlBtnHalf onClick={getPng} disabled={shouldDisableGetPosition}>Get PGN</ControlBtnHalf>
                    <ControlBtnHalf onClick={getFen} disabled={shouldDisableGetPosition}>Get FEN</ControlBtnHalf>
                </div>
            </div>
        )
    }

	return (
        <div className="game" data-testid="game-container">
            <Modals />
            <div className="bounding-box" data-testid="main-board">
                <PlayerInfo name="AI" isThinking={isGameInProgress() && !isPlayersTurn()} thinkingText={`AI is Thinking...(${searchProgress}%)`} />
                <div className="chessboard-wrapper" data-testid="chessboard-wrapper">
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
                <PlayerInfo name="You" isThinking={isGameInProgress() && (game.current.turn() === playerColor)} thinkingText="Your Turn" />
            </div>
            <SideBar />
            <audio ref={newGameAudio} src={NewGameSound} />
            <audio ref={moveAudio} src={MoveSound} />
            <audio ref={undoAudio} src={UndoSound} />
            <audio ref={switchAudio} src={SwitchSound} />
        </div>
    );
}

/********** Functions that are independant of state and props **********/

const gameStatusCode = {
    IN_PROGRESS: 0,
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
		status = game.turn() === 'b' ? gameStatusCode.CHECKMATE_BY_WHITE : gameStatusCode.CHECKMATE_BY_BLACK;
	} else if(game.in_stalemate()) { 
		status = gameStatusCode.STALEMATE;
	} else if(game.in_threefold_repetition()) {
		status = gameStatusCode.THREEFOLD_REP;
	} else if(game.insufficient_material()) {
		status = gameStatusCode.INSUFFICIENT_MAT;
	} else if(game.in_draw()) {
		status = gameStatusCode.FIFTY_MOVE;
	} else {
		gameOver = false;
	}
	return {gameOver, status};
}

function sumTillN(n) {
    return (n*(n+1))/2;
}

export default HumanVsEngine;