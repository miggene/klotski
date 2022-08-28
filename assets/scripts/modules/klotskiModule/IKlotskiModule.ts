/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:17:27
 * @LastEditTime: 2021-12-19 17:57:23
 * @LastEditors: zhupengfei
 * @Description:KlotskiModule模块中的接口
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/IKlotskiModule.ts
 */
export interface IBlock {
	blockName: string;
	style: number;
	blockId: number;
	row: number;
	col: number;
}

export interface IPosInfo {
	id: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	auto: number;
}

export interface IAction {
	auto: number;
	move: string[];
}
