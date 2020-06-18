import React from 'react';
import {Link} from 'react-router-dom';
import GithubLogo from '../../assets/github-logo-2.png'


import './Home.css';

export default function Home() {
    return (
        <div className="container about">
            <h2>About</h2>
            <p>
                Consists of a chess engine that uses an iterative deepening search and various optimizations to find the best move. 
                The chess engine is written in javascript from scratch. 
                The engine is connected to a chessboard so that one can play against it. 
                Though it is nowhere as powerful or as fast as the popular stockfish (the 2nd most powerful chess engine), 
                it still can play well enough to beat a novice easily.
            </p>
            <div className="btn-group">
                <a href="https://github.com/Ram-the-coder/ai-chess-engine-v2/" target="_blank" rel="noopener noreferrer" className="btn btn-dark github">
                    <img src={GithubLogo} alt="Github Logo" />
                    <span>Github Repo</span>
                </a>
                
                <Link to="/ai" className="btn btn-success">Play vs AI</Link>

                <Link to="/analysis" className="btn btn-dark">Analysis Board</Link>
            </div>
        </div>
    );
}