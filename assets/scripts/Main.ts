/*
 * @Author: zhupengfei
 * @Date: 2021-12-04 10:27:19
 * @LastEditTime: 2021-12-05 21:17:47
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import {
	_decorator,
	Component,
	Node,
	resources,
	JsonAsset,
	randomRangeInt,
	Prefab,
	instantiate,
	UITransformComponent,
	EventTouch,
	v3,
	v2,
	Vec2,
	Vec3,
} from 'cc';
import { Food } from './components/Food';
import Klotski, {
	Block,
	BOARD_CELL_BOARDER,
	BOARD_CELL_EMPTY,
	Game,
	HRD_BOARD_HEIGHT,
	HRD_BOARD_WIDTH,
	HRD_GAME_COL,
	HRD_GAME_ROW,
	Move,
	Options,
	Shape,
	Step,
} from './libs/Klotski';
const { ccclass, property } = _decorator;
const GRID_WIDTH = 126;
/**
 * Predefined variables
 * Name = Main
 * DateTime = Sat Dec 04 2021 10:27:19 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = Main.ts
 * FileBasenameNoExtension = Main
 * URL = db://assets/scripts/Main.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

interface IFood {
	name: string;
	shape: Shape;
}
@ccclass('Main')
export class Main extends Component {
	public klotski: Klotski;
	private foods: IFood[];
	private moves: Move[];
	private foodCache: Map<number, Node> = new Map();
	private _movedFood: Node = null;
	private _moveRange: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	} = null;
	private _tsp: Vec3 = null;
	private _blocks: Block[] = [];
	private _board: number[][] = [];

	@property(Node)
	gridLayer: Node;
	@property(Node)
	centerNode: Node;

	onLoad() {
		this.klotski = new Klotski();
	}

	onEnable() {
		this.gridLayer.on(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.on(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.on(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.on(Node.EventType.TOUCH_CANCEL, this._tchC, this);
	}

	start() {
		this.refreshLevel(0);
	}

	onDisable() {
		this.gridLayer.off(Node.EventType.TOUCH_START, this._tchS, this);
		this.gridLayer.off(Node.EventType.TOUCH_MOVE, this._tchM, this);
		this.gridLayer.off(Node.EventType.TOUCH_END, this._tchE, this);
		this.gridLayer.off(Node.EventType.TOUCH_CANCEL, this._tchC, this);
	}

	public solve(blocks: Block[]) {
		this.moves = this.klotski.solve({ blocks });
		console.log('this.klotski.game :>> ', this.klotski.game);
	}

	public async refreshLevel(level: number) {
		const lvlData = await this.getLvlData(level);
		this.foods = await this.getFoods();
		this.foodCache.clear();
		this.createFood(lvlData as Block[]);
		this._blocks = lvlData;
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
		for (let i = 0; i < this._blocks.length; ++i) {
			const {
				shape,
				position,
				row = position[0],
				col = position[1],
			} = this._blocks[i];
			if (this._isPositionAvailable(shape, row, col)) {
				this._takePosition(i, shape, row, col);
			}
		}
		console.log('this._blocks :>> ', this._blocks);
		console.log('this._board :>> ', this._board);
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

	private _updateBlocks(blockIdx: number, row: number, col: number) {
		this._blocks[blockIdx].position = [row, col];
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	public async getLvlData(level: number): Promise<Block[]> {
		return new Promise((resolve, reject) => {
			resources.load('datas/hrd', JsonAsset, (err, data: JsonAsset) => {
				if (err) {
					return reject(err);
				}
				return resolve(data.json[level].blocks as Block[]);
			});
		});
	}

	public async getFoods(): Promise<IFood[]> {
		return new Promise((resolve, reject) => {
			resources.load('datas/foods', JsonAsset, (err, data: JsonAsset) => {
				if (err) return reject(err);
				return resolve(data.json as IFood[]);
			});
		});
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
			resources.load('prefabs/FoodPrefab', Prefab, (err, Prefab) => {
				if (!err) {
					const ndFood = instantiate(Prefab);
					this.gridLayer.addChild(ndFood);
					this.updateFoodPosition(shape, position, ndFood);
					ndFood.getComponent(Food).initProps(food.name, i, position, shape);
					this.foodCache.set(i, ndFood);
				}
			});
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
		// this._tsp = lp;
		for (const ndFood of this.foodCache.values()) {
			const bx = ndFood.getComponent(UITransformComponent).getBoundingBox();
			if (bx.contains(v2(lp.x, lp.y))) {
				this._movedFood = ndFood;
				const { x, y, z } = ndFood.getPosition();
				const { blockIdx } = ndFood.getComponent(Food);
				this._tsp = v3(x, y, z);
				this._moveRange = this.getFoodPosLimit(
					blockIdx,
					ndFood.getComponent(Food).position,
					this._movedFood
				);
				break;
			}
		}

		return;
	}
	_tchM(e: EventTouch) {
		if (this._movedFood) {
			const wp = e.getUILocation();
			let lp = this.gridLayer
				.getComponent(UITransformComponent)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const { minX, minY, maxX, maxY } = this._moveRange;
			let { x, y } = lp;
			const offX = x - this._tsp.x;
			const offY = y - this._tsp.y;
			// 左右移动
			if (Math.abs(offX) > Math.abs(offY)) {
				if (x < minX) x = minX;
				if (x > maxX) x = maxX;
				y = this._tsp.y;
				this._movedFood.setPosition(x, y);
				return;
			}

			if (y < minY) y = minY;
			if (y > maxY) y = maxY;
			x = this._tsp.x;
			this._movedFood.setPosition(x, y);
		}
	}
	_tchE(e: EventTouch) {
		if (this._movedFood) {
			const wp = e.getUILocation();
			let lp = this.gridLayer
				.getComponent(UITransformComponent)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const { minX, minY, maxX, maxY } = this._moveRange;
			let { x, y } = lp;
			if (x < minX) x = minX;
			if (x > maxX) x = maxX;
			if (y < minY) y = minY;
			if (y > maxY) y = maxY;
			const srcX = this._tsp.x;
			const srcY = this._tsp.y;
			const offX = x - srcX;
			const offY = y - srcY;
			const xn = Math.floor(offX / GRID_WIDTH);
			const yn = Math.floor(offY / GRID_WIDTH);
			const finalX = xn * GRID_WIDTH + srcX;
			const finalY = yn * GRID_WIDTH + srcY;
			this._movedFood.setPosition(finalX, finalY);

			const { blockIdx, shape, position } = this._movedFood.getComponent(Food);
			const [row, col] = position;
			this._clearPosition(shape, row, col);

			this._takePosition(blockIdx, shape, row - yn, col + xn);
			this._updateBlocks(blockIdx, row - yn, col + xn);
			this._movedFood.getComponent(Food).position = [row - yn, col + xn];
			console.log('this._blocks1 :>> ', this._blocks);
			console.log('this._board1 :>> ', this._board);
		}
		this._tsp = null;
		this._movedFood = null;
		this._moveRange = null;
		this.moves = null;
	}
	_tchC(e: EventTouch) {
		if (this._movedFood) {
			const wp = e.getUILocation();
			let lp = this.gridLayer
				.getComponent(UITransformComponent)
				.convertToNodeSpaceAR(v3(wp.x, wp.y, 0));
			const { minX, minY, maxX, maxY } = this._moveRange;
			let { x, y } = lp;
			if (x < minX) x = minX;
			if (x > maxX) x = maxX;
			if (y < minY) y = minY;
			if (y > maxY) y = maxY;
			const srcX = this._tsp.x;
			const srcY = this._tsp.y;
			const offX = x - srcX;
			const offY = y - srcY;
			const xn = Math.floor(offX / GRID_WIDTH);
			const yn = Math.floor(offY / GRID_WIDTH);
			const finalX = xn * GRID_WIDTH + srcX;
			const finalY = yn * GRID_WIDTH + srcY;
			this._movedFood.setPosition(finalX, finalY);

			const { blockIdx, shape, position } = this._movedFood.getComponent(Food);
			const [row, col] = position;
			this._clearPosition(shape, row, col);

			this._takePosition(blockIdx, shape, row - yn, col + xn);
			this._updateBlocks(blockIdx, row - yn, col + xn);
			this._movedFood.getComponent(Food).position = [row - yn, col + xn];
		}
		this._tsp = null;
		this._movedFood = null;
		this._moveRange = null;
		this.moves = null;
	}

	makeMoveTip() {
		this.moves = this.moves || this.klotski.solve({ blocks: this._blocks });
		let move = this.moves.shift();
		if (!move) return;
		const { blockIdx, dirIdx } = move;
		const { x, y } = this.klotski.getDirection(dirIdx);
		const ndFood = this.foodCache.get(blockIdx);
		const { position, shape } = ndFood.getComponent(Food);
		const offX = x * GRID_WIDTH;
		const offY = -y * GRID_WIDTH;
		const pos = ndFood.getPosition().add(v3(x + offX, y + offY, 0));
		ndFood.setPosition(pos);

		this._clearPosition(shape, position[0], position[1]);
		this._takePosition(blockIdx, shape, position[0] + y, position[1] + x);
		console.log('this._board :>> ', this._board);
		ndFood.getComponent(Food).position = [position[0] + y, position[1] + x];
		this._blocks[blockIdx].position = [position[0] + y, position[1] + x];
		console.log('this._blocks :>> ', this._blocks);
	}

	getMovedRange(
		blockIdx: number,
		position: [number, number]
	): [number, number, number, number] {
		const [r, c] = position.map((v) => v + 1);
		const board = this._board;
		let base: [number, number, number, number] = [0, 0, 0, 0]; //[下，右，上，左]
		for (let i = 0; i < base.length; ++i) {
			const { x, y } = this.klotski.getDirection(i);
			if ((i & 1) === 1) {
				while (
					c + (base[i] + 1) * x >= 0 &&
					c + (base[i] + 1) * x < HRD_BOARD_WIDTH
				) {
					if (
						board[r][c + (base[i] + 1) * x] === BOARD_CELL_EMPTY ||
						board[r][c + (base[i] + 1) * x] === blockIdx + 1
					)
						base[i]++;
					else break;
				}
			} else {
				while (
					r + (base[i] + 1) * y >= 0 &&
					r + (base[i] + 1) * y < HRD_BOARD_HEIGHT
				) {
					if (
						board[r + (base[i] + 1) * y][c] === BOARD_CELL_EMPTY ||
						board[r + (base[i] + 1) * y][c] === blockIdx + 1
					)
						base[i]++;
					else break;
				}
			}
		}
		console.log('base :>> ', base);
		return base;
	}

	getFoodPosLimit(blockIdx: number, position: [number, number], food: Node) {
		const range = this.getMovedRange(blockIdx, position).map(
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

	onBtnClickToTip(e: EventTouch) {
		this.makeMoveTip();
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
