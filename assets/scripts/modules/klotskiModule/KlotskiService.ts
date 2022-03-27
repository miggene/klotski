/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 17:07:49
 * @LastEditTime: 2021-12-29 15:42:23
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/KlotskiService.ts
 */

import { dragonBones, Node, tween, UITransform, v2, v3 } from 'cc';
import { audioMgr, SOUND_CLIPS } from '../../AudioMgr';
import { KlotskiBlock } from './components/KlotskiBlock';
import { IAction, IPosInfo } from './IKlotskiModule';
import {
	BLOCK_CELL_SIZE,
	CELL_H,
	CELL_W,
	ONE_STEP_MOVE_TIME,
	TOTAL_W,
} from './KlotskiModuleCfg';
import {
	gBlockStyle,
	gGoalPos,
	G_BOARD_X,
	G_BOARD_Y,
	G_GOAL_STYLE,
} from './klotskiServices/KlotskiSettings';

export function getBlockSizeByStyle(style: number): number[] {
	return gBlockStyle[style];
}

export function getBlockContentSizeByStyle(style: number): number[] {
	const blockSize = getBlockSizeByStyle(style);
	return [blockSize[0] * CELL_W, blockSize[1] * CELL_H];
}

export function getBlockPositionByStyle(
	row: number,
	col: number,
	style: number
): number[] {
	const contentSize = getBlockContentSizeByStyle(style);

	const x = col * CELL_W + contentSize[0] / 2 - TOTAL_W / 2;
	const y = -row * CELL_H - contentSize[1] / 2;
	return [x, y];
}

//-------------------------------------
// from source board to target board
// to get the move info
//-------------------------------------
export function getMoveInfo(srcBoard: string[], dstBoard: string[]) {
	let srcStyle: string = null;
	let dstStyle: string = null;
	let srcPos: number = null;
	let dstPos: number = null;
	for (
		let i = 0;
		i < srcBoard.length && (dstPos == null || srcPos == null);
		i++
	) {
		if (srcBoard[i] != dstBoard[i]) {
			if (srcBoard[i] == '@') {
				//move block to here
				if (dstPos == null) {
					//first time
					dstPos = i;
					dstStyle = dstBoard[i];
				}
			} else if (dstBoard[i] == '@') {
				// move block out here
				/*
				if(dstBoard[i] != ' ') {
					debug("Error2: wrong board (" + i + ") !");
					break;
				}*/
				if (srcPos == null) {
					//first time
					srcPos = i;
					srcStyle = srcBoard[i];
				}
			}
		}
	}
	let srcX = srcPos % G_BOARD_X,
		srcY = (srcPos - srcX) / G_BOARD_X;
	let dstX = dstPos % G_BOARD_X,
		dstY = (dstPos - dstX) / G_BOARD_X;

	//find the left-up position
	while (srcX > 0 && srcBoard[srcX - 1 + srcY * G_BOARD_X] == srcStyle) srcX--;
	while (srcY > 0 && srcBoard[srcX + (srcY - 1) * G_BOARD_X] == srcStyle)
		srcY--;

	//find the left-up position
	while (dstX > 0 && dstBoard[dstX - 1 + dstY * G_BOARD_X] == dstStyle) dstX--;
	while (dstY > 0 && dstBoard[dstX + (dstY - 1) * G_BOARD_X] == dstStyle)
		dstY--;

	return { startX: srcX, startY: srcY, endX: dstX, endY: dstY };
}

