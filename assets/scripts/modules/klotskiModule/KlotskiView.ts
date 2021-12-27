/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:13:58
 * @LastEditTime: 2021-12-27 15:29:21
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/KlotskiView.ts
 */
import {
	_decorator,
	Component,
	Node,
	Vec3,
	Label,
	EventTouch,
	UITransformComponent,
	v3,
	v2,
	tween,
	randomRangeInt,
	instantiate,
	Prefab,
	UITransform,
	Vec2,
	Sprite,
} from 'cc';
import { resMgr } from '../../common/mgrs/ResMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
import { deepClone, formatTime } from '../../common/utils/Helper';
import KlotskiSolver from '../../libs/klotskiLibs/KlotskiSolver';
import { ILevelData } from '../levelsModule/ILevelsModule';
import { OverView } from '../overModule/OverView';
import { KlotskiBlock } from './components/KlotskiBlock';
import { IBlock } from './IKlotskiModule';
import {
	BOARD_H,
	BOARD_W,
	CELL_H,
	CELL_W,
	FOOD_PATH,
	HRD_FOODS_JSON_PATH,
	TOTAL_H,
	TOTAL_W,
} from './KlotskiModuleCfg';
import {
	boardState2BoardString,
	getBlockContentSizeByStyle,
	getBlockPositionByStyle,
	getMoveInfo,
	getStepAction,
	key2Board,
	moveBlock,
	setBoardState,
	setStepInfo,
	stepInfo2PosInfo,
} from './KlotskiService';
import {
	gBlockBelongTo,
	gBlockStyle,
	G_BOARD_X,
	G_BOARD_Y,
	G_VOID_CHAR,
} from './klotskiServices/KlotskiSettings';
const { ccclass, property } = _decorator;

@ccclass('KlotskiView')
export class KlotskiView extends Component {
	private _board: string;
	public get board(): string {
		return this._board;
	}
	public set board(v: string) {
		this._board = v;
	}

	private _level: number;
	public get level(): number {
		return this._level;
	}
	public set level(v: number) {
		this._level = v;
		this.lblLevelIndex.string = `${v}`;
	}

	// private _moveStep: number;
	// public get moveStep(): number {
	// 	return this._moveStep;
	// }
	// public set moveStep(v: number) {
	// 	this._moveStep = v;
	// 	this.lblMoveStep.string = `${v}`;
	// }

	private _usedTime: number = 0;
	public get usedTime(): number {
		return this._usedTime;
	}
	public set usedTime(v: number) {
		this._usedTime = v;
		this.lblUsedTime.string = formatTime(v);
	}

	// private _boardState: number[][];

	private _boardState: number[][] = [];
	private _blockObj: { [key: string]: Node } = {};

	private _stepInfo: number[] = [];

	private _curBoardStep: number = 0;
	public get curBoardStep(): number {
		return this._curBoardStep;
	}
	public set curBoardStep(v: number) {
		this._curBoardStep = v;
		this.lblMoveStep.string = `${v}`;
	}

	private _levelData: ILevelData;
	public get levelData(): ILevelData {
		return this._levelData;
	}
	public set levelData(v: ILevelData) {
		this._levelData = v;
	}

	private _targetId: number = null;
	public get targetId(): number {
		return this._targetId;
	}
	public set targetId(v: number) {
		this._targetId = v;
	}

	private _tchStartPos: Vec3 = null;

	@property(Node)
	gridLayer: Node;
	@property(Node)
	bgNode: Node;
	@property(Node)
	gridBgLayer: Node;
	@property(Label)
	lblWin: Label;
	@property(Label)
	lblMoveStep: Label;
	@property(Label)
	lblUsedTime: Label;
	@property(Label)
	lblLevelIndex: Label;
	@property(Sprite)
	spExit: Sprite;

	onLoad() {
		// this.klotski = new Klotski();
		// this.moveStep = 0;
		// this.usedTime = 0;
		// this.levelIndex = 0;
		// this.lblWin.node.active = false;
		this._initBoardState();
		this.gridLayer.destroyAllChildren();
	}

