import React from 'react';
import faPieces from './fa-chess';
import './Loader.css';

export default function Loader() {
    return (
        <div className="container">
            <div className='l-container'>
                <div className='chess-loader'>
                    <svg height="70" viewBox="0 0 70 70" className="first"><g>{faPieces.pawn}</g></svg>
                    <svg height="70" viewBox="0 0 70 70" className="second"><g>{faPieces.knight}</g></svg>
                    <svg height="70" viewBox="0 0 70 70" className="third"><g>{faPieces.rook}</g></svg>
                    <svg height="70" viewBox="0 0 70 70" className="fourth"><g>{faPieces.king}</g></svg>
                </div>
            </div>
            <h3>Loading, please wait</h3>
        </div>
    )
}