//-------------------------------------------------
// convert integer board key to board value
// with different char value of same block style
// for draw board
//-------------------------------------------------
export function key2Board(curKey) {
	let blockIndex;
	let board: string[] = [];
	//0   1    2    3    4
	let blockValue = ['@', 'N', 'B', 'H', 'A'];
	let primeBlockPos = curKey & 0x0f; //position of prime minister block (曹操), 4 bits

	//set prime minister block
	board[primeBlockPos] = blockValue[4];
	board[primeBlockPos + G_BOARD_X] = blockValue[4];
	board[primeBlockPos + 1] = blockValue[4];
	board[primeBlockPos + 1 + G_BOARD_X] = blockValue[4];
	curKey = Math.floor(curKey / 16); //shift >> 4 bits

	for (let curPos = G_BOARD_Y * G_BOARD_X - 1; curPos >= 0; curPos--) {
		if (board[curPos] == blockValue[4]) continue;

		blockIndex = curKey & 0x03; //2 bits
		curKey >>= 2; //shift >> 2 bits, now the value <= 32 bits can use bitwise operator

		if (typeof board[curPos] != 'undefined') continue;

		switch (blockIndex) {
			case 0: //empty block
				board[curPos] = blockValue[0];
				break;
			case 1: // 1X1 block
				board[curPos] = blockValue[1];
				blockValue[1] = String.fromCharCode(blockValue[1].charCodeAt(0) + 1); //ascii + 1
				break;
			case 2: // 2X1 block
				board[curPos] = blockValue[2];
				board[curPos - 1] = blockValue[2];
				blockValue[2] = String.fromCharCode(blockValue[2].charCodeAt(0) + 1); //ascii + 1
				break;
			case 3: // 1X2 block
				board[curPos] = blockValue[3];
				board[curPos - G_BOARD_X] = blockValue[3];
				blockValue[3] = String.fromCharCode(blockValue[3].charCodeAt(0) + 1); //ascii + 1
				break;
			case 4: // 2X2 block
			default:
				console.error('key2Board(): design error !');
				break;
		}
	}
	return board;
}

export function setStepInfo(
	stepInfo: number[],
	curBoardStep: number,
	id: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	auto: boolean,
	append: boolean
) {
	let curStep = stepInfo.length;
	if (startX == endX && startY == endY) return curBoardStep;

	if (!append && curStep > curBoardStep) {
		// remove undo steps
		stepInfo.splice(curBoardStep, curStep - curBoardStep);
		curStep = curBoardStep;
	}

	if (!auto && curStep != 0) {
		let lastPosInfo = stepInfo2PosInfo(stepInfo, curStep);

		if (lastPosInfo.endX == startX && lastPosInfo.endY == startY) {
			//same block with last moved
			if (lastPosInfo.startX == endX && lastPosInfo.startY == endY) {
				//same block move back to last moved
				// ==> remove last step
				stepInfo.pop();
				curStep--;
			} else {
				//update last step
				stepInfo[curStep - 1] =
					((auto ? 1 : 0) << 21) +
					(id << 16) +
					(lastPosInfo.startX << 12) +
					(lastPosInfo.startY << 8) +
					(endX << 4) +
					endY;
			}
			curBoardStep = curStep;
			return curStep;
		}
	}
	stepInfo[curStep++] =
		((auto ? 1 : 0) << 21) +
		(id << 16) +
		(startX << 12) +
		(startY << 8) +
		(endX << 4) +
		endY;

	if (!auto) {
		curBoardStep = curStep;
		// manualMoveCount++; //move count for enable hints button
	}

	return curStep;
}

//-----------------------------------------------------
//            |1bit| 5 bit | 4 bit| 4 bit|4bit|4bit|
// stepInfo = |auto|blockId|startX|startY|endX|endY|
//               21|     16|    12|     8|   4|   0|
//-----------------------------------------------------
export function stepInfo2PosInfo(stepInfo: number[], stepId: number): IPosInfo {
	let value = stepInfo[stepId - 1];
	let autoPlay = (value >> 21) & 0x1;
	let blockId = (value >> 16) & 0x1f; //for work with edit mode (14 + 6 + 6 + 1 = 27 blocks for edit)
	let startX = (value >> 12) & 0xf;
	let startY = (value >> 8) & 0xf;
	let endX = (value >> 4) & 0xf;
	let endY = value & 0xf;

	return {
		id: blockId,
		startX: startX,
		startY: startY,
		endX: endX,
		endY: endY,
		auto: autoPlay,
	};
}
//---------------------------------------------
// change block style value from (posX, posY)
//---------------------------------------------
export function setBoardState(boardState, posX, posY, style, value) {
	const [sizeX, sizeY] = getBlockSizeByStyle(style);

	for (let y = 0; y < sizeY; y++) {
		for (let x = 0; x < sizeX; x++) {
			boardState[posX + x][posY + y] = value;
		}
	}
}

