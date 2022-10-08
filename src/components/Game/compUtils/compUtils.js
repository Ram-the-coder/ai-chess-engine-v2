import React from "react"

export function ControlButton(props) {
    const { children, className = '', ...rest } = props
    return (
        <button 
            className={`btn btn-dark controls-half-width ${className}`} 
            {...rest}>{children}
        </button>
    )
}

export function ControlBtnHalf(props) {
    return <ControlButton {...{...props, className: 'controls-half-width'}} />
}

export function ControlBtnBlock(props) {
    return <ControlButton {...{...props, className: 'btn-block'}} />
}
