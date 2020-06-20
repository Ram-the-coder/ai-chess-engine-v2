import React, {useState, useRef, useEffect} from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import ChessEngineWorker from '../../chessEngine/engine.worker';
import {calculatePointsByPiece, findFromSquare, findToSquare} from '../../chessEngine/util';
import SettingsModal from './Modals/SettingsModal';
import PlayerInfo from './PlayerInfo';
import MoveHistory from './MoveHistory';

import MoveSound from '../../assets/Move.mp3';

import './Game.css';

export default function Analysis() {

    /********** States and Refs **********/

    const game = useRef(new Chess());
    const chessEngineWorker = useRef();

    const [searchDepth, _setSearchDepth] = useState(localStorage.getItem('searchDepth') || 3); // Search engine-related state
    const [maxDepth, _setMaxDepth] = useState(localStorage.getItem('maxDepth') || 3); // Search engine-related state
    const [evalCap, _setEvalCap] = useState(localStorage.getItem('evalCap') || 15000); // Search engine-related state

    // Save any changes to AI settings to localstorage
    const setSearchDepth = (newDepth) => {
        _setSearchDepth(newDepth);
        localStorage.setItem('searchDepth', newDepth);
    }

    const setMaxDepth = (newDepth) => {
        _setMaxDepth(newDepth);
        localStorage.setItem('maxDepth', newDepth);
    }

    const setEvalCap = (newCap) => {
        _setEvalCap(newCap);
        localStorage.setItem('evalCap', newCap);
    }

    const [history, setHistory] = useState([]); // Used as state -> condition on which to re-render on move
    const [currentPosition, setCurPosition] = useState(-1);
    const [orientation, setOrientation] = useState('w');
    const [analysisResult, setAnalysisResult] = useState({});
    const [waitingForAnalysisResult, _setWaitingForAnalysisResult] = useState(false);
    const waitingForAnalysisResultRef = useRef(false); // To be used in worker message handler
    const setWaitingForAnalysisResult = (state) => {
        waitingForAnalysisResultRef.current = state;
        _setWaitingForAnalysisResult(state);
    }

    const [openSettings, setOpenSettings] = useState(false); // State of AI settings modal


    /********** Effects **********/

    useEffect(() => {
        // Instantiate the thread in which the chess engine will run
        chessEngineWorker.current = new ChessEngineWorker();
        chessEngineWorker.current.onmessage = handleWorkerMessage;
        chessEngineWorker.current.postMessage({type:'init'});

        function handleWorkerMessage(e) {
            console.log(e.data);
            switch(e.data.type) {
                case 'search':{
                    if(!waitingForAnalysisResultRef.current) return;
                    setAnalysisResult({
                        bestMove: e.data.data.move,
                        pvLine: e.data.data.pvLine
                    });
                    setWaitingForAnalysisResult(false);
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
    }

    function flipBoard() {
        setOrientation(orientation => orientation === 'w' ? 'b' : 'w');
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
        if(!(JSON.stringify(analysisResult !== '{}') && analysisResult.bestMove)) return "";
        return analysisResult.bestMove;
    }

    function getPvLine() {
        if(!(JSON.stringify(analysisResult) !== '{}' && analysisResult.pvLine && analysisResult.pvLine.length)) return "";
        let pvLine = analysisResult && analysisResult.pvLine && analysisResult.pvLine.reduce((pvl, pvMove) => pvl += `${pvMove} `, '');
        return pvLine;
    }

    function rewindGame(toHistoryIndex) {
        while(game.current.history().length - 1 > toHistoryIndex) {
            game.current.undo();
        }
        console.log(game.current.history());
    }

    function fastForwardGame(toHistoryIndex) {
        while(game.current.history().length - 1 < toHistoryIndex) {
            game.current.move(history[game.current.history().length]);
        }
    }

    function handleGoToStart() { 
        rewindGame(-1);
        setCurPosition(-1); 
    }

    function handleGoToPrev() { 
        if(currentPosition < 0) return;
        rewindGame(currentPosition-1);
        setCurPosition(curPos => curPos-1);
    }

    function handleGoToNext() {
        if(currentPosition >= history.length-1) return;
        fastForwardGame(currentPosition+1);
        setCurPosition(curPos => curPos+1);
    }

    function handleGoToEnd() {
        fastForwardGame(history.length-1);
        setCurPosition(history.length-1);
    }

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
            <div className="bounding-box">
                <PlayerInfo name={orientation === 'w' ? "Black" : "White"} />
                <div className="chessboard-wrapper">
                    <ChessBoard 
                        id="analysis"
                        game={game.current}
                        onMove = {onMove}
                        orientation = {orientation === 'w' ? 'white' : 'black'}
                        playerColor={game.current.turn()}
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
                    <button type="button" className="btn btn-dark btn-block controls-half-width" onClick={() => setOpenSettings(true)}>AI Settings</button>
                    <div className="occupy-width">
                        <button type="button" className="btn btn-dark" onClick={analyze} disabled={waitingForAnalysisResult}>
                            {waitingForAnalysisResult ? 'Analyzing...' : 'Analyze Position'}
                        </button>
                    </div>
                    <hr className='hr' />
                </div>
				<div className="text-center">
                    <span className="sidebar-heading">{'Points balance: '}</span>{calculatePointsByPiece(game.current.board())}
                    <hr className='hr' />
                </div>
                <div className="analysis-area">
                    <div><span className="sidebar-heading">Best Move:</span>{` ${getBestMove()}`}</div>
                    <div><span className="sidebar-heading">Principal Variation:</span>{` ${getPvLine()}`}</div>
                    <hr className='hr' />
                </div>
                <MoveHistory history={history} current={currentPosition} />
                <div className="controls">
                    <div className="occupy-width">
                        <button type="button" className="btn btn-dark" disabled={currentPosition === -1} onClick={handleGoToStart}>&lt;&lt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === -1} onClick={handleGoToPrev}>&lt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === history.length-1} onClick={handleGoToNext}>&gt;</button>
                        <button type="button" className="btn btn-dark" disabled={currentPosition === history.length-1} onClick={handleGoToEnd}>&gt;&gt;</button>
                    </div>
                    <button type="button" className="btn btn-dark controls-half-width">Load PGN</button>
                    <button type="button" className="btn btn-dark controls-half-width">Get PGN</button>
                    <button type="button" className="btn btn-dark controls-half-width">Load FEN</button>
                    <button type="button" className="btn btn-dark controls-half-width">Get FEN</button>
                </div>
            </div>
        </div>
    );
}