/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 18:09:53
 * @LastEditTime: 2021-10-24 18:30:31
 * @LastEditors: zhupengfei
 * @Description:排列布局逻辑
 * @FilePath: /klotski/assets/scripts/client/logic/Arrange.ts
 */
const BOARD_SIZE = [6, 6]; //[行，列];
const BOARD_VERTISIZE = 100;
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
}

export const arrange = Arrange.instance;