//----------------------------------------------------
// get move action combine with: "U", "D", "L", "R"
// only work with empty cell <= 3
//----------------------------------------------------
export function getStepAction(
	boardState: number[][],
	posInfo: IPosInfo,
	style: number,
	back: boolean,
	reverse: boolean
) {
	let dirX: number;
	let dirY: number;
	// let sizeX: number;
	// let sizeY: number;
	let posX;
	let posY;
	let action: string[] = [];

	if (back) {
		//from (endX, endY) to (startX, startY)
		dirX = posInfo.startX - posInfo.endX;
		dirY = posInfo.startY - posInfo.endY;
		posX = posInfo.endX;
		posY = posInfo.endY;
	} else {
		//from (startX, startY) to (endX, endY)
		dirX = posInfo.endX - posInfo.startX;
		dirY = posInfo.endY - posInfo.startY;
		posX = posInfo.startX;
		posY = posInfo.startY;
	}
	// style = blockObj[posInfo.id].getAttr('style');
	const [sizeX, sizeY] = getBlockSizeByStyle(style);
	// sizeX = gBlockStyle[style][0];
	// sizeY = gBlockStyle[style][1];

	while (dirX || dirY) {
		let errCheck = false;
		while (dirY < 0 && allCellXEmpty(boardState, posX, posY - 1, sizeX)) {
			action.push('U');
			dirY++;
			posY--;
			errCheck = true;
		}
		while (dirY > 0 && allCellXEmpty(boardState, posX, posY + sizeY, sizeX)) {
			action.push('D');
			dirY--;
			posY++;
			errCheck = true;
		}
		while (dirX < 0 && allCellYEmpty(boardState, posX - 1, posY, sizeY)) {
			action.push('L');
			dirX++;
			posX--;
			errCheck = true;
		}
		while (dirX > 0 && allCellYEmpty(boardState, posX + sizeX, posY, sizeY)) {
			action.push('R');
			dirX--;
			posX++;
			errCheck = true;
		}
		if (!errCheck) {
			//too many empty may cause this error (empty cell > 3)
			console.error('getStepAction(): design error!');
			break;
		}
	}
	if (reverse) {
		let rAction = [];
		let size = action.length;
		for (let i = 0; i < size; i++) {
			switch (action[size - 1 - i]) {
				case 'U':
					rAction[i] = 'D';
					break;
				case 'D':
					rAction[i] = 'U';
					break;
				case 'L':
					rAction[i] = 'R';
					break;
				case 'R':
					rAction[i] = 'L';
					break;
			}
		}
		//debug("id=" + posInfo.id + " " + rAction );
		action = rAction;
	}
	console.debug('id=' + posInfo.id + ' ' + action);
	return { auto: posInfo.auto, move: action };
}

//----------------------------------------------------------
// check all cell (x,y), (x+1,y) ...(x+size,y) are empty
//----------------------------------------------------------
export function allCellXEmpty(boardState: number[][], x, y, size) {
	for (let i = 0; i < size; i++) {
		if (boardState[x + i][y] != 0) return false;
	}
	return true;
}

//----------------------------------------------------------
// check all cell (x,y), (x,y+1) ...(x,y+size) are empty
//----------------------------------------------------------
export function allCellYEmpty(boardState: number[][], x, y, size) {
	for (let i = 0; i < size; i++) {
		if (boardState[x][y + i] != 0) return false;
	}
	return true;
}

