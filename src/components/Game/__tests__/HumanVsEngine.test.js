import React from 'react'
import ChessJS from 'chess.js';
import { render, screen } from '@testing-library/react'
import HumanVsEngine from '../HumanVsEngine'

const getTestChessEngineWorkerCreator = () => {
    const mock = jest.fn();
    mock.mockReturnValue({
        postMessage: jest.fn(),
        terminate: jest.fn(),
    })
    return mock;
}

function getMockChessJS() {
    return ChessJS.Chess
}

describe('Human vs Engine', () => {
    test('it renders', () => {
        render(
            <HumanVsEngine 
                createChessEnginerWorker={getTestChessEngineWorkerCreator()} 
                Chess={getMockChessJS()}
            />)
        console.log(screen.debug())
    })
})