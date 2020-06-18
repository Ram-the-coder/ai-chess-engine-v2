import React, {useState} from 'react';
import {Link} from 'react-router-dom';

export default function Navbar() {
    const [active, setActive] = useState("home")
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">Chess</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#my-nav" aria-controls="my-nav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" />
            </button>
            <div class="collapse navbar-collapse" id="my-nav">
                <ul class="navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/ai">Play vs AI</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/analysis">Analysis Board</Link>
                    </li>
                </ul>
            </div>

        </nav>

    );
}