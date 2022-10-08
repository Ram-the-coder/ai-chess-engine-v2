export function chessEngineInterface(chessEngineWorker) {
    let _chessEngineWorker = null;
    return {
        createWorker: (createChessEnginerWorker) => {
            _chessEngineWorker = createChessEnginerWorker()
        },
        init: () => chessEngineWorker.current.postMessage({type: 'init'}),
        setPgn: (pgn) => chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn}),
        search: searchOptions => chessEngineWorker.current.postMessage({type: 'search', data: searchOptions}),
        move: move => chessEngineWorker.current.postMessage({type: 'move', data: move}),
        undo: () => chessEngineWorker.current.postMessage({type: 'undo'}),
        reset: () => chessEngineWorker.current.postMessage({type: 'reset'}),
        hint: searchOptions => chessEngineWorker.current.postMessage({type: 'hint', data: searchOptions}),
    }
}

export function handleWorkerMessage(e, { onHintResult, onSearchProgress, onAiMoveDecision }) {
    switch(e.data.type) {
        case 'search':return handleSearchResult(e); // AI's move
        case 'hint': return handleHintResult(e);
        case 'search-update': return handleSearchUpdate(e);
        default: 
            console.log("Unhandled message from worker", e.data);
            break;
    }

    function handleHintResult() {
        onHintResult(e.data.data.move)
    }

    function handleSearchUpdate() {
        const { currentDepth, searchDepth } = e.data.data;
        onSearchProgress(Math.floor((sumTillN(currentDepth) * 100) / sumTillN(searchDepth)))
    }

    function handleSearchResult() {
        onAiMoveDecision(e.data.data.move)
    }
}

function sumTillN(n) {
    return (n*(n+1))/2;
}

