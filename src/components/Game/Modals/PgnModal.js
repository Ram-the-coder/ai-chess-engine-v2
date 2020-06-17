import React, {useRef, useState} from 'react';
import Modal from './Modal';

export default function PgnModal({pgn, loadPgn, closeModal}) {
    return (
        <Modal>
            {pgn ? <GetPgn pgn={pgn} closeModal={closeModal} /> : <LoadPgn loadPgn={loadPgn} closeModal={closeModal} />}
        </Modal>
    );
}

function GetPgn({pgn, closeModal}) {
    const pgnRef = useRef(null);
    const [tooltipText, setTooltipText] = useState('Copy to clipboard');
    function handleClick() {
        pgnRef.current.select();
        pgnRef.current.setSelectionRange(0, 99999);
        document.execCommand("copy");
        setTooltipText('Copied to clipboard!')
    }
    return (
        <>
        <h2>Here is the PGN for the game</h2>
        <div className="form-group">
            <input type="textarea" value={pgn} ref={pgnRef} className="form-control" />
        </div>
        <div className="myRow">
            <div className="myTooltip">
                <button className="btn btn-success" onClick={handleClick} onMouseOut={() => setTooltipText('Copy to cliboard')}>
                    <span className="tooltiptext" id="myTooltip"> {tooltipText} </span>
                    Copy PGN
                </button>
            </div>
            <button className="btn btn-danger" onClick={closeModal}>Close</button>
        </div>
        </>
    );
}

function LoadPgn(loadPgn, closeModal) {
    const pgnRef = useRef(null);
    function handlePgnLoad() {
        if(loadPgn(pgnRef)) closeModal();
        else console.log("Invalid pgn");
    }
    return (
        <>
        <h3>Paste the pgn below:</h3>
        <div className="form-group">
        <input 
            ref = {pgnRef} 
            className = "form-control"
            readOnly />
        </div>
        <button className="btn btn-success" onClick={handlePgnLoad}>Load PGN</button>
        </>
    );
}