/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:13:58
 * @LastEditTime: 2021-12-12 17:40:56
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
} from 'cc';
import { resMgr } from '../../common/mgrs/ResMgr';
import { deepClone, formatTime } from '../../common/utils/Helper';
import { Food } from '../../components/Food';
import Klotski, {
	Block,
	BOARD_CELL_BOARDER,
	BOARD_CELL_EMPTY,
	ESCAPE_COL,
	ESCAPE_ROW,
	HRD_BOARD_HEIGHT,
	HRD_BOARD_WIDTH,
	HRD_GAME_COL,
	HRD_GAME_ROW,
	Move,
	Shape,
} from '../../libs/Klotski';
import { IFood } from './IKlotskiModule';
import { GRID_WIDTH } from './KlotskiModuleCfg';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = KlotskiView
 * DateTime = Sun Dec 12 2021 11:13:58 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = KlotskiView.ts
 * FileBasenameNoExtension = KlotskiView
 * URL = db://assets/scripts/modules/klotskiModule/KlotskiView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('KlotskiView')
export class KlotskiView extends Component {
	public klotski: Klotski = null;

	private _blocks: Block[];
	public get blocks(): Block[] {
		return this._blocks;
	}
	public set blocks(v: Block[]) {
		this._blocks = v;
	}

	private _oldBlocks: Block[];