export function moveBlock(
	block: Node,
	action: IAction,
	step: number,
	callbackFun: Function,
	boardState: number[][],
	blockObj: { [key: string]: Node },
	winCb?: Function
) {
	let newX = block.getPosition().x;
	let newY = block.getPosition().y;
	let curAction = action.move[step];
	let moveSize = BLOCK_CELL_SIZE;
	let moveTime = ONE_STEP_MOVE_TIME;

	let count = 1;
	//combine same direction as one action
	while (
		step + count < action.move.length &&
		curAction == action.move[step + count]
	)
		count++;

	moveSize *= count;
	moveTime *= count;
	const scaleTime = 0.08;
	let scaleMin = v3(1, 1);
	let scaleNormal = v3(1, 1);
	let scaleMax = v3(1, 1);

	let anchorPoint = v2(0.5, 0.5);
	let offY = 0;
	let offX = 0;
	let animationName = '';
	const contentSize = block
		.getChildByName('spBlock')
		.getComponent(UITransform).contentSize;
	switch (curAction) {
		case 'U':
			newY += moveSize;
			scaleMin = v3(1, 0.7);
			scaleMax = v3(1, 1.3);
			anchorPoint = v2(0.5, 1);
			offY = contentSize.height / 2;
			animationName = 'up';
			break;
		case 'D':
			newY -= moveSize;
			scaleMin = v3(1, 0.7);
			scaleMax = v3(1, 1.3);
			anchorPoint = v2(0.5, 0);
			offY = -contentSize.height / 2;
			animationName = 'down';
			break;
		case 'L':
			newX -= moveSize;
			scaleMin = v3(0.7, 1);
			scaleMax = v3(1.3, 1);
			anchorPoint = v2(0, 0.5);
			offX = -contentSize.width / 2;
			animationName = 'left';
			break;
		case 'R':
			newX += moveSize;
			scaleMin = v3(0.7, 1);
			scaleMax = v3(1.3, 1);
			anchorPoint = v2(1, 0.5);
			offX = contentSize.width / 2;
			animationName = 'right';
			break;
		default:
			console.error('moveBlock(): design error !');
			return;
	}
	const moveAct = tween().to(moveTime, { position: v3(newX, newY) });
	// const anchorAct = tween().call(() => {
	// 	block.getComponent(UITransform).setAnchorPoint(anchorPoint);
	// });
	// const defaultAnchorAct = tween().call(() => {
	// 	block.getComponent(UITransform).setAnchorPoint(v2(0.5, 0.5));
	// });
	const scaleAct = tween()
		.to(scaleTime, { scale: scaleMin }) //缩小
		.to(scaleTime, { scale: scaleNormal }) //正常大小
		.to(scaleTime, { scale: scaleMax }) //放大
		.to(scaleTime, { scale: scaleNormal }); //正常大小
	// const defaultScaleAct = tween().to(scaleTime, { scale: v3(1, 1) });
	const callAct = tween().call(() => {
		step += count;
		if (step < action.move.length) {
			//one step not finish move again
			moveBlock(block, action, step, callbackFun, boardState, blockObj);
		} else {
			//finish one step move
			// audioPlayWoodHit();
			// writeStepInfo(curBoardStep, action.auto);

			// for (let i = 0; i < moveObj.length; i++) {
			// 	//delete tweenObj
			// 	moveObj[i].destroy();
			// }
			// moveObj = [];
			//check next status
			const b = checkGoalState(boardState, blockObj, winCb);
			if (!b) {
				callbackFun();
			}
		}
	});
	audioMgr.playSound(SOUND_CLIPS.SLIDE);
	tween(block)
		.then(moveAct)
		.call(() => {
			const ndFood = block.getChildByName('dragonBlock');

			tween(ndFood)
				.then(scaleAct)
				.call(() => {
					const dragonBlock = block
						.getChildByName('dragonBlock')
						.getComponent(dragonBones.ArmatureDisplay);
					dragonBlock.timeScale = -1;
					dragonBlock.playAnimation(animationName, 1);
				})
				.then(callAct)
				.start();
		})
		.start();
}

