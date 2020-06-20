import React, {useState} from 'react';
import Modal from './Modal';

const MIN_SEARCH_DEPTH = 1;
// const MIN_MAX_DEPTH = 1;
const MAX_SEARCH_DEPTH = 10;
const MAX_MAX_DEPTH = 10;
const MIN_EVAL_CAP = 5000;

export default function SettingsModal({searchDepth, setSearchDepth, maxDepth, setMaxDepth, evalCap, setEvalCap, setOpenSettings}) {

    const [curSearchDepth, setCurSearchDepth] = useState(searchDepth);
    const [curMaxDepth, setCurMaxDepth] = useState(maxDepth);
    const [curEvalCap, setCurEvalCap] = useState(evalCap);

    function handleSearchDepthChange(e) {
        const val = parseInt(e.target.value);
        setCurSearchDepth(val);
    }

    function handleMaxDepthChange(e) {
        const val = parseInt(e.target.value);
        setCurMaxDepth(val);
    }

    function handleEvalCapChange(e) {
        const val = parseInt(e.target.value);
        setCurEvalCap(val);
    }

    function handleSubmit(e) {
        setSearchDepth(curSearchDepth);
        setMaxDepth(curMaxDepth);
        setEvalCap(curEvalCap);
        setOpenSettings(false);
    }

    return (
        <Modal className="settings-wrapper">
            <div className="text-center"><h2>AI Engine Settings</h2></div>
            <div className="info">
                <small>Hover over the settings for description</small>
                <small>
                    Changing these values will affect the Speed and the Strength of the chess engine.
                    If you feel that the AI is weak, try increase the search depth / max depth under the AI Settings. 
                    Alternatively if you feel that it is strong, try decreasing the seach depth / max depth.
                </small>
                <small>
                    For a fast and strong response from the engine, set search depth and max depth at 3 if you are using a mobile to access the application
                    else if you are using a PC to access the application then set the search depth at 3 and max depth at 5.
                </small>
            </div>
            <form className="myForm" onSubmit={handleSubmit}>
                <div className="form-group row">
                    <label 
                        htmlFor="sdepth" 
                        className = "col-sm-8 col-form-label"
                        title="The least number of moves the engine looks ahead for every move in the current position"
                    > Search Depth:</label>
                    <input 
                        type="number" 
                        id="sdepth"
                        min={MIN_SEARCH_DEPTH} max={MAX_SEARCH_DEPTH} 
                        className="form-control col-sm-4"
                        value = {curSearchDepth}
                        onChange = {handleSearchDepthChange}
                    />
                </div>
                <div className="form-group row">
                    <label 
                        htmlFor="mdepth" 
                        className = "col-sm-8 col-form-label"
                        title="The maximum number of moves the engine looks ahead for every move in the current position"
                    > Max Depth:</label>
                    <input 
                        type="number" 
                        id="mdepth"
                        min={curSearchDepth} max={MAX_MAX_DEPTH} 
                        className="form-control col-sm-4"
                        value = {curMaxDepth}
                        onChange = {handleMaxDepthChange}
                    />
                </div>
                <div className="form-group row">
                    <label 
                        htmlFor="eval-cap" 
                        className = "col-sm-8 col-form-label"
                        title="The maximum number of positions the engine will evaluate"
                    > Evaluation Cap:</label>
                    <input 
                        type="number"
                        id="eval-cap" 
                        min={MIN_EVAL_CAP}
                        className="form-control col-sm-4"
                        value = {curEvalCap}
                        onChange = {handleEvalCapChange}
                    />
                </div>
            
                <button type="submit" className="btn btn-success btn-block">Done</button>
            </form>
        </Modal>
    );
}