	private foods: IFood[] = null;
	private moves: Move[] = null;
	private foodCache: Map<number, Node> = new Map();
	private _movedFood: Node = null;
	private _moveRange: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	} = null;
	private _moveDir: number = null; //移动方向
	private _tsp: Vec3 = null;
	private _board: number[][] = [];
	// private _levelIndex: number = 0;

	private _levelIndex: number;
	public get levelIndex(): number {
		return this._levelIndex;
	}
	public set levelIndex(v: number) {
		this._levelIndex = v;
		this.lblLevelIndex.string = `${v + 1}`;
	}

	private _moveStep: number;
	public get moveStep(): number {
		return this._moveStep;
	}
	public set moveStep(v: number) {
		this._moveStep = v;
		this.lblMoveStep.string = `${v}`;
	}

	private _usedTime: number;
	public get usedTime(): number {
		return this._usedTime;
	}
	public set usedTime(v: number) {
		this._usedTime = v;
		this.lblUsedTime.string = formatTime(v);
	}

	@property(Node)
	gridLayer: Node;
	@property(Node)
	centerNode: Node;
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

	onLoad() {
		this.klotski = new Klotski();
		this.moveStep = 0;
		this.usedTime = 0;
		this.levelIndex = 0;
		this.lblWin.node.active = false;
	}

	onEnable() {
		this.gridLayer.on(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.on(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.on(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.on(Node.EventType.TOUCH_CANCEL, this._tchC, this);
	}

	start() {
		this._initBg();
		this.refreshLevel();
		this.schedule(this._updateUsedTime, 1);
	}

	/**
	 * initProps
	 */

	public initView(props: Block[]) {
		this.initProps(props);
		this.refreshLevel();
		this.schedule(this._updateUsedTime, 1);
	}

	public initProps(blocks: Block[]) {
		this.blocks = deepClone(blocks);
		this._oldBlocks = deepClone(blocks);
	}

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
			.getComponent(UITransformComponent)
			.setContentSize(
				(HRD_GAME_COL + 0.2) * GRID_WIDTH,
				(HRD_GAME_ROW + 1.3) * GRID_WIDTH
			);

		for (let i = 0; i < HRD_GAME_ROW; ++i) {
			for (let j = 0; j < HRD_GAME_COL; ++j) {
				resMgr
					.loadPrefab('prefabs/GridPrefab')
					.then((prefab: Prefab) => {
						const ndGrid = instantiate(prefab);
						this.gridBgLayer.addChild(ndGrid);
						ndGrid.setPosition(
							j * GRID_WIDTH + GRID_WIDTH / 2,
							-i * GRID_WIDTH - GRID_WIDTH / 2
						);
					})
					.catch((err) => console.error(err));
			}
		}
		this.gridBgLayer.setPosition(
			(-HRD_GAME_COL * GRID_WIDTH) / 2,
			(HRD_GAME_ROW * GRID_WIDTH) / 2
		);
		this.bgNode.setPosition(
			this.bgNode.position.x,
			this.gridBgLayer.position.y
		);
	}

	public solve(blocks: Block[]) {
		this.moves = this.klotski.solve({ blocks });
		console.log('this.klotski.game :>> ', this.klotski.game);
	}
	public async refreshLevel() {
		this.foods = await this.getFoods();
		this.foodCache.clear();
		this.createFood(this.blocks);
		for (let i = 0; i < HRD_BOARD_HEIGHT; ++i) {
			this._board[i] = [];
			for (let j = 0; j < HRD_BOARD_WIDTH; ++j) {
				this._board[i][j] =
					i !== 0 &&
					i !== HRD_BOARD_HEIGHT - 1 &&
					j !== 0 &&
					j !== HRD_BOARD_WIDTH - 1
						? BOARD_CELL_EMPTY
						: BOARD_CELL_BOARDER;
			}
		}
		for (let i = 0; i < this.blocks.length; ++i) {
			const {
				shape,
				position,
				row = position[0],
				col = position[1],
			} = this.blocks[i];
			if (this._isPositionAvailable(shape, row, col)) {
				this._takePosition(i, shape, row, col);
			}
		}
	}

	private _isPositionAvailable(shape: Shape, row: number, col: number) {
		const [r, c] = shape;
		for (let i = 1; i <= r; ++i) {
			for (let j = 1; j <= c; ++j) {
				if (
					row !== undefined &&
					col !== undefined &&
					this._board[row + i][col + j] !== BOARD_CELL_EMPTY
				)
					return false;
			}
		}
		return true;
	}

	private _clearPosition(shape: Shape, row: number, col: number) {
		for (let i = 1; i <= shape[0]; ++i) {
			for (let j = 1; j <= shape[1]; ++j) {
				this._board[row + i][col + j] = BOARD_CELL_EMPTY;
			}
		}
	}
	private _takePosition(
		blockIdx: number,
		shape: Shape,
		row: number,
		col: number
	) {
		for (var i = 1; i <= shape[0]; i++) {
			for (var j = 1; j <= shape[1]; j++) {
				if (row !== undefined && col !== undefined) {
					this._board[row + i][col + j] = blockIdx + 1;
				}
			}
		}
	}

	private _canMove(shape: Shape, row: number, col: number, blockIdx: number) {
		const [r, c] = shape;
		for (let i = 1; i <= r; ++i) {
			for (let j = 1; j <= c; ++j) {
				if (
					row !== undefined &&
					col !== undefined &&
					this._board[row + i][col + j] !== blockIdx + 1 &&
					this._board[row + i][col + j] !== BOARD_CELL_EMPTY
				)
					return false;
			}
		}
		return true;
	}

	private _updateBlocks(blockIdx: number, row: number, col: number) {
		this.blocks[blockIdx].position = [row, col];
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	// public async getLvlData(level: number) {
	// 	try {
	// 		const data = await resMgr.loadJson('datas/hrd');
	// 		return data[level].blocks as Block[];
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// }

	public async getFoods(): Promise<IFood[]> {
		try {
			const data = await resMgr.loadJson('datas/foods');
			return data as IFood[];
		} catch (error) {
			console.error(error);
		}
	}

	public getFoodByShape(shape: Shape) {
		const list = this.foods.filter((v) => {
			return v.shape[0] === shape[0] && v.shape[1] === shape[1];
		});
		return list[randomRangeInt(0, list.length)];
	}

	private createFood(blocks: Block[]) {
		const W = HRD_GAME_COL * GRID_WIDTH;
		const H = HRD_GAME_ROW * GRID_WIDTH;
		this.gridLayer.getComponent(UITransformComponent).setContentSize(W, H);
		for (let i = 0, len = blocks.length; i < len; ++i) {
			const { shape, position } = blocks[i];
			const food = this.getFoodByShape(shape);
			resMgr
				.loadPrefab('prefabs/FoodPrefab')
				.then((prefab) => {
					const ndFood = instantiate(prefab as Prefab);
					this.gridLayer.addChild(ndFood);
					this.updateFoodPosition(shape, position, ndFood);
					ndFood.getComponent(Food).initProps(food.name, i, position, shape);
					this.foodCache.set(i, ndFood);
				})
				.catch((err) => console.error(err));
		}
	}

	private updateFoodPosition(
		shape: Shape,
		position: [number, number],
		nd: Node
	) {
		const [h, w] = shape.map((v) => v * GRID_WIDTH);
		const [y, x] = position.map((v) => v * GRID_WIDTH);
		const hw = (HRD_GAME_COL * GRID_WIDTH) / 2;
		const hh = (HRD_GAME_ROW * GRID_WIDTH) / 2;

		nd.getComponent(UITransformComponent).setContentSize(w, h);
		// nd.setPosition(x + w / 2, -y - h / 2);
		const px = x + w / 2 - hw;
		const py = -y - h / 2 + hh;
		nd.setPosition(px, py);
	}

	_tchS(e: EventTouch) {
		const wp = e.getUILocation();
		const lp = this.gridLayer
			.getComponent(UITransformComponent)
			.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
		for (const ndFood of this.foodCache.values()) {
			const bx = ndFood.getComponent(UITransformComponent).getBoundingBox();
			if (bx.contains(v2(lp.x, lp.y))) {
				this._movedFood = ndFood;
				const { x, y, z } = ndFood.getPosition();
				const { blockIdx, position, shape } = ndFood.getComponent(Food);
				this._tsp = v3(x, y, z);
				this._moveRange = this.getFoodPosLimit(blockIdx, position, shape);
				break;
			}
		}
		return;
	}
	_tchM(e: EventTouch) {}
	_tchE(e: EventTouch) {
		if (this._movedFood) {
			const wp = e.getUILocation();
			const lp = this.gridLayer
				.getComponent(UITransformComponent)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const { blockIdx, position, shape } = this._movedFood.getComponent(Food);
			const [srcRow, srcCol] = position;
			const range = this.getMovedRange(blockIdx, position, shape);
			const { minX, minY, maxX, maxY } = this._moveRange;
			const maxRow = position[0] + range[0];
			const minRow = position[0] - range[2];
			const maxCol = position[1] + range[1];
			const minCol = position[1] - range[3];
			const offX = lp.x - this._tsp.x;
			const offY = lp.y - this._tsp.y;
			const { x, y } = this._movedFood.getPosition();
			this._clearPosition(shape, position[0], position[1]);
			let tarRow = position[0];
			let tarCol = position[1];
			let tarPositionX = x;
			let tarPositionY = y;
			if (Math.abs(offX) > Math.abs(offY) && offX < 0) {
				//向左
				tarPositionX = minX;
				tarCol = minCol;
			}
			if (Math.abs(offX) > Math.abs(offY) && offX >= 0) {
				//向右
				tarPositionX = maxX;
				tarCol = maxCol;
			}
			if (Math.abs(offX) <= Math.abs(offY) && offY < 0) {
				// 向下
				tarPositionY = minY;
				tarRow = maxRow;
			}
			if (Math.abs(offX) <= Math.abs(offY) && offY >= 0) {
				// 向上
				tarPositionY = maxY;
				tarRow = minRow;
			}
			this._movedFood.setPosition(tarPositionX, tarPositionY);
			this._movedFood.getComponent(Food).position = [tarRow, tarCol];
			this._takePosition(blockIdx, shape, tarRow, tarCol);
			this._updateBlocks(blockIdx, tarRow, tarCol);
			if (tarRow !== srcRow || tarCol !== srcCol) this.moveStep++;
			if (this._isInExit()) {
				console.log('game win');
				this.unschedule(this._updateUsedTime);
				tween(this.lblWin.node)
					.show()
					.to(1, { position: v3(0, 0) })
					.start();
			}
			this._tsp = null;
			this._movedFood = null;
			this._moveRange = null;
			this.moves = null;
			this._moveDir = null;
		}
	}
	_tchC(e: EventTouch) {
		if (this._movedFood) {
			const wp = e.getUILocation();
			const lp = this.gridLayer
				.getComponent(UITransformComponent)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const { blockIdx, position, shape } = this._movedFood.getComponent(Food);
			const [srcRow, srcCol] = position;
			const range = this.getMovedRange(blockIdx, position, shape);
			const { minX, minY, maxX, maxY } = this._moveRange;
			const maxRow = position[0] + range[0];
			const minRow = position[0] - range[2];
			const maxCol = position[1] + range[1];
			const minCol = position[1] - range[3];
			const offX = lp.x - this._tsp.x;
			const offY = lp.y - this._tsp.y;
			const { x, y } = this._movedFood.getPosition();
			this._clearPosition(shape, position[0], position[1]);
			let tarRow = position[0];
			let tarCol = position[1];
			let tarPositionX = x;
			let tarPositionY = y;
			if (Math.abs(offX) > Math.abs(offY) && offX < 0) {
				//向左
				tarPositionX = minX;
				tarCol = minCol;
			}
			if (Math.abs(offX) > Math.abs(offY) && offX >= 0) {
				//向右
				tarPositionX = maxX;
				tarCol = maxCol;
			}
			if (Math.abs(offX) <= Math.abs(offY) && offY < 0) {
				// 向下
				tarPositionY = minY;
				tarRow = maxRow;
			}
			if (Math.abs(offX) <= Math.abs(offY) && offY >= 0) {
				// 向上
				tarPositionY = maxY;
				tarRow = minRow;
			}
			this._movedFood.setPosition(tarPositionX, tarPositionY);
			this._movedFood.getComponent(Food).position = [tarRow, tarCol];
			this._takePosition(blockIdx, shape, tarRow, tarCol);
			this._updateBlocks(blockIdx, tarRow, tarCol);
			if (tarRow !== srcRow || tarCol !== srcCol) this.moveStep++;
			if (this._isInExit()) {
				console.log('game win');
				this.unschedule(this._updateUsedTime);
				tween(this.lblWin.node)
					.show()
					.to(1, { position: v3(0, 0) })
					.start();
			}
			this._tsp = null;
			this._movedFood = null;
			this._moveRange = null;
			this.moves = null;
			this._moveDir = null;
		}
	}

	makeMoveTip() {
		this.moves = this.moves || this.klotski.solve({ blocks: this.blocks });
		let move = this.moves.shift();
		if (!move) {
			console.log('game win');
			// this.unschedule(this._updateUsedTime);
			// tween(this.lblWin.node)
			// 	.show()
			// 	.to(1, { position: v3(0, 0) })
			// 	.start();
			// this._tsp = null;
			// this._movedFood = null;
			// this._moveRange = null;
			// this.moves = null;
			// this._moveDir = null;
			return;
		}
		const { blockIdx, dirIdx } = move;
		const { x, y } = this.klotski.getDirection(dirIdx);
		const ndFood = this.foodCache.get(blockIdx);
		const { position, shape } = ndFood.getComponent(Food);
		const offX = x * GRID_WIDTH;
		const offY = -y * GRID_WIDTH;
		const pos = ndFood.getPosition().add(v3(x + offX, y + offY, 0));
		ndFood.setPosition(pos);
		const [row, col] = position;
		const [tarRow, tarCol] = [row + y, col + x];

		this._clearPosition(shape, row, col);
		this._takePosition(blockIdx, shape, tarRow, tarCol);
		ndFood.getComponent(Food).position = [tarRow, tarCol];
		this.blocks[blockIdx].position = [tarRow, tarCol];
		if (tarRow !== row || tarCol !== col) this.moveStep++;

		if (this._isInExit()) {
			console.log('game win');
			this.unschedule(this._updateUsedTime);
			this.lblWin.node.active = true;
			tween(this.lblWin.node)
				.to(1, { position: v3(0, 0) })
				.start();
			this._tsp = null;
			this._movedFood = null;
			this._moveRange = null;
			this.moves = null;
			this._moveDir = null;
			return;
		}
	}

	getMovedRange(
		blockIdx: number,
		position: [number, number],
		shape: Shape
	): [number, number, number, number] {
		const [r, c] = position;
		let base: [number, number, number, number] = [0, 0, 0, 0]; //[下，右，上，左]
		for (let i = 0; i < base.length; ++i) {
			const { x, y } = this.klotski.getDirection(i);
			if ((i & 1) === 1) {
				//左右
				while (
					c + (base[i] + 1) * x >= 0 &&
					c + (base[i] + 1) * x < HRD_GAME_COL
				) {
					const tmpR = r;
					const tmpC = c + (base[i] + 1) * x;
					const b = this._canMove(shape, tmpR, tmpC, blockIdx);
					if (b) base[i]++;
					else break;
				}
			} else {
				//上下
				while (
					r + (base[i] + 1) * y >= 0 &&
					r + (base[i] + 1) * y < HRD_GAME_ROW
				) {
					const tmpR = r + (base[i] + 1) * y;
					const tmpC = c;
					const b = this._canMove(shape, tmpR, tmpC, blockIdx);
					if (b) base[i]++;
					else break;
				}
			}
		}
		console.log('base :>> ', base);
		return base;
	}

	getFoodPosLimit(blockIdx: number, position: [number, number], shape: Shape) {
		const range = this.getMovedRange(blockIdx, position, shape).map(
			(v) => v * GRID_WIDTH
		);
		const limit = [-1, 1, 1, -1].map((v, index) => v * range[index]);
		const { x, y } = this._tsp;
		const minY = y + limit[0];
		const maxY = y + limit[2];
		const maxX = x + limit[1];
		const minX = x + limit[3];
		return { minX, maxX, minY, maxY };
	}

	reset() {
		this.foods = null;
		this.moves = null;
		this.foodCache.clear();
		this._movedFood = null;
		this._moveRange = null;
		this._moveDir = null;
		this._tsp = null;
		this.blocks = [];
		this._board = [];
		this.moveStep = 0;
		this.usedTime = 0;
	}

	private _isInExit() {
		return (
			Array.isArray(this.blocks) &&
			this.blocks[0].position[0] === ESCAPE_ROW &&
			this.blocks[0].position[1] === ESCAPE_COL
		);
	}

	private _updateUsedTime() {
		this.usedTime++;
	}

	onBtnClickToTip(e: EventTouch) {
		this.makeMoveTip();
	}

	onBtnClickToRetry() {
		this.gridLayer.destroyAllChildren();
		this.reset();
		this.blocks = this._oldBlocks;
		this.refreshLevel();
		this.unschedule(this._updateUsedTime);
		this.schedule(this._updateUsedTime, 1);
	}

	onBtnClickToNextLevel() {
		this.levelIndex++;
		this.gridLayer.destroyAllChildren();
		this.reset();
		this.refreshLevel();
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