	onEnable() {
		this.gridLayer.on(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.on(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.on(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.on(Node.EventType.TOUCH_CANCEL, this._tchC, this);
	}

	start() {
		this._initBg();
		this.schedule(this._updateUsedTime, 1);
	}

	public initProps(props: ILevelData) {
		this.levelData = deepClone(props);
		const { level, board } = props;
		this.level = level;
		this.board = board;
		this.curBoardStep = 0;
		this._createBoard(board);
	}

	private _initBoardState() {
		for (let x = 0; x < G_BOARD_X; x++) {
			this._boardState[x] = [];
			for (let y = 0; y < G_BOARD_Y; y++) {
				this._boardState[x][y] = -1;
			}
		}
	}

	private _createBoard(boardString: string) {
		let blockId = 1; //blockObj[0] : for empty (don't use)
		let i = 0;
		// let VOID_CHAR = '?';
		for (let row = 0; row < G_BOARD_Y; row++) {
			for (let col = 0; col < G_BOARD_X; col++) {
				if (this._boardState[col][row] >= 0) {
					i++;
					continue;
				}
				let style =
					gBlockBelongTo[
						boardString.charCodeAt(i++) - G_VOID_CHAR.charCodeAt(0)
					];

				//don't create block for empty
				if (style) this._createBlock(blockId, col, row, style);
				// this._blockObj[blockId] = createBlock(
				// 	blockId,
				// 	x,
				// 	y,
				// 	style,
				// 	playMode == 1 ? 1 : 0
				// );

				let sizeX = gBlockStyle[style][0];
				let sizeY = gBlockStyle[style][1];
				for (let c = 0; c < sizeX; c++) {
					for (let r = 0; r < sizeY; r++) {
						this._boardState[col + c][row + r] = style ? blockId : 0; //empty id = 0;
					}
				}
				if (style) blockId++;
			}
		}
		this.gridLayer.getComponent(UITransform).setContentSize(TOTAL_W, TOTAL_H);
	}

	private async _createBlock(
		blockId: number,
		col: number,
		row: number,
		style: number
	) {
		const data = await resMgr.loadJson(HRD_FOODS_JSON_PATH);
		const tarData = (data as IBlock[]).find((v) => v.style === style);
		resMgr
			.loadPrefab(FOOD_PATH)
			.then((prefab) => {
				const ndBlock = instantiate(prefab as Prefab);
				this.gridLayer.addChild(ndBlock);
				this._blockObj[blockId] = ndBlock;
				ndBlock
					.getComponent(KlotskiBlock)
					.initProps({ ...tarData, blockId, row, col });
				const [x, y] = getBlockPositionByStyle(row, col, style);
				// ndBlock.setPosition(x, y);
				ndBlock.setPosition(x, y + 1000);
				const size = getBlockContentSizeByStyle(style);
				ndBlock.getComponent(UITransform).setContentSize(size[0], size[1]);

				const scaleNormal = v3(1, 1);
				const scaleMin = v3(1, 0.7);
				const scaleMax = v3(1, 1.3);
				const scaleTime = 0.08;
				const scaleAct = tween()
					.to(scaleTime, { scale: scaleMin })
					.to(scaleTime, { scale: scaleNormal })
					.to(scaleTime, { scale: scaleMax })
					.to(scaleTime, { scale: scaleNormal });
				tween(ndBlock)
					.delay(1)
					.to(0.5, { position: v3(x, y) })
					.call(() => {
						const ndFood = ndBlock.getChildByName('spBlock');
						const srcPos = ndFood.getPosition();
						ndFood.getComponent(UITransform).setAnchorPoint(0.5, 0);
						const contentSize = ndFood.getComponent(UITransform).contentSize;
						let offY = contentSize.height / 2;
						ndFood.setPosition(srcPos.x, srcPos.y - offY);
						tween(ndFood)
							.then(scaleAct)
							.call(() => {
								ndFood.getComponent(UITransform).setAnchorPoint(0.5, 0.5);
								ndFood.setPosition(srcPos);
							})
							.start();
					})
					.start();
			})
			.catch((err) => console.error(err));
	}

	private _getGridPositionByRC(row: number, col: number) {}

	onDisable() {
		this.gridLayer.off(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.off(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.off(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.off(Node.EventType.TOUCH_CANCEL, this._tchC, this);
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	private _initBg() {
		this.bgNode
			.getComponent(UITransform)
			.setContentSize(TOTAL_W + 20, TOTAL_H * 1.25 + 5);
		const bgNodeY = this.bgNode.getPosition().y;
		const bgNodeX = this.bgNode.getPosition().x;
		this.bgNode.setPosition(bgNodeX, bgNodeY + 10);
		for (let i = 0; i < BOARD_W; ++i) {
			for (let j = 0; j < BOARD_H; ++j) {
				resMgr
					.loadPrefab('prefabs/GridPrefab')
					.then((prefab: Prefab) => {
						const ndBgGrid = instantiate(prefab);
						this.gridBgLayer.addChild(ndBgGrid);
						const x = i * CELL_W + CELL_W / 2 - TOTAL_W / 2;
						const y = -j * CELL_H - CELL_H / 2;
						ndBgGrid.setPosition(x, y);
						ndBgGrid.getComponent(UITransform).setContentSize(CELL_W, CELL_H);
					})
					.catch((err) => console.error(err));
			}
		}
		const { x, y } = this.gridLayer.getPosition();
		this.spExit.node.setPosition(x, y - TOTAL_H);
	}

	_tchS(e: EventTouch) {
		const wp = e.getUILocation();
		const lp = this.gridLayer
			.getComponent(UITransform)
			.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
		this._tchStartPos = lp;
		for (const key in this._blockObj) {
			if (Object.prototype.hasOwnProperty.call(this._blockObj, key)) {
				const ndBlock = this._blockObj[key];
				const b = ndBlock
					.getComponent(UITransform)
					.getBoundingBox()
					.contains(v2(lp.x, lp.y));
				if (b) {
					this.targetId = parseInt(key, 10);
					break;
				}
			}
		}
		return;
	}
	_tchM(e: EventTouch) {}
	_tchE(e: EventTouch) {
		if (this.targetId > 0) {
			const tchedBlock = this._blockObj[this.targetId];
			const { style, sizeX, sizeY, row, col, blockId } =
				tchedBlock.getComponent(KlotskiBlock);
			const wp = e.getUILocation();
			const lp = this.gridLayer
				.getComponent(UITransform)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const offX = lp.x - this._tchStartPos.x;
			const offY = lp.y - this._tchStartPos.y;
			let minX = col - 1;
			while (minX >= 0) {
				let bPass = true;
				for (let i = row; i < row + sizeY; ++i) {
					if (this._boardState[minX][i] !== 0) {
						bPass = false;
						break;
					}
				}
				if (bPass) --minX;
				else {
					++minX;
					break;
				}
			}
			minX = Math.max(minX, 0);
			let maxX = col + sizeX;
			while (maxX < G_BOARD_X) {
				let bPass = true;
				for (let i = row; i < row + sizeY; ++i) {
					if (this._boardState[maxX][i] !== 0) {
						bPass = false;
						break;
					}
				}
				if (bPass) ++maxX;
				else {
					--maxX;
					break;
				}
			}
			maxX = Math.min(maxX, G_BOARD_X - 1) - sizeX + 1;

			let minY = row - 1;
			while (minY >= 0) {
				let bPass = true;
				for (let i = col; i < col + sizeX; ++i) {
					if (this._boardState[i][minY] !== 0) {
						bPass = false;
						break;
					}
				}
				if (bPass) --minY;
				else {
					++minY;
					break;
				}
			}
			minY = Math.max(0, minY);

			let maxY = row + sizeY;
			while (maxY < G_BOARD_Y) {
				let bPass = true;
				for (let i = col; i < col + sizeX; ++i) {
					if (this._boardState[i][maxY] !== 0) {
						bPass = false;
						break;
					}
				}
				if (bPass) ++maxY;
				else {
					--maxY;
					break;
				}
			}
			maxY = Math.min(maxY, G_BOARD_Y - 1) - sizeY + 1;

			let bLeft = minX < col;
			let bRight = maxX > col;
			let bUp = minY < row;
			let bDown = maxY > row;

			//左右移动
			if (Math.abs(offX) > Math.abs(offY)) {
				// 向左
				if (offX < 0 && bLeft) {
					setStepInfo(
						this._stepInfo,
						this.curBoardStep,
						blockId,
						col,
						row,
						minX,
						row,
						true,
						true
					);
					this._moveNext();
					this.targetId = null;
					return;
				}
				// 向右
				if (offX >= 0 && bRight) {
					setStepInfo(
						this._stepInfo,
						this.curBoardStep,
						blockId,
						col,
						row,
						maxX,
						row,
						true,
						true
					);
					this._moveNext();
					this.targetId = null;
					return;
				}

				return;
			}
			//上下移动
			// 向上
			if (offY > 0 && bUp) {
				setStepInfo(
					this._stepInfo,
					this.curBoardStep,
					blockId,
					col,
					row,
					col,
					minY,
					true,
					true
				);
				this._moveNext();
				this.targetId = null;
				return;
			}
			// 向右
			if (offY <= 0 && bDown) {
				setStepInfo(
					this._stepInfo,
					this.curBoardStep,
					blockId,
					col,
					row,
					col,
					maxY,
					true,
					true
				);
				this._moveNext();
				this.targetId = null;
				return;
			}
		}
	}
	_tchC(e: EventTouch) {
		this._tchE(e);
	}

	private _updateUsedTime() {
		this.usedTime++;
	}

	onBtnClickToTip(e: EventTouch) {
		// this.makeMoveTip();
		const klotskiSolver = new KlotskiSolver(
			boardState2BoardString(this._boardState, this._blockObj)
		);
		const answers: {
			exploreCount: number;
			elapsedTime: number;
			boardList: number[];
		} = klotskiSolver.find();
		console.log('answers :>> ', answers);
		const { boardList } = answers;
		const maxMove = boardList.length - 1;
		if (maxMove <= 0) return;
		let tmpBoardState: number[][] = [];
		for (let x = 0; x < G_BOARD_X; ++x) {
			tmpBoardState[x] = this._boardState[x].slice();
		}
		for (let i = 1; i <= maxMove; ++i) {
			const moveInfo = getMoveInfo(
				key2Board(answers.boardList[i - 1]),
				key2Board(answers.boardList[i])
			);
			const blockId = tmpBoardState[moveInfo.startX][moveInfo.startY];
			setStepInfo(
				this._stepInfo,
				this.curBoardStep,
				blockId,
				moveInfo.startX,
				moveInfo.startY,
				moveInfo.endX,
				moveInfo.endY,
				true,
				i !== 1
			);
		}
		console.log('this._stepInfo :>> ', this._stepInfo);
		this._moveNext();
		// this._moveLast(this._stepInfo.slice());
	}

	private _moveNext() {
		const maxStep = this._stepInfo.length;
		if (this.curBoardStep >= maxStep) return;
		this.curBoardStep++;
		const posInfo = stepInfo2PosInfo(this._stepInfo, this.curBoardStep);
		const curBlock = this._blockObj[posInfo.id];

		const style = curBlock.getComponent(KlotskiBlock).style;
		const actions = getStepAction(
			this._boardState,
			posInfo,
			style,
			false,
			false
		);
		setBoardState(this._boardState, posInfo.startX, posInfo.startY, style, 0);
		setBoardState(
			this._boardState,
			posInfo.endX,
			posInfo.endY,
			style,
			posInfo.id
		);
		curBlock.getComponent(KlotskiBlock).updatePos(posInfo.endY, posInfo.endX);
		// const [x, y] = getBlockPositionByStyle(posInfo.endY, posInfo.endX, style);
		// curBlock.setPosition(x, y);
		moveBlock(
			curBlock,
			actions,
			0,
			this._moveNext.bind(this),
			this._boardState,
			this._blockObj,
			this._winCb.bind(this)
		);
	}

	_moveLast(stepInfo: number[]) {
		const maxStep = stepInfo.length;
		// if (this.curBoardStep >= maxStep) return;
		while (this.curBoardStep < maxStep) {
			this.curBoardStep++;
			const posInfo = stepInfo2PosInfo(this._stepInfo, this.curBoardStep);
			const curBlock = this._blockObj[posInfo.id];
			const style = curBlock.getComponent(KlotskiBlock).style;
			setBoardState(this._boardState, posInfo.startX, posInfo.startY, style, 0);
			setBoardState(
				this._boardState,
				posInfo.endX,
				posInfo.endY,
				style,
				posInfo.id
			);
			curBlock.getComponent(KlotskiBlock).row = posInfo.endY;
			curBlock.getComponent(KlotskiBlock).col = posInfo.endX;
			const [x, y] = getBlockPositionByStyle(posInfo.endY, posInfo.endX, style);
			curBlock.setPosition(x, y);
		}
	}

	private _winCb(block: Node) {
		tween(block)
			.delay(0.5)
			.by(0.5, { position: v3(0, -CELL_H * 2) })
			.call(() => {
				winMgr.openWin(WIN_ID.OVER).then((ndWin: Node) => {
					ndWin.getComponent(OverView).initProps({
						moveStep: this.curBoardStep,
						time: this.usedTime,
						curLevel: this.level,
					});
				});
			})
			.start();
	}

	onBtnClickToRetry() {
		this.gridLayer.destroyAllChildren();
		this._boardState = [];
		this._blockObj = {};
		this.board = null;
		this._stepInfo = [];
		this.curBoardStep = 0;
		this._initBoardState();
		this.initProps(this.levelData);
		this.unschedule(this._updateUsedTime);
		this.usedTime = 0;
		this.schedule(this._updateUsedTime, 1);
	}

	onBtnClickToHome() {
		this.node.destroy();
		winMgr.openWin(WIN_ID.START_MENU);
	}
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
