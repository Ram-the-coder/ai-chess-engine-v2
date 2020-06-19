import * as util from '../util';
import {Chess} from 'chess.js';

// getCoords
const getCoordsTestCases = [
	{
		test: 'e4',
		expected: {i: 4, j: 4}
	},
	{
		test: 'b8',
		expected: {i: 0, j: 1}
	},
	{
		test: 'g1',
		expected: {i: 7, j: 6}
	},
	{
		test: 'c6',
		expected: {i: 2, j: 2}
	}
];

getCoordsTestCases.forEach(testCase => {
	test('getCoords', () => {
		expect(util.getCoords(testCase.test)).toEqual(testCase.expected);
	})
})


const game = new Chess();
const board = game.board();

const fromSquareTestCases = [
	{
		test: [board, 'Nc3', 'w'],
		expected: {i: 7, j: 1}
	},
]

fromSquareTestCases.forEach(testCase => {
	test('fromSquare(' + testCase.test[1] + ')', () => {
		expect(util.findFromSquare(...testCase.test)).toEqual(testCase.expected);
	})
})



test('queen side castling', () => {
	expect(util.isCastling('O-O-O')).toBe(12);
});

test('king side castling', () => {
	expect(util.isCastling('O-O')).toBe(13);
});

test('not castling', () => {
	expect(util.isCastling('Ncxe4')).toBe(-1);
})