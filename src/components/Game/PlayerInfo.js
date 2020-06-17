import React from 'react';

import './PlayerInfo.css';

export default function PlayerInfo({name, thinkingText, isThinking}) {
    return (
        <div className="player-info">
            <div className="sidebar-heading">{name}</div>
            {isThinking && <div className="sidebar-heading thinking-text blink">{thinkingText}</div>}
        </div>
    );
}