import React from 'react';
import './Modal.css';

export default function Modal({children}) {
    return (
        <div className="modal-pop-outer">
            <div className="modal-pop-inner">
                {children}
            </div>
        </div>
    );
}