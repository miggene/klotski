/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 13:58:26
 * @LastEditTime: 2021-11-14 19:26:23
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import {
	_decorator,
	Component,
	Node,
	UITransform,
	EventTouch,
	v3,
	Vec2,
	Rect,
	resources,
	Prefab,
	instantiate,
	v2,
} from 'cc';
import { Food } from './client/Food';
import {
	arrange,
	BOARD_SIZE,
	BOARD_VERTISIZE,
	BORDER_SIZE,
} from './client/logic/Arrange';
import { utilHelper } from './helper/UtilHelper';
import { uiMgr } from './server/mgrs/UIMgr';
import { server } from './server/Server';

const { ccclass, property } = _decorator;

const MV_SPEED = 100;
@ccclass('Main')
export class Main extends Component {
	@property(Node)
	gridLayer: Node = null;

	private _tchedFood: Node = null;
	private _foodNodes: Node[] = [];
	private _lastWPos: Vec2 = null;
	private _mvDir: number = 0;
	private _mvRange: number[] = [0, 0];
	private _srcPos: Vec2 = null;
	private _startList: string[];
	onLoad() {
		server.start(() => {
			const lvlDt = server.reqLvlDt(1);
			console.log('lvlDt :>> ', lvlDt);
			const startList = lvlDt.startList.split(',');
			arrange.init(startList);
			this._startList = startList;
		});
		uiMgr.start();
	}

	start() {
		utilHelper.onTch(
			this.gridLayer,
			{
				'touch-start': this._touchS,
				'touch-move': this._touchM,
				'touch-end': this._touchE,
				'touch-cancel': this._touchC,
			},
			this
		);
		this.scheduleOnce(() => {
			this._createFoods(this._startList);
			for (const child of this._foodNodes) {
				const data = child.getComponent(Food).data;
			}
		}, 2);
	}

	private _createFoods(startList: string[]) {
		for (let i = 0, len = startList.length; i < len; ++i) {
			const v = startList[i];
			if (v !== '0') {
				// const foodPrefab = await resHelper.loadPrefab('prefabs/FoodPrefab');
				this._createFoodItem(v, i);
			}
		}
	}

	private _createFoodItem(v: number | string, idx: number) {
		resources.load('prefabs/FoodPrefab', Prefab, (err, prefab) => {
			if (!err) {
				const foodPrefab = instantiate(prefab);
				const data = server.reqFood(v);
				data.idx = idx;
				let [x, y] = arrange.getPosByIdx(idx);
				[x, y] = arrange.flipY([x, y]);
				[x, y] = arrange.moveRel2Center([x, y]);
				const [r, c] = data.range.split('x').map((v) => parseInt(v, 10));
				const [w, h] = arrange.getWH([r, c]);
				foodPrefab.getComponent(UITransform).setContentSize(w, h);
				[x, y] = arrange.moveRel2Self([x, y], [w, h]);
				foodPrefab.getComponent(Food).initView(data);
				foodPrefab.setPosition(x, y);
				this.gridLayer.addChild(foodPrefab);
				this._foodNodes.push(foodPrefab);
			}
		});
	}

	public _touchS(e: EventTouch) {
		const wPos = e.getUILocation();
		for (let i = 0, len = this._foodNodes.length; i < len; ++i) {
			const food = this._foodNodes[i];
			const b = utilHelper.beTched(wPos, food);
			if (b) {
				this._tchedFood = food;
				this._lastWPos = wPos;
				const { x, y, z } = this._tchedFood.getPosition();
				this._srcPos = v2(x, y);
				const data = this._tchedFood.getComponent(Food).data;
				const { range, idx, direction } = data;
				this._mvDir = direction;
				if (direction === 1) {
					this._mvRange = arrange
						.getMoveRangeInPixel({
							range,
							idx,
							direction,
						})
						.map((v, index) => y + (index === 0 ? 1 : -1) * v);
				}

				return;
			}
		}
		// const lPos = this.gridLayer
		// 	.getComponent(UITransform)
		// 	.convertToNodeSpaceAR(v3(wPos.x, wPos.y, 0));
		// console.log('lpos :>> ', lPos);
	}

