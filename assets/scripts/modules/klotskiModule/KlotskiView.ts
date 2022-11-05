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
	randomRange,
	TweenEasing,
	random,
	UIOpacity,
	sys,
	assetManager,
	ImageAsset,
	SpriteFrame,
	Texture2D,
} from 'cc';
import { audioMgr, SOUND_CLIPS } from '../../AudioMgr';
import { resMgr } from '../../common/mgrs/ResMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
import WXAuthorize from '../../common/mgrs/WXAuthorize';
import { deepClone, formatTime } from '../../common/utils/Helper';
import Hrd, { IState, mergeSteps, solve } from '../../libs/hrd';

import { ILevelData } from '../levelsModule/ILevelsModule';
import { OverView } from '../overModule/OverView';
import { BurnStatus, KlotskiBlock } from './components/KlotskiBlock';
import { Finger } from './Finger';
import {
	BLOCK_CELL_SIZE,
	BOARD_H,
	BOARD_W,
	CELL_H,
	CELL_W,
	FOOD_PATH,
	HRD_FOODS_JSON_PATH,
	ONE_STEP_MOVE_TIME,
	TOTAL_H,
	TOTAL_W,
} from './KlotskiModuleCfg';
import {
	getBlockContentSizeByStyle,
	getBlockPositionByStyle,
} from './KlotskiService';

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
	private _usedTime: number = 0;
	public get usedTime(): number {
		return this._usedTime;
	}
	public set usedTime(v: number) {
		this._usedTime = v;
		this.lblUsedTime.string = formatTime(v);
	}
	private _boardState: number[][] = [];
	private _blockObj: { [key: string]: Node } = {};

	private _stepInfo: number[] = [];

	private _curBoardStep: number = 0;
	public get curBoardStep(): number {
		return this._curBoardStep;
	}
	public set curBoardStep(v: number) {
		this._curBoardStep = v;
	}

	private _moveStep: number = 0;
	public get moveStep() {
		return this._moveStep;
	}
	public set moveStep(v: number) {
		this._moveStep = v;
		const leftStep = this.levelData.mergeSteps - v;
		this.lblMoveStep.string = `${leftStep >= 0 ? leftStep : 0}`;

		if (!this._bInTip && leftStep <= 0) {
			this.scheduleOnce(() => {
				if (this._bWin) return;
				this._showContinue();
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
	// @property(dragonBones.ArmatureDisplay)
	// dragonTower: dragonBones.ArmatureDisplay;
	// @property(dragonBones.ArmatureDisplay)
	// dragonGlass: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	dragonOven: dragonBones.ArmatureDisplay;

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
	// @property(Sprite)
	// spTipper: Sprite;

	@property(Finger)
	finger: Finger;

	@property(Node)
	continueLayer: Node;

	@property(Node)
	blockLayer: Node;

	@property(Sprite)
	spHead: Sprite;

	private _fingerPos: Vec3;

	private _bInTip = false;
	private _bWin = false;
	private _tarBlock: Node;

	private _hrd: Hrd;
	private _results: {
		blockIdx: number;
		count: number;
		state: IState;
		dirIdx: number;
	}[] = [];

	onLoad() {
		this.gridLayer.destroyAllChildren();

		this.blockLayer.active = false;

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

		this.continueLayer.active = false;

		// if (
		// 	sys.platform === sys.Platform.WECHAT_GAME &&
		// 	WXAuthorize.wxIsAuthorized
		// ) {
		// 	const wxUserInfo = WXAuthorize.wxUserInfo;
		// 	console.log('wxUserInfo :>> ', wxUserInfo);
		// 	assetManager.loadRemote(
		// 		wxUserInfo.avatarUrl,
		// 		{ ext: '.png' },
		// 		(err, imageAsset: ImageAsset) => {
		// 			if (err) {
		// 				console.log('err :>> ', err);
		// 				return;
		// 			}
		// 			const spriteFrame = new SpriteFrame();
		// 			const texture = new Texture2D();
		// 			texture.image = imageAsset;
		// 			spriteFrame.texture = texture;
		// 			this.spHead.spriteFrame = spriteFrame;
		// 		}
		// 	);
		// }
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
		// this.dragonTower.addEventListener(
		// 	dragonBones.EventObject.COMPLETE,
		// 	this._towerAnimEventHandler,
		// 	this
		// );
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
		const mainScript = this.node.parent.parent.getComponent('Main') as any;
		mainScript.showGirlAnimations();
	}

	public initProps(props: ILevelData) {
		this.levelData = deepClone(props);
		this.levelData.mergeSteps += 3;
		const { level, blocks, count, mergeSteps } = props;
		this.level = level;
		this.curBoardStep = 0;
		this.moveStep = 0;
		this.usedTime = 0;

		this._hrd = new Hrd({ blocks });

		this._createBoard(this._hrd.blocks);

		this.scheduleOnce(() => {
			audioMgr.playSound(SOUND_CLIPS.FOOD_ENTER);
		}, 2);
		this.scheduleOnce(() => {
			this.tipperLayer.getChildByName('mask').active = true;
			this.drgTipper.playAnimation('in', 1);
			const slot = this.drgTipper.armature().getSlot('x');
			const index = ['zongzi', 'chips', 'toast', 'FriedEggs'].indexOf(
				this._tarBlock.getComponent(KlotskiBlock).blockName
			);
			slot.displayIndex = index >= 0 ? index : 0;
		}, 3);
	}

	// private _initBoardState() {
	// 	for (let x = 0; x < G_BOARD_X; x++) {
	// 		this._boardState[x] = [];
	// 		for (let y = 0; y < G_BOARD_Y; y++) {
	// 			this._boardState[x][y] = -1;
	// 		}
	// 	}
	// }

	private _createBoard(blocks: { shape: number[]; position: number[] }[]) {
		blocks.forEach((v) => {
			const style = v.shape.toString();
			const [row, col] = v.position;
			const blockId = this._hrd.board[row][col];
			this._createBlock(blockId, col, row, style);
		});

		this.gridLayer.getComponent(UITransform).setContentSize(TOTAL_W, TOTAL_H);
	}

	private async _createBlock(
		blockId: number,
		col: number,
		row: number,
		style: string
	) {
		const data = await resMgr.loadJson(HRD_FOODS_JSON_PATH);

		const filterData = (data as { blockName: string; style: string }[]).filter(
			(v) => v.style === style
		);
		const tarData = filterData[randomRangeInt(0, filterData.length)];

		resMgr
			.loadPrefab(FOOD_PATH)
			.then((prefab) => {
				const ndBlock = instantiate(prefab as Prefab);
				ndBlock.setSiblingIndex(row * this._hrd.col + col);
				this.gridLayer.addChild(ndBlock);
				this._blockObj[blockId] = ndBlock;
				ndBlock
					.getComponent(KlotskiBlock)
					.initProps({ ...tarData, blockId, row, col });
				const [x, y] = getBlockPositionByStyle(row, col, style);

				ndBlock.setPosition(x, y + 1000);
				if (tarData.style === '2,2') {
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
		// this.dragonTower.removeEventListener(
		// 	dragonBones.EventObject.COMPLETE,
		// 	this._towerAnimEventHandler,
		// 	this
		// );
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
		if (this.lblMoveStep.string === '0') return;
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
			let newState: IState = null;
			if (Math.abs(offX) > Math.abs(offY)) {
				if (offX < 0) {
					//向左移动
					newState = this.moveBlockByDir(tchedBlock, blockId, 'left');
				}
				if (offX > 0) {
					// 向右移动;
					newState = this.moveBlockByDir(tchedBlock, blockId, 'right');
				}
				if (newState == null) {
					tchedBlock
						.getComponent(KlotskiBlock)
						.dragonBlock.playAnimation('shake', 1);
					tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
				}
			}
			if (Math.abs(offX) < Math.abs(offY)) {
				let dir = '';
				if (offY < 0) {
					//向下移动
					newState = this.moveBlockByDir(tchedBlock, blockId, 'down');
				}
				if (offY > 0) {
					// 向上移动;
					newState = this.moveBlockByDir(tchedBlock, blockId, 'up');
				}
				if (newState == null) {
					tchedBlock
						.getComponent(KlotskiBlock)
						.dragonBlock.playAnimation('shake', 1);
					tchedBlock.getComponent(KlotskiBlock).isPlaying = true;
				}
			}
		}
	}
	_tchC(e: EventTouch) {
		this._tchE(e);
	}

	private _moveToNewState(state: IState, blockId: number, dir: number) {
		let nextState = this._hrd.moveBlockToNewState(state, blockId - 1, dir);
		let newState: IState = null;
		while (nextState) {
			newState = nextState;
			nextState = this._hrd.moveBlockToNewState(nextState, blockId - 1, dir);
		}
		return newState;
	}

	private _getSlide(oriState: IState, newState: IState, blockId: number) {
		const [or, oc] = this._getRowCol(oriState, blockId);
		const [nr, nc] = this._getRowCol(newState, blockId);
		if (or === -1 || oc === -1 || nr === -1 || nc === -1) {
			throw new Error('slide error');
		}
		return [nr - or, nc - oc];
	}

	private _getRowCol(state: IState, blockId: number) {
		const { board } = state;
		for (let i = 0; i < board.length; ++i) {
			for (let j = 0; j < board[i].length; ++j) {
				const id = board[i][j];
				if (blockId === id) {
					return [i, j];
				}
			}
		}
		return [-1, -1];
	}

	private _updateUsedTime() {
		this.usedTime++;

		if (this.usedTime > 10 && this.usedTime <= 30) {
			// t1
			// this._tarBlock.getComponent(KlotskiBlock).burnStatus = BurnStatus.T1;
		} else if (this._usedTime > 30) {
			// m1
			// this._tarBlock.getComponent(KlotskiBlock).burnStatus = BurnStatus.M1;
		}
	}

	onBtnClickToTip(e: EventTouch) {
		this._bInTip = true;
		this.blockLayer.active = true;
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);

		const moves = solve({ blocks: this._hrd.blocks });
		if (moves) {
			this._results = mergeSteps(moves);
			this.autoMove();
		} else {
		}
	}

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
					this.blockLayer.active = false;
				});
			})
			.start();
	}

	onBtnClickToRetry() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.gridLayer.destroyAllChildren();
		this._boardState = [];
		this._blockObj = {};
		this.board = null;
		this._stepInfo = [];
		this.curBoardStep = 0;
		// this._initBoardState();
		this.initProps(this.levelData);
		this.unschedule(this._updateUsedTime);
		this.usedTime = 0;
		this.schedule(this._updateUsedTime, 1);

		this.tipperLayer.active = !this.tipperLayer.active;
		this.tipperLayer.getChildByName('mask').active = false;
	}

	onBtnClickToHome() {
		this.blockLayer.active = true;
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		const mainScript = this.node.parent.parent.getComponent('Main') as any;
		mainScript.showMain();

		this.drgTips.node.active = false;
		this._playKnifeForkAnimationOut(() => {
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
		// this.dragonGlass.playAnimation('disappear', 1);
		// this.dragonTower.playAnimation('disappear', 1);
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
				// this.dragonTower.node.active = true;
				// this.dragonTower.playAnimation('appear', 1);
				// this.dragonGlass.playAnimation('appear', 1);
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
				// this.dragonTower.node.active = false;
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

	private _showContinue() {
		audioMgr.playSound(SOUND_CLIPS.CLICK_FOOD);
		this.continueLayer.active = true;
		this.unschedule(this._updateUsedTime);

		const btnOkNode = this.continueLayer.getChildByName('btnOkNode');
		btnOkNode.setScale(v3(1, 1, 0));
		tween(btnOkNode)
			.repeatForever(
				tween(btnOkNode)
					.to(0.5, { scale: v3(1.2, 1.2, 0) })
					.to(0.5, { scale: v3(1, 1, 0) })
			)
			.start();
	}

	onBtnClickToOk() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.moveStep = this.levelData.mergeSteps - 3;
		this.continueLayer.active = false;
		this.schedule(this._updateUsedTime, 1);
	}
	onBtnClickToCancel() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.continueLayer.active = false;
		this._fail();
	}

	slideBlock(
		block: Node,
		dir: string,
		movedX: number,
		movedY: number,
		movedT: number
	) {
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

		switch (dir) {
			case 'up':
				scaleMin = v3(1, 0.7);
				scaleMax = v3(1, 1.3);
				anchorPoint = v2(0.5, 1);
				offY = contentSize.height / 2;
				animationName = dir;
				break;
			case 'down':
				scaleMin = v3(1, 0.7);
				scaleMax = v3(1, 1.3);
				anchorPoint = v2(0.5, 0);
				offY = -contentSize.height / 2;
				animationName = dir;
				break;
			case 'left':
				scaleMin = v3(0.7, 1);
				scaleMax = v3(1.3, 1);
				anchorPoint = v2(0, 0.5);
				offX = -contentSize.width / 2;
				animationName = dir;
				break;
			case 'right':
				scaleMin = v3(0.7, 1);
				scaleMax = v3(1.3, 1);
				anchorPoint = v2(1, 0.5);
				offX = contentSize.width / 2;
				animationName = dir;
				break;
			default:
				console.error('moveBlock(): design error !');
				return;
		}
		const moveAct = tween().by(movedT, { position: v3(movedX, movedY) });
		const scaleAct = tween()
			.to(scaleTime, { scale: scaleMin }) //缩小
			.to(scaleTime, { scale: scaleNormal }) //正常大小
			.to(scaleTime, { scale: scaleMax }) //放大
			.to(scaleTime, { scale: scaleNormal }); //正常大小
		tween(block)
			.then(moveAct)
			.call(() => {
				audioMgr.playSound(SOUND_CLIPS.SLIDE);
				++this.moveStep;
				const ndFood = block.getChildByName('dragonBlock');
				tween(ndFood)
					.then(scaleAct)
					.call(() => {
						const dragonBlock = block
							.getChildByName('dragonBlock')
							.getComponent(dragonBones.ArmatureDisplay);
						dragonBlock.timeScale = -1;
						dragonBlock.playAnimation(animationName, 1);
						if (this._hrd.isEscaped(this._hrd.state)) {
							this._winCb(block);
						} else {
							if (this._bInTip) {
								this.autoMove();
							}
						}
					})
					.start();
			})
			.start();
	}

	moveBlockByDir(tchedBlock: Node, blockId: number, dir: string) {
		let newState: IState = null;
		switch (dir) {
			case 'left':
				newState = this._moveToNewState(this._hrd.state, blockId, 3);
				break;
			case 'right':
				newState = this._moveToNewState(this._hrd.state, blockId, 1);
				break;
			case 'down':
				newState = this._moveToNewState(this._hrd.state, blockId, 0);
				break;
			case 'up':
				newState = this._moveToNewState(this._hrd.state, blockId, 2);
				break;
			default:
				break;
		}
		if (newState) {
			this.updateNewState(newState, blockId, dir);
		}
		return newState;
	}

	updateNewState(state: IState, blockId: number, dir: string) {
		const [movedR, movedC] = this._getSlide(this._hrd.state, state, blockId);
		this._hrd.state = state;
		const tchedBlock = this._blockObj[blockId];
		if (dir === 'left' || dir === 'right') {
			this.slideBlock(
				tchedBlock,
				dir,
				movedC * BLOCK_CELL_SIZE,
				0,
				Math.abs(movedC) * ONE_STEP_MOVE_TIME
			);
		}
		if (dir === 'up' || dir === 'down') {
			this.slideBlock(
				tchedBlock,
				dir,
				0,
				-movedR * BLOCK_CELL_SIZE,
				Math.abs(movedR) * ONE_STEP_MOVE_TIME
			);
		}
	}

	autoMove() {
		let dir = '';
		const { state, dirIdx, blockIdx } = this._results.shift();
		if (state == null) {
			return;
		}
		switch (dirIdx) {
			case 0:
				dir = 'down';
				break;
			case 1:
				dir = 'right';
				break;
			case 2:
				dir = 'up';
				break;
			case 3:
				dir = 'left';
				break;

			default:
				break;
		}
		this.updateNewState(state, blockIdx + 1, dir);
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
