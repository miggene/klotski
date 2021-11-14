import { Rect, v2, Vec2, Vec3, Node } from 'cc';
import { IFoodModel } from '../../server/database/IDataModel';
import { server } from '../../server/Server';
/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 18:09:53
 * @LastEditTime: 2021-11-14 19:22:02
 * @LastEditors: zhupengfei
 * @Description:排列布局逻辑
 * @FilePath: /klotski/assets/scripts/client/logic/Arrange.ts
 */
export const BOARD_SIZE = [6, 6]; //[行，列];
export const BORDER_SIZE = [4, 4]; // [上下边距,左右边距]
export const BOARD_VERTISIZE = 120; //中心宽120，左边距4，右边距4
export const [WIDTH, HEIGHT] = BOARD_SIZE.map(
	(v, index) => v * (BOARD_VERTISIZE + BORDER_SIZE[index] * 2)
);
class Arrange {
	private static _instance: Arrange;
	public static get instance(): Arrange {
		if (!this._instance) this._instance = new Arrange();
		return this._instance;
	}

	private _list: string[];
	public init(list: string[]) {
		this._list = list;
	}
	public updateList(srcIdx: number, curIdx: number) {
		console.log('srcIdx :>> ', srcIdx);
		console.log('curIdx :>> ', curIdx);
		console.log('this._list :>> ', this._list);
		const tmp = this._list[srcIdx];
		this._list[srcIdx] = this._list[curIdx];
		this._list[curIdx] = tmp;
		console.log('this._list 1:>> ', this._list);
	}
	public convert2Idx(vec: number[]): number {
		const [x, y] = vec;
		const c = BOARD_SIZE[1];
		const idx = y * c + x;
		return idx;
	}
	public getVec2(idx: number): number[] {
		//[行，列]
		const r = Math.floor(idx / BOARD_SIZE[1]);
		const c = idx % BOARD_SIZE[1];
		return [r, c];
	}
	public getPosByIdx(idx: number): number[] {
		const [r, c] = this.getVec2(idx);

		return [c, r].map(
			(value, index) => value * (BOARD_VERTISIZE + BORDER_SIZE[index] * 2)
		);
	}
	public flipY(vecArr: number[]): number[] {
		const [x, y] = vecArr;
		return [x, -1 * y];
	}
	public flipX(vecArr: number[]): number[] {
		const [x, y] = vecArr;
		return [-1 * x, y];
	}
	// 相对父节点中心的偏移
	public moveRel2Center(
		srcV: number[],
		offV: number[] = [-WIDTH / 2, HEIGHT / 2]
	): number[] {
		const ret = srcV.map((v, index) => v + offV[index]);
		return ret;
	}

	// 获取自身的格子宽高（含边距）
	public getWH(v: number[]) {
		const ret = v.map(
			(i, index) => i * (BOARD_VERTISIZE + BORDER_SIZE[index] * 2)
		);
		return ret;
	}

	// 相对自身节点的偏移
	public moveRel2Self(selfV: number[], offV: number[]) {
		const relV = [1, -1];
		return selfV.map((v, index) => v + (offV[index] * relV[index]) / 2);
	}

	// 获取可移动范围 range:1x2(1列2行)
	public getMoveRange(param: {
		direction: number;
		idx: number;
		range: string;
	}) {
		const { direction, idx, range } = param;
		const [r, c] = this.getVec2(idx);
		const [w, h] = range.split('x').map((v) => parseInt(v, 10));
		// let rect = new Rect(c, r, w, h);

		const rectList = this._getAllRectExclude(idx);

		// 上下
		if (direction === 1) {
			let upIndex = 0;
			let downIndex = 0;
			let tmpR = r + --upIndex;
			while (tmpR >= 0) {
				const tmpUpRect = new Rect(c, tmpR, w - 0.01, h - 0.01);
				const b = rectList.some((tarRect) => {
					const ret = tarRect.intersects(tmpUpRect);
					return ret;
				});
				if (b) {
					break;
				}
				tmpR = r + --upIndex;
			}
			++upIndex;
			if (upIndex < -r) upIndex = -r;

			tmpR = r + ++downIndex;
			while (tmpR <= BOARD_SIZE[0] - 1) {
				if (tmpR + h - 1 > BOARD_SIZE[0] - 1) break;
				const tmpUpRect = new Rect(c, tmpR, w - 0.01, h - 0.01);
				const b = rectList.some((tarRect) => {
					return tarRect.intersects(tmpUpRect);
				});
				if (b) {
					break;
				}
				tmpR = r + ++downIndex;
			}
			--downIndex;
			if (downIndex > BOARD_SIZE[0] - 1) downIndex = BOARD_SIZE[0] - 1;
			return [Math.abs(upIndex), Math.abs(downIndex)];
		}
		// 左右
		if (direction === 2) {
		}
	}

	public getMoveRangeInPixel(param: {
		direction: number;
		idx: number;
		range: string;
	}) {
		const { direction, idx, range } = param;
		const mvRange = this.getMoveRange({ direction, idx, range });
		console.log('mvRange :>> ', mvRange);
		// 上下
		if (direction === 1) {
			return mvRange.map((v) => (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE) * v);
		}
		if (direction === 2) {
			return mvRange.map(
				(v, index) =>
					(BORDER_SIZE[1] * 2 + BOARD_VERTISIZE) * v * Math.pow(-1, index)
			);
		}
		return [0, 0];
	}

	private _getAllRectExclude(idx: number): Rect[] {
		let rectList: Rect[] = [];
		for (let index = 0, len = this._list.length; index < len; ++index) {
			const v = this._list[index];
			const tmpV = parseInt(v, 10);
			if (tmpV > 0 && idx !== index) {
				const foodData = server.reqFood(v);
				const [otherR, otherC] = this.getVec2(index);
				const [otherW, otherH] = foodData.range
					.split('x')
					.map((s) => parseInt(s, 10));

				const otherRect = new Rect(
					otherC,
					otherR,
					otherW - 0.01,
					otherH - 0.01
				);
				rectList.push(otherRect);
			}
		}
		return rectList;
	}

	// 以左下角为中心获取相对行列值
	public getRC(leftDown: Vec2) {
		const { x, y } = leftDown;
		const r = Math.floor(y / (BORDER_SIZE[0] * 2 + BOARD_VERTISIZE));
		const c = Math.floor(x / (BORDER_SIZE[1] * 2 + BOARD_VERTISIZE));
		return [r, c];
	}

	// 获取以左下角为中心的坐标
	public getLeftDownPos(pos: Vec2) {
		const gridW = BOARD_SIZE[1] * 2 + BOARD_VERTISIZE;
		const gridH = BORDER_SIZE[0] * 2 + BOARD_VERTISIZE;
		const leftUp = pos
			.clone()
			.add(v2(-gridW / 2, gridH / 2))
			.add(v2(WIDTH / 2, -HEIGHT / 2));
		const leftDown = v2(leftUp.x, -leftUp.y);
		return leftDown;
	}

	// public updateList(srcRC:number[],curRC:number[]){
	// 	const idx =
	// }
}

export const arrange = Arrange.instance;
