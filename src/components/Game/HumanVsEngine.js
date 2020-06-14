import React, { useRef, useEffect, useState } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';
import {calculatePointsByPiece} from '../../chessEngine/util';
import chessPieces from '../ChessBoard/chessPieces.js';

import './HumanVsEngine.css';


function HumanVsEngine() {

    const game = useRef(new Chess());
    
    const [history, setHistory] = useState([]);
    const [searchDepth, setSearchDepth] = useState(3);
    const [maxDepth, setMaxDepth] = useState(5);
    const [evalCap, setEvalCap] = useState(20000);
    const [isAIthinking, setisAIthinking] = useState(false);
    const [playerColor, setPlayerColor] = useState('unset');
    const [openSettings, setOpenSettings] = useState(false);

	return (
        <div className="game">
            {
                openSettings &&
                <div id="myModal" className="settings-pop-outer">
                    <div className="settings-pop-inner">
                        <div className="settings-wrapper">
                            <div className="text-center"><h2>AI Engine Settings</h2></div>
                            <small>Hover over the text for description</small>
                            <small>Changing these values will affect the Speed and the Strength of the chess engine.</small>
                            <div class="form-group row">
                                <label 
                                    for="sdepth" 
                                    className = "col-sm-8 col-form-label"
                                    title="The least number of moves the engine looks ahead for every move in the current position"
                                > Search Depth:</label>
                                <input 
                                    type="number" 
                                    id="sdepth"
                                    min="1" max="10" 
                                    className="form-control col-sm-4"
                                    value = {searchDepth}
                                    onChange = {(e) => setSearchDepth(e.target.value)}
                                />
                            </div>
                            <div class="form-group row">
                                <label 
                                    for="mdepth" 
                                    className = "col-sm-8 col-form-label"
                                    title="The maximum number of moves the engine looks ahead for every move in the current position"
                                > Max Depth:</label>
                                <input 
                                    type="number" 
                                    id="mdepth"
                                    min="1" max="10" 
                                    className="form-control col-sm-4"
                                    value = {maxDepth}
                                    onChange = {(e) => setMaxDepth(e.target.value)}
                                />
                            </div>
                            <div class="form-group row">
                                <label 
                                    for="eval-cap" 
                                    className = "col-sm-8 col-form-label"
                                    title="The maximum number of positions the engine will evaluate"
                                > Evaluation Cap:</label>
                                <input 
                                    type="number"
                                    id="eval-cap" 
                                    min="1" max="10" 
                                    className="form-control col-sm-4"
                                    value = {evalCap}
                                    onChange = {(e) => setEvalCap(e.target.value)}
                                />
                            </div>
                            
                            <button className="btn btn-success btn-block" onClick={() => setOpenSettings(false)}>Done</button>
                        </div>
                    </div>
                </div>
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

function MoveHistory({history}) {
    const [jsx, setJsx] = useState([]);

    useEffect(() => {
        let newJsx = [];
        let odd = true;
        for(let i=1; i<history.length; i+=2) {
            const key = `${history.length}-${i}`;
            newJsx.push(
                <div className={`row ${odd ? 'my-bg-light' : 'my-bg-dark'}`} key={key}>
                    <span className="col-2">{`${Math.ceil(i/2)}. `}</span>
                    <div className="col-5">{history[i-1]}</div>
                    <div className="col-5">{history[i]}</div>
                </div>
            );
            odd = !odd;
        }

        if(history.length % 2) {
            const key = `${history.length}-${history.length}`;
            newJsx.push(
                <div className={`row ${odd ? 'my-bg-light' : 'my-bg-dark'}`} key={key}>
                    <span className="col-2">{`${Math.ceil(history.length/2)}. `}</span>
                    <div className="col-5">{history[history.length-1]}</div>
                </div>
            );
        }

        setJsx(newJsx);

    }, [history])

    return (
        <div className="moves">
            {jsx}
        </div>
    )

}

export default HumanVsEngine;
