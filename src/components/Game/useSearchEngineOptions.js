import { useState } from "react";

export default function useSearchEngineOptions(game, chessEngine) {
    const [searchDepth, _setSearchDepth] = useState(parseInt(localStorage.getItem('searchDepth')) || 3); // Search engine-related state
    const [maxDepth, _setMaxDepth] = useState(parseInt(localStorage.getItem('maxDepth')) || 3); // Search engine-related state
    const [evalCap, _setEvalCap] = useState(parseInt(localStorage.getItem('evalCap')) || 15000); // Search engine-related state

    // Save any changes to AI settings to localstorage
    const setSearchDepth = (newDepth) => {
        if(searchDepth < newDepth) {
            chessEngine.init();
            chessEngine.setPgn(game.current.pgn());
        }
        _setSearchDepth(newDepth);
        localStorage.setItem('searchDepth', newDepth);
    }

    const setMaxDepth = (newDepth) => {
        if(maxDepth < newDepth) {
            chessEngine.init();
            chessEngine.setPgn(game.current.pgn());
        }
        _setMaxDepth(newDepth);
        localStorage.setItem('maxDepth', newDepth);
    }

    const setEvalCap = (newCap) => {
        if(evalCap < newCap) {
            chessEngine.init();
            chessEngine.setPgn(game.current.pgn());
        }
        _setEvalCap(newCap);
        localStorage.setItem('evalCap', newCap);
    }

    const options = { searchDepth, maxDepth, evalCap }
    const setOptions = { setSearchDepth, setMaxDepth, setEvalCap }
    return [options, setOptions]
}