import React, {useRef, useState, useEffect} from 'react';
import Modal from './Modal';
import {toast} from 'react-toastify';

export default function PositionModal({position, loadPosition, positionFormat, closeModal}) {
    return (
        <Modal>
            {
                position 
                    ? <GetPosition position={position} positionFormat={positionFormat} closeModal={closeModal} /> 
                    : <LoadPosition loadPosition={loadPosition} positionFormat={positionFormat} closeModal={closeModal} />
            }
        </Modal>
    );
}

function GetPosition({position, positionFormat, closeModal}) {
    const positionRef = useRef(null);
    const [tooltipText, setTooltipText] = useState('Copy to clipboard');
    function handleClick() {
        positionRef.current.select();
        positionRef.current.setSelectionRange(0, 99999);
        document.execCommand("copy");
        setTooltipText('Copied to clipboard!')
    }
    return (
        <>
        <h2>Here is the {positionFormat}</h2>
        <div className="form-group">
            <textarea value={position} ref={positionRef} className="form-control my-text-area" readOnly />
        </div>
        <div className="myRow">
            <div className="myTooltip">
                <button className="btn btn-success" onClick={handleClick} onMouseOut={() => setTooltipText('Copy to cliboard')}>
                    <span className="tooltiptext" id="myTooltip"> {tooltipText} </span>
                    Copy {positionFormat}
                </button>
            </div>
            <button type="button" className="btn btn-danger" onClick={closeModal}>Close</button>
        </div>
        </>
    );
}

function LoadPosition({loadPosition, positionFormat, closeModal}) {
    // const [position, setPosition] = useState("");
    const inputRef = useRef(null);
    
    useEffect(() => {
        if(inputRef.current) inputRef.current.focus();
    }, [inputRef]);

    function handlePositionLoad(e) {
        e.preventDefault();
        if(loadPosition(inputRef.current.value)) closeModal();
        else {
            toast.error(`Invalid ${positionFormat}`);
            console.log(`Invalid ${positionFormat}`);
            inputRef.current.value = "";
            inputRef.current.focus();
        }
    }
    return (
        <>
            <h3>Paste the {positionFormat} below:</h3>
            <form onSubmit={handlePositionLoad}>
                <div className="form-group">
                    <textarea 
                        ref = {inputRef}
                        className = "form-control my-text-area"
                    />
                </div>
                <div className="myRow">
                    <button type="submit" className="btn btn-success">Load {positionFormat}</button>
                    <button type="button" className="btn btn-danger" onClick={closeModal}>Close</button>
                </div>
            </form>
        </>
    );
}