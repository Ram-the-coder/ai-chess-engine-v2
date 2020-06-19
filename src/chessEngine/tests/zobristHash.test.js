import {Chess} from 'chess.js';
import * as zobristHash from '../zobristHash';

const game = new Chess();
const board = game.board();

const game2 = new Chess();
game2.load("r1bqkbnr/pppppppp/2n5/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2");
const board2 = [[{"type":"r","color":"b"},null,{"type":"b","color":"b"},{"type":"q","color":"b"},{"type":"k","color":"b"},{"type":"b","color":"b"},{"type":"n","color":"b"},{"type":"r","color":"b"}],[{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"}],[null,null,{"type":"n","color":"b"},null,null,null,null,null],[null,null,null,null,{"type":"p","color":"w"},null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"},null,{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"}],[{"type":"r","color":"w"},{"type":"n","color":"w"},{"type":"b","color":"w"},{"type":"q","color":"w"},{"type":"k","color":"w"},{"type":"b","color":"w"},{"type":"n","color":"w"},{"type":"r","color":"w"}]];
const hash2 = zobristHash.computeZobristHash(board2);
game2.move('Nxe5');

const game3 = new Chess();
game3.load("rnbqkb1r/pppppppp/7n/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
const board3 = [[{"type":"r","color":"b"},{"type":"n","color":"b"},{"type":"b","color":"b"},{"type":"q","color":"b"},{"type":"k","color":"b"},{"type":"b","color":"b"},null,{"type":"r","color":"b"}],[{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"},{"type":"p","color":"b"}],[null,null,null,null,null,null,null,{"type":"n","color":"b"}],[null,null,null,null,{"type":"p","color":"w"},null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"},null,{"type":"p","color":"w"},{"type":"p","color":"w"},{"type":"p","color":"w"}],[{"type":"r","color":"w"},{"type":"n","color":"w"},{"type":"b","color":"w"},{"type":"q","color":"w"},{"type":"k","color":"w"},{"type":"b","color":"w"},{"type":"n","color":"w"},{"type":"r","color":"w"}]];
const hash3 = zobristHash.computeZobristHash(board3);
game3.move('Rg8');

const game4 = new Chess();
game4.load("1rbqkb1r/pppppppp/5n2/8/3n1B2/2NP4/PPPQPPPP/R3KBNR w KQk - 0 1");
const board4 = game4.board();
const hash4 = zobristHash.computeZobristHash(board4);
// console.log("hash4: " + hash4);
game4.move("O-O-O");

const game5 = new Chess();
game5.load("r1bqkbnr/ppppBppp/2n5/8/4P3/3P4/PPP2PPP/RN1QKBNR b KQkq - 0 1");
const board5 = game5.board();
const hash5 = zobristHash.computeZobristHash(board5);
// console.log("hash5: " + hash5);
game5.move("Ncxe7");

const game6 = new Chess();
game6.load("1rb3k1/pp1p1p1p/3R4/2p3P1/8/2N2PP1/PPP1r3/2K3NR w - - 1 18");
const board6 = game6.board();
const hash6 = zobristHash.computeZobristHash(board6);
console.log("hash6: " + hash6);
game6.move("Rhh6");




const getHashTestCases = [
	{
		test: [{type: 'p', color: 'w'}, 6, 4],
		expected: zobristHash.piecePositionValue[5][52]
	},
	{
		test: [{type: 'p', color: 'w'}, 4, 4],
		expected: zobristHash.piecePositionValue[5][36]
	},
	{
		test: [{type: 'n', color: 'b'}, 2, 2],
		expected: zobristHash.piecePositionValue[7][18]	
	},
	{
		test: [{type: 'n', color: 'b'}, 3, 4],
		expected: zobristHash.piecePositionValue[7][28]	
	},
	{
		test: [{type: 'k', color: 'w'}, 7, 4],
		expected: zobristHash.piecePositionValue[4][60]		
	},
	{
		test: [{type: 'r', color: 'w'}, 7, 0],
		expected: zobristHash.piecePositionValue[0][56]		
	}
]

getHashTestCases.forEach(testCase => {
	test('Get has of piece', () => {
		expect(zobristHash.getHashValueOfPiece(...testCase.test)).toBe(testCase.expected);
	})
})

const recomputeTestCases = [
	{
		test: [0, board, 'e4', 'w'],
		expected: zobristHash.getHashValueOfPiece({type: 'p', 'color': 'w'}, 6, 4) ^ zobristHash.getHashValueOfPiece({type: 'p', 'color': 'w'}, 4, 4)
	},
	{
		test: [hash2, board2, 'Nxe5', 'b'],
		expected: zobristHash.computeZobristHash(game2.board())
	},
	{
		test: [hash3, board3, 'Rg8', 'b'],
		expected: zobristHash.computeZobristHash(game3.board())
	},
	{
		test: [hash4, board4, 'O-O-O', 'w'],
		expected: zobristHash.computeZobristHash(game4.board())
	},
	{
		test: [hash5, board5, 'Ncxe7', 'b'],
		expected: zobristHash.computeZobristHash(game5.board())
	},
	{
		test: [hash6, board6, 'Rhh6', 'w'],
		expected: zobristHash.computeZobristHash(game6.board())
	},

]
recomputeTestCases.forEach(testCase => {
	test('Recompute Zob Hash ' + testCase.test[2], () => {
		const hash = zobristHash.recomputeZobristHash(...testCase.test);
		console.log(testCase.test[2], hash);
		expect(hash).toBe(testCase.expected);		
	})
})