	public _touchM(e: EventTouch) {
		if (this._tchedFood) {
			// const wPos = e.getUILocation();
			const { x, y, z } = this._tchedFood.getPosition();

			if (this._mvDir === 1) {
				const offY = e.getDeltaY();
				let tmpY = y + offY;
				tmpY = Math.min(this._mvRange[0], tmpY);
				tmpY = Math.max(this._mvRange[1], tmpY);
				this._tchedFood.setPosition(x, tmpY, z);
				// const srcRC = arrange.getVec2(
				// 	this._tchedFood.getComponent(Food).data.idx
				// );
				// const curRC = arrange.getRC(arrange.getLeftDownPos(v2(x, tmpY)));
				// const b = curRC.some((v, index) => v !== srcRC[index]);
				// if (b) {
				// }
			}
		}
	}
	public _touchE(e) {
		if (this._mvDir === 1) {
			const endY = this._tchedFood.getPosition().y;
			const startY = this._srcPos.y;
			const startX = this._srcPos.x;
			const offY = endY - startY;
			const offNumber = Math.floor(
				offY / (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE)
			);
			console.log('offNumber :>> ', offNumber);
			const { data } = this._tchedFood.getComponent(Food);
			const srcV = arrange.getVec2(data.idx);
			console.log('srcV :>> ', srcV);
			const srcIdx = data.idx;
			let tmp = Math.min(srcV[1] - offNumber, BOARD_SIZE[0] - 1);
			tmp = Math.max(0, srcV[1] - offNumber);
			const curV = [srcV[0], tmp];
			console.log('curV :>> ', curV);
			const curIdx = arrange.convert2Idx(curV);
			console.log('curIdx :>> ', curIdx);
			this._tchedFood.getComponent(Food).updateIdx(curIdx);
			arrange.updateList(srcIdx, curIdx);
			this._tchedFood.setPosition(
				startX,
				startY + offNumber * (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE)
			);
		}
		this._resetTch();
	}
	public _touchC(e) {
		this._touchE(e);
		// if (this._mvDir === 1) {
		// 	const endY = this._tchedFood.getPosition().y;
		// 	const startY = this._srcPos.y;
		// 	const startX = this._srcPos.x;
		// 	const offY = endY - startY;
		// 	const offNumber = Math.floor(
		// 		offY / (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE)
		// 	);
		// 	console.log('offNumber :>> ', offNumber);
		// 	const { data } = this._tchedFood.getComponent(Food);
		// 	const srcV = arrange.getVec2(data.idx);
		// 	const srcIdx = data.idx;
		// 	const curV = [srcV[0], srcV[1] - offNumber];
		// 	const curIdx = arrange.convert2Idx(curV);
		// 	console.log('curIdx :>> ', curIdx);
		// 	this._tchedFood.getComponent(Food).updateIdx(curIdx);
		// 	arrange.updateList(srcIdx, curIdx);
		// 	this._tchedFood.setPosition(
		// 		startX,
		// 		startY + offNumber * (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE)
		// 	);
		// }
		// this._resetTch();
	}

	// update(deltaTime: number) {
	// if (this._tchedFood && (this._mvDir[0] !== 0 || this._mvDir[1] !== 0)) {
	// 	const [dirX, dirY] = this._mvDir;
	// 	// this._tchedFood. += x * deltaTime * MV_SPEED;
	// 	// const curX = this._tchedFood.getPosition().x;
	// 	// const curY = this._tchedFood.getPosition().y
	// 	const { x, y } = this._tchedFood.getPosition();
	// 	const finalX = x + dirX * deltaTime * MV_SPEED;
	// 	const finalY = y + dirY * deltaTime * MV_SPEED;
	// 	this._tchedFood.setPosition(finalX, finalY);
	// }
	// }

	private _resetTch() {
		if (this._tchedFood) {
			this._tchedFood = null;
			this._lastWPos = null;
			this._mvDir = 0;
			this._srcPos = null;
			this._mvRange = [0, 0];
		}
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
