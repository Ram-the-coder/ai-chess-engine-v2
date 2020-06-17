import React from 'react';
import Modal from './Modal';

const gameEndStatusCode = {
	CHECKMATE_BY_WHITE: 1,
	CHECKMATE_BY_BLACK: 2,
	STALEMATE: 3,
	THREEFOLD_REP: 4,
	INSUFFICIENT_MAT: 5,
	FIFTY_MOVE: 6
};

export default function GameoverModal({playerColor, statusCode, startNewGame, closeModal}) {

    let text = "", result = "";

    switch (statusCode) {
        case gameEndStatusCode.CHECKMATE_BY_WHITE:
            text = (playerColor === 'w') 
                        ? "Congratulations, you've won by a checkmate!"
                        : "You have been defeated by a checkmate";
            result = (playerColor === 'w') ? "Victory" : "Defeat";
            break;

        case gameEndStatusCode.CHECKMATE_BY_BLACK:
            text = (playerColor === 'b') 
                        ? "Congratulations, you've won by a checkmate!"
                        : "You have been defeated by a checkmate";
            result = (playerColor === 'b') ? "Victory" : "Defeat";
            break;
    
        case gameEndStatusCode.STALEMATE: 
            text = "The game has been drawn by stalemate"; 
            result = "Draw";
            break;
        
        case gameEndStatusCode.THREEFOLD_REP: 
            text = "The game has been drawn by a three fold repetition"; 
            result = "Draw";
            break;

        case gameEndStatusCode.INSUFFICIENT_MAT: 
            text = "The game has been drawn due to insufficient material"; 
            result = "Draw";
            break;

        case gameEndStatusCode.FIFTY_MOVE: 
            text = "The game has been drawn due to the fifty move rule"; 
            result = "Draw";
            break;

        default: break;
    }

    return (
        <Modal className="settings-wrapper">
            <h2 style={{margin: "2vh"}}>{result}</h2>
            <div style={{margin: "2vh"}}>{text}</div>
            <div className="btn-row" style={{margin: "2vh"}}>
                <button className="btn btn-success" onClick={startNewGame}>New Game</button>
                <button className="btn btn-danger" onClick={closeModal}>Close</button>
            </div>
        </Modal>
    );
}

