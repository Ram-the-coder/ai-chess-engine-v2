import React, {useState, useRef, useEffect, useCallback} from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import ChessEngineWorker from '../../chessEngine/engine.worker';
import {calculatePointsByPiece, findFromSquare, findToSquare} from '../../chessEngine/util';
import SettingsModal from './Modals/SettingsModal';
import PositionModal from './Modals/PositionModal';
import PlayerInfo from './PlayerInfo';
import MoveHistory from './MoveHistory';

import MoveSound from '../../assets/Move.mp3';

import './Game.css';

export default function Analysis() {

    /********** States and Refs **********/

    const game = useRef(new Chess());
    const chessEngineWorker = useRef();

    const [searchDepth, _setSearchDepth] = useState(parseInt(localStorage.getItem('searchDepth')) || 3); // Search engine-related state
    const [maxDepth, _setMaxDepth] = useState(parseInt(localStorage.getItem('maxDepth')) || 3); // Search engine-related state
    const [evalCap, _setEvalCap] = useState(parseInt(localStorage.getItem('evalCap')) || 15000); // Search engine-related state

    // Save any changes to AI settings to localstorage
    const setSearchDepth = (newDepth) => {
        if(searchDepth < newDepth) {
            chessEngineWorker.current.postMessage({type: 'init'});
            fastForwardGame(history.length-1);
            const pgn = game.current.pgn();
            rewindGame(currentPosition);    
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setSearchDepth(newDepth);
        localStorage.setItem('searchDepth', newDepth);
    }

    const setMaxDepth = (newDepth) => {
        if(maxDepth < newDepth) {
            chessEngineWorker.current.postMessage({type: 'init'});
            fastForwardGame(history.length-1);
            const pgn = game.current.pgn();
            rewindGame(currentPosition);    
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setMaxDepth(newDepth);
        localStorage.setItem('maxDepth', newDepth);
    }

    const setEvalCap = (newCap) => {
        if(evalCap < newCap) {
            chessEngineWorker.current.postMessage({type: 'init'});
            fastForwardGame(history.length-1);
            const pgn = game.current.pgn();
            rewindGame(currentPosition);    
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
        }
        _setEvalCap(newCap);
        localStorage.setItem('evalCap', newCap);
    }

    const [history, setHistory] = useState([]); // Used as state -> condition on which to re-render on move
    const [currentPosition, setCurPosition] = useState(-1);
    const [orientation, _setOrientation] = useState(localStorage.getItem('orientation') || 'w');
    const setOrientation = (newOrientation) => {
        localStorage.setItem('orientation', newOrientation);
        _setOrientation(newOrientation);
    }

    const [hint, setHint] = useState({});
    const [analysisResult, setAnalysisResult] = useState(null);
    const [waitingForAnalysisResult, _setWaitingForAnalysisResult] = useState(false);
    const waitingForAnalysisResultRef = useRef(false); // To be used in worker message handler
    const setWaitingForAnalysisResult = (state) => {
        waitingForAnalysisResultRef.current = state;
        _setWaitingForAnalysisResult(state);
    }

    const [searchProgress, setSearchProgress] = useState(0);
    const [openSettings, setOpenSettings] = useState(false); // State of AI settings modal
    const [positionModal, setPositionModal] = useState(null);

    const moveAudio = useRef(null);

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
                    if(!waitingForAnalysisResultRef.current) return;
                    setAnalysisResult({
                        bestMove: e.data.data.move,
                        pvLine: e.data.data.pvLine
                    });
                    const fromSquare = findFromSquare(game.current.board(), e.data.data.move, game.current.turn());
                    const toSquare = findToSquare(e.data.data.move);
                    const from = String.fromCharCode(fromSquare.j + 97) + String(8 - fromSquare.i);
                    const to = String.fromCharCode(toSquare.j + 97) + String(8 - toSquare.i);
                    setHint({from, to});
                    setWaitingForAnalysisResult(false);
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
        
    }, [])


    /********** Functions used by the component **********/

    function onMove(newMove, oldHistoryLength) {
        setCurPosition(oldHistoryLength);
        setHistory(history => [...(history.slice(0, oldHistoryLength)), newMove]);
        chessEngineWorker.current.postMessage({type: 'set-pgn', data: game.current.pgn()});
        moveAudio.current.play()
    }

    function flipBoard() {
        setOrientation(orientation => orientation === 'w' ? 'b' : 'w');
    }

    function reset() {
        if(!window.confirm("Are you sure that you want to reset the board?")) return;
        game.current = new Chess();
        chessEngineWorker.current.postMessage({type: 'reset'});
        setHistory([]);
        setWaitingForAnalysisResult(false);
        setCurPosition(-1);
        setAnalysisResult(null);
        moveAudio.current.play()
    }

    function analyze() {
        const searchData = {
            searchDepth,
            evalCap,
            maxPly: maxDepth
        };
        chessEngineWorker.current.postMessage({type: 'search', data: searchData});
        setWaitingForAnalysisResult(true);
    }

    function getBestMove() {
        return (analysisResult && analysisResult.bestMove) ? analysisResult.bestMove : "";
    }

    function getPvLine() {
        if(!(analysisResult && analysisResult.pvLine && analysisResult.pvLine.length)) return "";
        let pvLine = analysisResult && analysisResult.pvLine && analysisResult.pvLine.reduce((pvl, pvMove) => pvl += `${pvMove} `, '');
        return pvLine;
    }

    function rewindGame(toHistoryIndex) {
        while(game.current.history().length - 1 > toHistoryIndex) {
            game.current.undo();
        }
    }

    function fastForwardGame(toHistoryIndex) {
        while(game.current.history().length - 1 < toHistoryIndex) {
            game.current.move(history[game.current.history().length].move);
        }
    }

    function handleGoToStart() { 
        rewindGame(-1);
        setCurPosition(-1); 
        chessEngineWorker.current.postMessage({type: 'reset'});
        moveAudio.current.play()
    }

    function handleGoToPrev() { 
        if(currentPosition < 0) return;
        rewindGame(currentPosition-1);
        setCurPosition(curPos => curPos-1);
        chessEngineWorker.current.postMessage({type: 'undo'});
        moveAudio.current.play()
    }

    function handleGoToNext() {
        if(currentPosition >= history.length-1) return;
        fastForwardGame(currentPosition+1);
        chessEngineWorker.current.postMessage({type: 'move', data: history[currentPosition+1].move});
        setCurPosition(curPos => curPos+1);
        moveAudio.current.play()
    }

    function handleGoToEnd() {
        fastForwardGame(history.length-1);
        setCurPosition(history.length-1);
        chessEngineWorker.current.postMessage({type: 'set-pgn', data: game.current.pgn()});
        moveAudio.current.play()
    }

    function handleClickLoadPgn() {
        setPositionModal({
            loadPosition: loadPGN,
            positionFormat: 'PGN',
            closeModal: () => setPositionModal(null)
        });
    }

    function handleClickGetPgn() {
        fastForwardGame(history.length-1);
        const pgn = game.current.pgn();
        rewindGame(currentPosition);
        setPositionModal({
            position: pgn,
            positionFormat: 'PGN',
            closeModal: () => setPositionModal(null)
        });
    }

    function handleClickGetFen() {
        fastForwardGame(history.length-1);
        const fen = game.current.fen();
        rewindGame(currentPosition);
        setPositionModal({
            position: fen,
            positionFormat: 'FEN',
            closeModal: () => setPositionModal(null)
        });
    }

    function handleClickLoadFen() {
        setPositionModal({
            loadPosition: loadFEN,
            positionFormat: 'FEN',
            closeModal: () => setPositionModal(null)
        });
    }

    function loadPGN(pgn) {
        const success = game.current.load_pgn(pgn);
        if(success) {
            const moves = game.current.history();
            const verbose = game.current.history({verbose: true});
            const newHistory = moves.map((move, idx) => ({
                move,
                from: verbose[idx].from,
                to: verbose[idx].to
            }));
            setHistory(newHistory);
            setCurPosition(newHistory.length-1);
            setWaitingForAnalysisResult(false);
            chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn});
            moveAudio.current.play()
        }
        return success;
    }

    function loadFEN(fen) {
        const success = game.current.load(fen);
        if(success) {
            setHistory([]);
            setCurPosition(-1);
            setWaitingForAnalysisResult(false);
            chessEngineWorker.current.postMessage({type: 'set-fen', data: fen});
            moveAudio.current.play()
        }
        return success;
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
                positionModal &&
                <PositionModal {...positionModal} />
            }
            <div className="bounding-box">
                <PlayerInfo name={orientation === 'w' ? "Black" : "White"} />
                <div className="chessboard-wrapper">
                    <ChessBoard 
                        id="analysis"
                        game={game.current}
                        onMove = {onMove}
                        orientation = {orientation === 'w' ? 'white' : 'black'}
                        playerColor={game.current.turn()}
                        hint = {hint}
                        onHintShown = {onHintShown}
                        history={game.current.history({verbose: true})}
                        dimensionAdjustment = {{
                            width: {percent: 4},
                            height: {pixel: 84}
                        }}
                    />
                </div>
                <PlayerInfo  name={orientation === 'w' ? "White" : "Black"} />
            </div>
            <div className="sidebar">
                <div className="controls">
                    <button type="button" className="btn btn-dark controls-half-width" onClick={flipBoard}>Flip Board</button>
                    <button type="button" className="btn btn-dark controls-half-width" onClick={() => setOpenSettings(true)}>AI Settings</button>
                    <button type="button" className="btn btn-dark btn-block" onClick={reset}>Reset Board</button>
                    <button type="button" className="btn btn-dark btn-block" onClick={analyze} disabled={waitingForAnalysisResult}>
                        {waitingForAnalysisResult ? `Analyzing...(${searchProgress}%)` : 'Analyze Position'}
                    </button>
                    
                    <hr className='hr' />
                </div>
				<div className="text-center">
                    <span className="sidebar-heading">{'Points balance: '}</span>{calculatePointsByPiece(game.current.board())}
                    <hr className='hr' />
                </div>
                <div className="analysis-area">
                    <div><span className="sidebar-heading">Best Move:</span><span className="analysis-res">{` ${getBestMove()}`}</span></div>
                    <div><span className="sidebar-heading">Principal Variation:</span><span className="analysis-res">{` ${getPvLine()}`}</span></div>
                    <hr className='hr' />
                </div>
                <MoveHistory history={history} currentPosition={currentPosition} />
                <div className="controls">
                    <div className="occupy-width">
                        <button type="button" className="btn btn-dark" disabled={currentPosition === -1} onClick={handleGoToStart}>&lt;&lt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === -1} onClick={handleGoToPrev}>&lt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === history.length-1} onClick={handleGoToNext}>&gt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === history.length-1} onClick={handleGoToEnd}>&gt;&gt;</button>
                    </div>
                    <button type="button" className="btn btn-dark controls-half-width" onClick={handleClickLoadPgn}>Load PGN</button>
                    <button type="button" className="btn btn-dark controls-half-width" onClick={handleClickGetPgn} disabled={history.length === 0}>Get PGN</button>
                    <button type="button" className="btn btn-dark controls-half-width" onClick={handleClickLoadFen}>Load FEN</button>
                    <button type="button" className="btn btn-dark controls-half-width" onClick={handleClickGetFen} disabled={history.length === 0}>Get FEN</button>
                </div>
            </div>
            <audio ref={moveAudio} src={MoveSound} />
        </div>
    );
}

function sumTillN(n) {
    return (n*(n+1))/2;
}