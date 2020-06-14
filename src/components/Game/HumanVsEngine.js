import React, { useRef, useEffect, useState } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece} from '../../chessEngine/util';
import MoveHistory from './MoveHistory';
import Modal from './Modal';

import './HumanVsEngine.css';


function HumanVsEngine() {

    const game = useRef(new Chess());
    const [history, setHistory] = useState([]);
    const [searchDepth, setSearchDepth] = useState(3);
    const [maxDepth, setMaxDepth] = useState(5);
    const [evalCap, setEvalCap] = useState(20000);
    const [isAIthinking, setisAIthinking] = useState(false);
    const [playerColor, setPlayerColor] = useState('w');
    const [openSettings, setOpenSettings] = useState(false);

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
                />
            </div>
            <div className="sidebar">
                <div className="controls">
                    <button className="btn btn-dark controls-half-width">Undo</button>
                    <button className="btn btn-dark controls-half-width">New Game</button>
                    <button className="btn btn-dark controls-half-width">Hint</button>
                    <button className="btn btn-dark controls-half-width">Switch Sides</button>
                    <button className="btn btn-dark btn-block" onClick={() => setOpenSettings(true)}>AI Settings</button>
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