//=======================
// check goal position
//=======================
export function checkGoalState(
	boardState: number[][],
	blockObj: { [key: string]: Node },
	winCb?: Function
) {
	let goalBlock, blockId;

	for (let i = 0; i < gGoalPos.length; i++) {
		let x = gGoalPos[i][0];
		let y = gGoalPos[i][1];
		blockId = boardState[x][y];
		if (
			blockId == 0 ||
			blockObj[blockId].getComponent(KlotskiBlock).style !== G_GOAL_STYLE
		) {
			return false;
		}
	}

	goalBlock = blockObj[blockId];
	move2Goal(goalBlock, winCb);

	return true;
}

//---------------------------------
// Move biggest block out of board
//---------------------------------
export function move2Goal(block: Node, winCb?: Function) {
	// let newX = block.getAttr('x');
	// var newY = block.getAttr('y') + BOARD_BORDER_WIDTH;
	const { x, y } = block.position;
	if (winCb) {
		winCb(block);
	}
	// disableAllBlockDraggable();
	// disableFunctionButton();
	// playModeDisableButton();
	// savePlayInfo(gCurSelectedBoard, [], 0, 0); //before confirm, save current select but reset status

	// var tweenObj = new Kinetic.Tween({
	// 	node: block,
	// 	duration: 1,
	// 	x: newX,
	// 	y: newY,
	// 	onFinish: function () {
	// 		var lastHighScore = gLevelSelectObj.getHighScore();
	// 		var curIsHighScore = setScore();

	// 		showPassDialog(lastHighScore, curIsHighScore);
	// 		enableFunctionButton();
	// 		tweenObj.destroy();
	// 		enableAllBlockDraggable();
	// 	},
	// });
	// audioPlayHappyPass();
	// tweenObj.play();
}

//----------------------------------
// screen point to board position
//----------------------------------
export function point2Pos(x: number, y: number) {
	// var posX = (posY = 0);
	let posX = 0;
	let posY = 0;

	// let offsetX = x - minX;
	// if (offsetX < 0) offsetX = 0;
	// while (offsetX >= BLOCK_CELL_SIZE) {
	// 	offsetX -= BLOCK_CELL_SIZE;
	// 	posX++;
	// }

	// let offsetY = y - minY;
	// if (offsetY < 0) offsetY = 0;
	// while (offsetY >= BLOCK_CELL_SIZE) {
	// 	offsetY -= BLOCK_CELL_SIZE;
	// 	posY++;
	// }

	// return { posX, posY, offsetX, offsetY };
}

//---------------------------------------------
// convert board state to board string format
// for solver to solve it
//---------------------------------------------
export function boardState2BoardString(
	boardState: number[][],
	blockObj: { [key: string]: Node }
): string {
	//0    1    2    3    4
	let blockValue = ['@', 'N', 'B', 'H', 'A'];
	let boardString = [];
	let tmpBoardState = [];
	let id = 0;

	//copy 2 dimensional array
	for (let x = 0; x < G_BOARD_X; x++) {
		tmpBoardState[x] = boardState[x].slice(0);
	}

	for (let y = 0; y < G_BOARD_Y; y++) {
		for (let x = 0; x < G_BOARD_X; x++) {
			if ((id = tmpBoardState[x][y]) >= 0) {
				if (id == 0) {
					//empty block
					boardString[x + y * G_BOARD_X] = blockValue[0];
				} else {
					// let style = blockObj[id].getAttr('style');
					// let sizeX = blockObj[id].getAttr('sizeX');
					// let sizeY = blockObj[id].getAttr('sizeY');
					const { style, sizeX, sizeY } =
						blockObj[id].getComponent(KlotskiBlock);

					for (let yy = 0; yy < sizeY; yy++) {
						for (let xx = 0; xx < sizeX; xx++) {
							tmpBoardState[x + xx][y + yy] = -1;
							boardString[x + xx + (y + yy) * G_BOARD_X] = blockValue[style];
						}
					}
					blockValue[style] = String.fromCharCode(
						blockValue[style].charCodeAt(0) + 1
					); //ascii + 1
				}
			}
		}
	}

	return boardString.join('');
}
