import { IBlock } from '../klotskiModule/IKlotskiModule';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 11:11:36
 * @LastEditTime: 2021-12-18 17:43:48
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/levelsModule/ILevelsModule.ts
 */
export interface ILevelData {
	level: number;
	count: number;
	mergeSteps: number;
	blocks: { shape: number[]; position: number[] }[];
	// board: string;
	// level: number;
	// exploreCount: number;
	// elapsedTime: number;
	// boardList: number[];
	// mini: number;
}
