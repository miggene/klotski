/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:13:58
 * @LastEditTime: 2021-12-29 17:38:50
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
	v3,
	v2,
	tween,
	randomRangeInt,
	instantiate,
	Prefab,
	UITransform,
	Sprite,
	dragonBones,
	bezierByTime,
	randomRange,
	TweenEasing,
	View,
	random,
	director,
	UIOpacity,
	UITransformComponent,
	resources,
} from 'cc';
import { audioMgr, SOUND_CLIPS } from '../../AudioMgr';
import { resMgr } from '../../common/mgrs/ResMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
import { deepClone, formatTime } from '../../common/utils/Helper';
import KlotskiSolver from '../../libs/klotskiLibs/KlotskiSolver';
import { Main } from '../../Main';
import { ILevelData } from '../levelsModule/ILevelsModule';
import { OverView } from '../overModule/OverView';
import { BurnStatus, KlotskiBlock } from './components/KlotskiBlock';
import { Finger } from './Finger';
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
		// console.log('this.levelData :>> ', this.levelData);
		// const leftStep = this.levelData.mini - v;
		// this.lblMoveStep.string = `${leftStep >= 0 ? leftStep : 0}`;
	}

	private _moveStep: number = 0;
	public get moveStep() {
		return this._moveStep;
	}
	public set moveStep(v: number) {
		this._moveStep = v;
		console.log('this.levelData :>> ', this.levelData);
		const leftStep = this.levelData.mini - v;
		this.lblMoveStep.string = `${leftStep >= 0 ? leftStep : 0}`;

		if (!this._bInTip && leftStep <= 0) {
			this.scheduleOnce(() => {
				if (this._bWin) return;
				this._fail();
			}, 1);
		}
	}

	private _levelData: ILevelData;
	public get levelData(): ILevelData {
		return this._levelData;
	}
	public set levelData(v: ILevelData) {
		this._levelData = v;
	}

	public _targetId: number = null;
	public get targetId(): number {
		return this._targetId;
	}
	public set targetId(v: number) {
		this._targetId = v;
	}

	private _tchStartPos: Vec3 = null;

	private _basePlatePos: Vec3 = null;
	private _baseKnifePos: Vec3 = null;
	private _baseForkPos: Vec3 = null;

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

	@property(Sprite)
	spPlate: Sprite;
	@property(Sprite)
	spKnife: Sprite;
	@property(Sprite)
	spFork: Sprite;

	@property(Node)
	targetFork: Node;
	@property(Node)
	targetKnife: Node;
	@property(Node)
	targetPlate: Node;

	@property(dragonBones.ArmatureDisplay)
	dragonStick: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	dragonTable: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	dragonTower: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	dragonGlass: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	dragonOven: dragonBones.ArmatureDisplay;

	// @property(Sprite)
	// spDog: Sprite;
	// @property(Sprite)
	// spCat: Sprite;
	@property(Node)
	layout: Node;
	@property(Node)
	blackMask: Node;
	@property(Node)
	winNode: Node;
	@property(dragonBones.ArmatureDisplay)
	drgCat: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	drgDog: dragonBones.ArmatureDisplay;

	@property(dragonBones.ArmatureDisplay)
	drgHome: dragonBones.ArmatureDisplay;

	@property(dragonBones.ArmatureDisplay)
	drgTips: dragonBones.ArmatureDisplay;

	@property(Node)
	tipperLayer: Node;
	@property(dragonBones.ArmatureDisplay)
	drgTipper: dragonBones.ArmatureDisplay;
	@property(Sprite)
	spTipper: Sprite;

	@property(Finger)
	finger: Finger;

	private _fingerPos: Vec3;

	private _bInTip = false;
	private _bWin = false;
	private _tarBlock: Node;

	onLoad() {
		this._initBoardState();
		this.gridLayer.destroyAllChildren();

		this._basePlatePos = this._getRandomBasePos();
		this._baseKnifePos = this._getRandomBasePos();
		this._baseForkPos = this._getRandomBasePos();

		this.spPlate.node.setPosition(this._basePlatePos);
		this.spKnife.node.setPosition(this._baseKnifePos);
		this.spFork.node.setPosition(this._baseForkPos);

		this.lblMoveStep.node.getComponent(UIOpacity).opacity = 0;
		this.lblUsedTime.node.getComponent(UIOpacity).opacity = 0;

		this.tipperLayer.active = true;
		this.tipperLayer.getChildByName('mask').active = false;
	}

	onEnable() {
		this.gridLayer.on(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.on(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.on(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.on(Node.EventType.TOUCH_CANCEL, this._tchC, this);

		this.schedule(this._showRandGirlAnimations, 10);
	}

	start() {
		this._initBg();
		// this.schedule(this._updateUsedTime, 1);
		this.scheduleOnce(() => {
			const parentWidth =
				this.dragonStick.node.parent.getComponent(UITransform).width;
			this.dragonStick.node.setPosition(
				-parentWidth / 2,
				this.dragonStick.node.getPosition().y
			);
			this.dragonStick.timeScale = 1;
			this.dragonStick.playAnimation('B', 1);
		}, 2);

		this.dragonTable.playAnimation('appear', 1);

		this.dragonTable.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._tableAnimEventHandler,
			this
		);
		this.dragonTower.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._towerAnimEventHandler,
			this
		);
		this.drgCat.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._catAnimEventHandler,
			this
		);
		this.drgDog.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dogAnimEventHandler,
			this
		);

		this.drgTips.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._tipsAnimEventHandler,
			this
		);
		this.drgHome.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._homeAnimEventHandler,
			this
		);

		this.dragonOven.playAnimation('appear', 1);

		this.drgHome.playAnimation('b', 1);
		this.drgTips.playAnimation('a', 1);
	}

	private _showRandGirlAnimations() {
		const mainScript = this.node.parent.parent.getComponent(Main);
		mainScript.showGirlAnimations();
	}

	public initProps(props: ILevelData) {
		this.levelData = deepClone(props);
		const { level, board } = props;
		this.level = level;
		this.board = board;
		this.curBoardStep = 0;
		this.moveStep = 0;
		this.usedTime = 0;
		this._createBoard(board);
		this.scheduleOnce(() => {
			audioMgr.playSound(SOUND_CLIPS.FOOD_ENTER);
		}, 2);

		this.scheduleOnce(() => {
			this.tipperLayer.getChildByName('mask').active = true;
			this.drgTipper.playAnimation('in', 1);
		}, 3);
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
		// let VOID_CHAR = '?;
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
		// const tarData = (data as IBlock[]).find((v) => v.style === style);
		const filterData = (data as IBlock[]).filter((v) => v.style === style);
		const tarData = filterData[randomRangeInt(0, filterData.length)];
		if (tarData.style === 4) {
			const { blockName } = tarData;
			const path = `foods/tipperFoods/${blockName}`;
			this.spTipper.spriteFrame = await resMgr.loadSprite(path);
		}
		resMgr
			.loadPrefab(FOOD_PATH)
			.then((prefab) => {
				const ndBlock = instantiate(prefab as Prefab);
				ndBlock.setSiblingIndex(row * G_BOARD_X + col);
				this.gridLayer.addChild(ndBlock);
				this._blockObj[blockId] = ndBlock;
				ndBlock
					.getComponent(KlotskiBlock)
					.initProps({ ...tarData, blockId, row, col });
				const [x, y] = getBlockPositionByStyle(row, col, style);
				// ndBlock.setPosition(x, y);
				ndBlock.setPosition(x, y + 1000);
				if (tarData.style === 4) {
					this._fingerPos = v3(x, y, 0);
					this._tarBlock = ndBlock;
				}
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
						const ndFood = ndBlock.getChildByName('dragonBlock');
						tween(ndFood).then(scaleAct).start();
					})
					.start();
			})
			.catch((err) => console.error(err));
	}

	onDisable() {
		this.gridLayer.off(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.off(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.off(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.off(Node.EventType.TOUCH_CANCEL, this._tchC, this);

		this.dragonTable.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._tableAnimEventHandler,
			this
		);
		this.dragonTower.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._towerAnimEventHandler,
			this
		);
		this.drgCat.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._catAnimEventHandler,
			this
		);
		this.drgDog.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dogAnimEventHandler,
			this
		);

		this.unschedule(this._showRandGirlAnimations);
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
						tween(ndBgGrid.getComponent(UIOpacity))
							.to(0.5, { opacity: 255 })
							.start();
					})
					.catch((err) => console.error(err));
			}
		}
		const { x, y } = this.gridLayer.getPosition();
		this.spExit.node.setPosition(x, y - TOTAL_H);
	}

	_tchS(e: EventTouch) {
		if (this.level === 1 && this.finger.node.active) {
			this.finger.node.active = !this.finger.node.active;
		}

		audioMgr.playSound(SOUND_CLIPS.CLICK_FOOD);
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
					const tchedBlock = this._blockObj[this.targetId];
					tchedBlock
						.getComponent(KlotskiBlock)
						.dragonBlock.playAnimation('click', 1);
					tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
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
					tchedBlock
						.getComponent(KlotskiBlock)
						.dragonBlock.playAnimation('left', 1);
					tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
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
					tchedBlock
						.getComponent(KlotskiBlock)
						.dragonBlock.playAnimation('right', 1);
					tchedBlock.getComponent(KlotskiBlock).isPlaying = true;

					this.targetId = null;
					return;
				}
				tchedBlock
					.getComponent(KlotskiBlock)
					.dragonBlock.playAnimation('shake', 1);
				tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
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
				tchedBlock
					.getComponent(KlotskiBlock)
					.dragonBlock.playAnimation('up', 1);
				tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
				// this.targetId = null;
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
				tchedBlock
					.getComponent(KlotskiBlock)
					.dragonBlock.playAnimation('down', 1);
				tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
				// this.targetId = null;
				return;
			}
			tchedBlock
				.getComponent(KlotskiBlock)
				.dragonBlock.playAnimation('shake', 1);
			tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
		}
	}
	_tchC(e: EventTouch) {
		this._tchE(e);
	}

	private _updateUsedTime() {
		this.usedTime++;

		if (this.usedTime > 10 && this.usedTime <= 30) {
			// t1
			this._tarBlock.getComponent(KlotskiBlock).burnStatus = BurnStatus.T1;
		} else if (this._usedTime > 30 && this._usedTime <= 60) {
			// m1
			this._tarBlock.getComponent(KlotskiBlock).burnStatus = BurnStatus.M1;
		}
	}

	onBtnClickToTip(e: EventTouch) {
		this._bInTip = true;
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		const klotskiSolver = new KlotskiSolver(
			boardState2BoardString(this._boardState, this._blockObj)
		);
		const answers: {
			exploreCount: number;
			elapsedTime: number;
			boardList: number[];
		} = klotskiSolver.find();
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
			const style = this._blockObj[blockId].getComponent(KlotskiBlock).style;
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
			setBoardState(tmpBoardState, moveInfo.startX, moveInfo.startY, style, 0);
			setBoardState(
				tmpBoardState,
				moveInfo.endX,
				moveInfo.endY,
				style,
				blockId
			);
		}
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
		moveBlock(
			curBlock,
			actions,
			0,
			this._moveNext.bind(this),
			this._boardState,
			this._blockObj,
			this.updateMoveStep.bind(this),
			this._winCb.bind(this)
		);
	}

	// private _moveLast(stepInfo: number[]) {
	// 	const maxStep = stepInfo.length;
	// 	// if (this.curBoardStep >= maxStep) return;
	// 	while (this.curBoardStep < maxStep) {
	// 		this.curBoardStep++;
	// 		const posInfo = stepInfo2PosInfo(this._stepInfo, this.curBoardStep);
	// 		const curBlock = this._blockObj[posInfo.id];
	// 		const style = curBlock.getComponent(KlotskiBlock).style;
	// 		setBoardState(this._boardState, posInfo.startX, posInfo.startY, style, 0);
	// 		setBoardState(
	// 			this._boardState,
	// 			posInfo.endX,
	// 			posInfo.endY,
	// 			style,
	// 			posInfo.id
	// 		);
	// 		curBlock.getComponent(KlotskiBlock).row = posInfo.endY;
	// 		curBlock.getComponent(KlotskiBlock).col = posInfo.endX;
	// 		const [x, y] = getBlockPositionByStyle(posInfo.endY, posInfo.endX, style);
	// 		curBlock.setPosition(x, y);
	// 	}
	// }

	public updateMoveStep() {
		++this.moveStep;
	}

	private _winCb(block: Node) {
		this._bWin = true;
		this.unschedule(this._updateUsedTime);
		tween(block)
			.delay(0.5)
			.by(0.5, { position: v3(0, -CELL_H * 2.5) })
			.call(() => {
				this._showCatDogWin();
				block
					.getComponent(KlotskiBlock)
					.dragonBlock.playAnimation('victory', 0);
				block.getComponent(KlotskiBlock).bWin = true;
				block.getComponent(KlotskiBlock).isPlaying = true;
				const { blockName } = block.getComponent(KlotskiBlock);
				winMgr.openWin(WIN_ID.OVER).then((ndWin: Node) => {
					ndWin.getComponent(OverView).initProps({
						moveStep: this.curBoardStep,
						time: this.usedTime,
						curLevel: this.level,
						blockName,
					});
				});
			})
			.start();
	}

	// public updateCurBoardStep() {
	// 	this.curBoardStep++;
	// }

	onBtnClickToRetry() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
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

		this.tipperLayer.active = !this.tipperLayer.active;
		this.tipperLayer.getChildByName('mask').active = false;
	}

	onBtnClickToHome() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		const mainScript = this.node.parent.parent.getComponent(Main);
		mainScript.showMain();

		this.drgTips.node.active = false;
		this._playKnifeForkAnimationOut(() => {
			// const mainScript = this.node.parent.parent.getComponent(Main);
			// mainScript.showMain();
			this.node.destroy();
		});
		this.gridLayer.children.forEach((child) =>
			tween(child)
				.to(1, { position: child.getPosition().add(v3(0, 1000, 0)) })
				.start()
		);
		this.gridBgLayer.children.forEach((child) =>
			tween(child.getComponent(UIOpacity)).to(1, { opacity: 0 }).start()
		);
		this.dragonGlass.playAnimation('disappear', 1);
		this.dragonTower.playAnimation('disappear', 1);
		this.dragonTable.playAnimation('disappear', 1);
		this.dragonOven.playAnimation('disappear', 1);
		this.dragonStick.timeScale = -1;
		this.dragonStick.playAnimation('B', 1);

		this.drgDog.node.active = false;
		this.drgCat.node.active = false;
	}

	private _getRandomBasePos() {
		const width = this.node.getComponent(UITransform).width;
		const height = this.node.getComponent(UITransform).height;
		const w = randomRange(width, 2 * width) * (random() > 0.5 ? 1 : -1);
		const h = randomRange(height / 2, height);
		return v3(w, h, 0);
	}

	private _playKnifeForkAnimationIn() {
		const duration = randomRange(1, 2);
		const easing: TweenEasing = 'sineInOut';
		const plateTarPos = this.targetPlate.getPosition();
		const plateMoveAct = tween().to(
			duration,
			{ position: plateTarPos },
			{ easing }
		);
		tween(this.spPlate.node).then(plateMoveAct).start();

		const knifeTarPos = this.targetKnife.getPosition();
		const knifeMoveAct = tween().to(
			duration,
			{ position: knifeTarPos },
			{ easing }
		);
		tween(this.spKnife.node).then(knifeMoveAct).start();

		const forkTarPos = this.targetFork.getPosition();
		const forkMoveAct = tween().to(
			duration,
			{ position: forkTarPos },
			{ easing }
		);
		tween(this.spFork.node).then(forkMoveAct).start();
	}

	private _playKnifeForkAnimationOut(cb?: Function) {
		const duration = randomRange(1, 2);
		const easing: TweenEasing = 'sineInOut';

		const plateMoveAct = tween().to(
			duration,
			{ position: this._basePlatePos },
			{ easing }
		);
		tween(this.spPlate.node)
			.then(plateMoveAct)
			.call(() => {
				if (cb) cb();
			})
			.start();

		const knifeMoveAct = tween().to(
			duration,
			{ position: this._baseKnifePos },
			{ easing }
		);
		tween(this.spKnife.node).then(knifeMoveAct).start();

		const forkMoveAct = tween().to(
			duration,
			{ position: this._baseForkPos },
			{ easing }
		);
		tween(this.spFork.node).then(forkMoveAct).start();
	}

	private _tableAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			if (event.animationState.name === 'appear') {
				this.dragonTower.node.active = true;
				this.dragonTower.playAnimation('appear', 1);
				this.dragonGlass.playAnimation('appear', 1);
				this.lblMoveStep.node.getComponent(UIOpacity).opacity = 255;
				this.lblUsedTime.node.getComponent(UIOpacity).opacity = 255;
				this.drgCat.playAnimation('appear', 1);
				tween(this.drgDog.node)
					.delay(1)
					.call(() => {
						this.drgDog.playAnimation('appear', 1);
					})
					.start();
			}
		}
	}

	private _towerAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			if (event.animationState.name === 'appear') {
				this._playKnifeForkAnimationIn();
			}
			if (event.animationState.name === 'disappear') {
				this.dragonTower.node.active = false;
			}
		}
	}

	private _catAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			if (event.animationState.name === 'appear') {
				this.drgCat.playAnimation('standby', 0);
			}
		}
	}
	private _dogAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			if (event.animationState.name === 'appear') {
				this.drgDog.playAnimation('standby', 0);
			}
		}
	}

	private _tipsAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			this._refreshDrgTips();
		}
	}

	private _homeAnimEventHandler(event: {
		type: string;
		animationState: { name: string };
	}) {
		if (event.type === dragonBones.EventObject.COMPLETE) {
			this._refreshDrgHome();
		}
	}

	private _showCatDogWin() {
		this.blackMask.active = true;
		tween(this.layout)
			.to(1, { position: v3(0, -150, 0) }, { easing: 'sineOutIn' })
			.start();
	}

	// private _createTopPlate() {
	// 	const tmpPlateNode = instantiate(this.spPlate.node);
	// 	this.deskTopPlatesNode.addChild(tmpPlateNode);
	// }

	private _refreshDrgTips() {
		this.scheduleOnce(() => {
			this.drgTips.playAnimation('a_standby', 1);
		}, 5 + Math.floor(Math.random() * 5));
	}
	private _refreshDrgHome() {
		this.scheduleOnce(() => {
			this.drgHome.playAnimation('b_standby', 1);
		}, 5 + Math.floor(Math.random() * 5));
	}

	public onBtnClickToTipper() {
		this.tipperLayer.active = !this.tipperLayer.active;
		this.tipperLayer.getChildByName('mask').active = false;
		if (this.level === 1 && this._fingerPos) {
			this.finger.show(this._fingerPos);
		}

		this.schedule(this._updateUsedTime, 1);
	}

	private _fail(curLevel: number = this.level) {
		this.unschedule(this._updateUsedTime);
		this._tarBlock.getComponent(KlotskiBlock).burnStatus = BurnStatus.Black;
		const blockName = this._tarBlock.getComponent(KlotskiBlock).blockName;
		winMgr.openWin(WIN_ID.OVER).then((ndWin: Node) => {
			ndWin.getComponent(OverView).fail(curLevel, blockName);
		});
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
