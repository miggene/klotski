/*
 * @Author: zhupengfei
 * @Date: 2021-12-19 10:13:04
 * @LastEditTime: 2021-12-19 11:05:24
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/libs/klotskiLibs/KlotskiHelper.ts
 */
//--------------------------------------------------------------------
// board string convert to board array with gBlockBelongTo index value

import {
	gBlockBelongTo,
	gBlockStyle,
	G_BOARD_SIZE,
	G_BOARD_X,
	G_BOARD_Y,
	G_EMPTY_CHAR,
	G_GOAL_BLOCK,
	G_VOID_CHAR,
} from '../../modules/klotskiModule/klotskiServices/KlotskiSettings';

//--------------------------------------------------------------------
export function gEasyBoard(boardString) {
	let boardArray = boardString.split('');

	for (let i = 0; i < boardArray.length; i++) {
		boardArray[i] = boardArray[i].charCodeAt(0) - G_VOID_CHAR.charCodeAt(0);
	}
	return boardArray;
}

//---------------------------------------------------------
// transfer the board to 64 bits int
// one char convert to 2 bits
//
// javascript: They are 64-bit floating point values,
//             the largest exact integral value is 2 ^ 53
//             but bitwise/shifts only operate on int32
//
// add support key for left-right mirror, 09/02/2017
//---------------------------------------------------------
export function gBoard2Key(board, mirror = 0) {
	let boardKey = 0;
	let primeBlockPos = -1;
	let invBase = 0;

	if (mirror) invBase = -(G_BOARD_X + 1); //key for mirror board

	for (let i = 0; i < board.length; i++) {
		//---------------------------------------------------------------------
		// Javascript only support 53 bits integer	(64 bits floating)
		// for save space, one cell use 2 bits
		// and only keep the position of prime minister block (曹操)
		//---------------------------------------------------------------------
		// maxmum length = (4 * 5 - 4) * 2 + 4
		//               = 32 + 4 = 36 bits
		//
		// 4 * 5 : max cell
		// - 4   : prime minister block size
		// * 2   : one cell use 2 bits
		// + 4   : prime minister block position use 4 bits
		//---------------------------------------------------------------------
		if (!(i % G_BOARD_X)) invBase += G_BOARD_X * 2; //key for mirror board
		const blockValue = board[mirror ? invBase - i : i];
		if (blockValue === G_GOAL_BLOCK) {
			//skip prime minister block (曹操), only keep position
			if (primeBlockPos < 0) primeBlockPos = i;
			continue;
		}
		boardKey = (boardKey << 2) + gBlockBelongTo[blockValue]; //bitwise/shifts must <= 32 bits)
	}
	boardKey = boardKey * 16 + primeBlockPos; //shift 4 bits (0x00-0x0E)
	return boardKey;
}

//----------------------------------------------------
// convert row major 2 diamonion to 1 diamonion index
//----------------------------------------------------
export function gRowMajorToIndex(x, y) {
	return x + G_BOARD_X * y;
}

//---------------------------------------
// board verify
//
// return emptyCount for maximum deep check
//---------------------------------------
export function gBlockCheck(boardString: string) {
	let tmpBoard = boardString.split(''); //string to array
	let indexCheck = [];
	let rc = 0;
	let emptyCount = 0;

	//(1) board size check
	if (tmpBoard.length != G_BOARD_SIZE) {
		console.log('Wrong board size !');
		return { rc: 1 };
	}

	//(2) check block style and don't duplicate
	let blockValue;
	let blockIndex;
	let sizeX, sizeY;
	let errX;
	let errY;
	for (let y = 0; y < G_BOARD_Y; y++) {
		for (let x = 0; x < G_BOARD_X; x++) {
			if ((blockValue = tmpBoard[gRowMajorToIndex(x, y)]) == '0') continue; //already verified

			blockIndex = blockValue.charCodeAt(0) - G_VOID_CHAR.charCodeAt(0);

			sizeX = gBlockStyle[gBlockBelongTo[blockIndex]][0]; //block size X
			sizeY = gBlockStyle[gBlockBelongTo[blockIndex]][1]; //block size Y

			for (let blockY = 0; blockY < sizeY; blockY++) {
				if (blockY + y >= G_BOARD_Y) {
					rc = 1;
					errX = x;
					errY = y;
					break;
				}

				for (let blockX = 0; blockX < sizeX; blockX++) {
					if (blockX + x >= G_BOARD_X) {
						rc = 1;
						errX = x;
						errY = y;
						break;
					}

					let index = gRowMajorToIndex(blockX + x, blockY + y);
					if (tmpBoard[index] != blockValue) {
						rc = 1;
						errX = x;
						errY = y;
						break;
					}
					tmpBoard[index] = '0'; //verified
				}
			}
			if (blockValue == G_EMPTY_CHAR) {
				++emptyCount;
			} else if (typeof indexCheck[blockIndex] != 'undefined') {
				rc = 2;
				errX = x;
				errY = y;
				break; //duplicate
			}
			indexCheck[blockIndex] = 1;
		}
	}
	if (rc == 1) console.log('Error: wrong block at [' + errX + ',' + errY + ']');
	if (rc == 2)
		console.log('Error: block duplicate at [' + errX + ',' + errY + ']');
	if (emptyCount > 2) console.log('Warning: too many empty block!');
	return { rc: rc, emptyCount: emptyCount };
}
