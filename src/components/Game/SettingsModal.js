import React from 'react';
import Modal from './Modal';

export default function SettingsModal({searchDepth, setSearchDepth, maxDepth, setMaxDepth, evalCap, setEvalCap, setOpenSettings}) {
    return (
        <Modal>
            <div className="settings-wrapper">
                <div className="text-center"><h2>AI Engine Settings</h2></div>
                <small>Hover over the text for description</small>
                <small>Changing these values will affect the Speed and the Strength of the chess engine.</small>
                <div className="form-group row">
                    <label 
                        htmlFor="sdepth" 
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
                <div className="form-group row">
                    <label 
                        htmlFor="mdepth" 
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
                <div className="form-group row">
                    <label 
                        htmlFor="eval-cap" 
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
        </Modal>
    );
}

