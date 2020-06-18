import React from 'react';
import {Link, useLocation} from 'react-router-dom';

export default function Navbar() {
    let active = useLocation().pathname;
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">Chess</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#my-nav" aria-controls="my-nav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="my-nav">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link className={`nav-link ${active === '/' && 'active'}`} to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${active === '/ai' && 'active'}`} to="/ai">Play vs AI</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${active === '/analysis' && 'active'}`} to="/analysis">Analysis Board</Link>
                    </li>
                </ul>
            </div>

        </nav>

    );
}