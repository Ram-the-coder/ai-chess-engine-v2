import React from 'react'
import ChessJS from 'chess.js';
import { act, render, screen } from '@testing-library/react'
import { last, noop } from 'lodash'
import HumanVsEngine from '../HumanVsEngine'
import ChessBoardJSX from 'chessboardjsx';

function getTestChessEngineWorkerCreator() {
    const constructorMock = jest.fn();
    const postMessageMock = jest.fn()
    const terminateMock = jest.fn()
    constructorMock.mockReturnValue({
        postMessage: postMessageMock,
        terminate: terminateMock,
    })
    return { constructorMock, postMessageMock, terminateMock };
}

function getMockChessGame() {
    return ChessJS.Chess
}
HTMLMediaElement.prototype.play = noop

// let onSquareClick = noop
jest.mock('chessboardjsx', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid='chessboard-jsx-mock'></div>)
}));

jest.useFakeTimers();

const getLastPassedPropsToChesboardJSX = () => last(ChessBoardJSX.mock.calls)[0]

function click(square) {
    const { onSquareClick } = getLastPassedPropsToChesboardJSX();    
    return onSquareClick(square)
}
function clickMove(fromSq, toSq) {
    act(() => click(fromSq))
    act(() => click(toSq))
}

describe('Human vs Engine', () => {
    beforeEach(() => {
        const { constructorMock } = getTestChessEngineWorkerCreator()
        render(
            <HumanVsEngine 
                createChessEnginerWorker={constructorMock} 
                getNewChessGame={getMockChessGame()}
            />);
    })

    test('it renders', () => {
        
        ['game-container', 'main-board', 'chessboard-wrapper', 'sidebar', 'chessboard-jsx-mock'].forEach(elementTestId => {
            expect(screen.getByTestId(elementTestId)).toBeTruthy();
        });
    })
})

describe.only('Chess Engine', () => {
    let constructorMock, postMessageMock, terminateMock;
    const isMoveType = type => call => call[0].type === type;
    beforeEach(() => {
        ({ constructorMock, postMessageMock, terminateMock } = getTestChessEngineWorkerCreator());
        render(
            <HumanVsEngine 
                createChessEnginerWorker={constructorMock} 
                getNewChessGame={getMockChessGame()}
            />);
    })

    test('it is created', () => {
        expect(constructorMock.mock.calls.length).toEqual(1)
    })

    test('init is called', () => {
        expect(postMessageMock.mock.calls[0][0]).toEqual({ type: 'init'})
    })

    test('move is called after human makes a move', () => {
        expect(postMessageMock.mock.calls.filter(isMoveType('move')).length).toEqual(0);
        clickMove('e2', 'e4');
        expect(postMessageMock.mock.calls.filter(isMoveType('move')).length).toEqual(1);
        expect(postMessageMock.mock.calls.filter(isMoveType('move'))[0][0]).toEqual({type: 'move', data: 'e4'});
    })

    test('search is called after human makes a move', () => {
        expect(postMessageMock.mock.calls.filter(isMoveType('search')).length).toEqual(0);
        clickMove('e2', 'e4');
        jest.runAllTimers();
        expect(postMessageMock.mock.calls.filter(isMoveType('search')).length).toEqual(1);
        expect(postMessageMock.mock.calls.filter(isMoveType('search'))[0][0]).toEqual({type: 'search', data: {
            searchDepth: 3,
            maxPly: 3,
            evalCap: 15000
        }});
    })
})

describe('Chessboard', () => {
    beforeEach(() => {
        const { constructorMock } = getTestChessEngineWorkerCreator()
        render(
            <HumanVsEngine 
                createChessEnginerWorker={constructorMock} 
                getNewChessGame={getMockChessGame()}
            />);
    })

    test('making a move by click updates the position', () => {
        let { position } = getLastPassedPropsToChesboardJSX();
        expect(position).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        clickMove('e2', 'e4');
        const { position: positionAfterMove } = getLastPassedPropsToChesboardJSX();
        expect(positionAfterMove).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    })

    test('making a move by drag and drop updates the position', () => {
        const { position, onDrop, allowDrag } = getLastPassedPropsToChesboardJSX();
        expect(position).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
        act(() => {
            allowDrag({ piece: 'wP' }) && onDrop({ sourceSquare: 'e2', targetSquare: 'e4' });
        })
        expect(position).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    })

    test('clicking while its AIs turn is not allowed', () => {
        clickMove('e2', 'e4');
        clickMove('e7', 'e5');
        const { position: positionAfterMove } = getLastPassedPropsToChesboardJSX();
        expect(positionAfterMove).toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    })

    test('move from AI is seen on the chessboard', () => {
        clickMove('e2', 'e4');

    })
})

describe('Sidebar', () => {
    beforeEach(() => {
        const { constructorMock } = getTestChessEngineWorkerCreator()
        render(
            <HumanVsEngine 
                createChessEnginerWorker={constructorMock} 
                getNewChessGame={getMockChessGame()}
            />);
    })

    test('Undo button undoes the last AI and human move', () => {

    })
})