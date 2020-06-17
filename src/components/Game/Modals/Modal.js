import React from 'react';
import './Modal.css';

export default function Modal({children, className}) {
    return (
        <div className="modal-pop-outer">
            <div className={`modal-pop-inner ${className}`}>
                {children}
            </div>
        </div>
    );
}