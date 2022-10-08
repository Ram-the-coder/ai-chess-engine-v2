export function chessEngineInterface(chessEngineWorker) {
    return {
        init: () => chessEngineWorker.current.postMessage({type: 'init'}),
        setPgn: (pgn) => chessEngineWorker.current.postMessage({type: 'set-pgn', data: pgn}),
        search: searchOptions => chessEngineWorker.current.postMessage({type: 'search', data: searchOptions}),
        move: move => chessEngineWorker.current.postMessage({type: 'move', data: move}),
        undo: () => chessEngineWorker.current.postMessage({type: 'undo'}),
        reset: () => chessEngineWorker.current.postMessage({type: 'reset'}),
        hint: searchOptions => chessEngineWorker.current.postMessage({type: 'hint', data: searchOptions}),
    }
}