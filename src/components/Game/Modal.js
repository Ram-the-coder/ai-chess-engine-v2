import React from 'react';

export default function Modal({searchDepth, setSearchDepth, maxDepth, setMaxDepth, evalCap, setEvalCap, setOpenSettings}) {
    return (
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
    );
}

