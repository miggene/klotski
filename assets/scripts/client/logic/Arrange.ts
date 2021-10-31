/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 18:09:53
 * @LastEditTime: 2021-10-31 15:03:12
 * @LastEditors: zhupengfei
 * @Description:排列布局逻辑
 * @FilePath: /klotski/assets/scripts/client/logic/Arrange.ts
 */
const BOARD_SIZE = [6, 6]; //[行，列];
const BORDER_SIZE = [3, 3];
const BOARD_VERTISIZE = 120; //中心广场120，左边距3，右边距3
const [WIDTH, HEIGHT] = BOARD_SIZE.map(
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
	public getVec2(idx: number): number[] {
		//[行，列]
		const r = Math.floor(idx / BOARD_SIZE[1]);
		const c = idx % BOARD_SIZE[1];
		return [r, c];
	}
	public getPosByIdx(idx: number): number[] {
		const v = this.getVec2(idx);
		return v.map((value) => value * BOARD_VERTISIZE);
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
}

export const arrange = Arrange.instance;
