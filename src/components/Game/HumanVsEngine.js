import React, { useRef, useEffect, useState } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import Modal from './Modal';
import ChessEngineWorker from '../../chessEngine/engine.worker';

import './HumanVsEngine.css';


function HumanVsEngine() {

    const game = useRef(new Chess());
    const chessEngineWorker = useRef();
    const [history, setHistory] = useState([]);
    const [searchDepth, setSearchDepth] = useState(3);
    const [maxDepth, setMaxDepth] = useState(5);
    const [evalCap, setEvalCap] = useState(20000);
    const [isAIthinking, setisAIthinking] = useState(false);
    const [playerColor, setPlayerColor] = useState('w');
    const [openSettings, setOpenSettings] = useState(false);

    useEffect(() => {
        chessEngineWorker.current = new ChessEngineWorker();
        chessEngineWorker.current.onmessage = e => console.log(e);
        chessEngineWorker.current.postMessage({type: "init"});

        return () => chessEngineWorker.current.terminate();
    }, []);

    function undoGame() {
        if(game.current.turn() !== playerColor) return; // Disable undo while AI is thinking
        game.current.undo();
        let newHistory = [...history];
        newHistory.pop();
        if(game.current.turn() !== playerColor) { // Undo the previous move of AI too
            game.current.undo();
            newHistory.pop();
        } 
        setHistory(newHistory);
    }

    function newGame() {
        game.current = new Chess();
        setHistory([]);
    }

    function showHint() {

    }

    function switchSides() {
        setPlayerColor(playerColor === 'w' ? 'b' : 'w');
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
                    history = {history}
                    updateHistory = {setHistory}
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
