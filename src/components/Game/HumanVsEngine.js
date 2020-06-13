import React, { useRef, useEffect } from 'react';
import ChessBoard from '../ChessBoard/ChessBoard';
import Chess from 'chess.js';


function HumanVsEngine() {

    const game = useRef(new Chess());
    const history = useRef([]);

	return (
        <ChessBoard 
            game = {game.current}
            history = {history.current}
            updateHistory = {updateHistory}
        />
    );

    function updateHistory(newHistory) {
        history.current = newHistory;
    }
}

export default HumanVsEngine;
