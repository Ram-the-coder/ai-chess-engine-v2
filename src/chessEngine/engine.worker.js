import { handleInit, handleMove, handleReset, handleSearch, handleSetFen, handleSetPgn, handleUndo } from "./incomingMessageHandlers";

self.addEventListener('message', e => {
    // console.log(e.data);
    switch(e.data.type) {
        case 'init': return handleInit(e.data)
        case 'move': return handleMove(e.data)
        case 'hint':
        case 'search': return handleSearch(e.data)
        case 'undo': return handleUndo();   
        case 'set-pgn': return handleSetPgn(e.data)
        case 'set-fen': return handleSetFen(e.data)
        case 'reset': return handleReset(e.data)
        default: 
            console.log("Invalid message type");
            break;
    }
})
