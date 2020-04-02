import * as util from '../util';

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