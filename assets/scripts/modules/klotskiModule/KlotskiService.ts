/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 17:07:49
 * @LastEditTime: 2021-12-18 18:18:24
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/KlotskiService.ts
 */

import { CELL_H, CELL_W, TOTAL_W } from './KlotskiModuleCfg';
import { gBlockStyle } from './klotskiServices/KlotskiSettings';

export function getBlockSizeByStyle(style: number): number[] {
	return gBlockStyle[style];
}

export function getBlockContentSizeByStyle(style: number): number[] {
	const blockSize = getBlockSizeByStyle(style);
	return [blockSize[0] * CELL_W, blockSize[1] * CELL_H];
}

export function getBlockPositionByStyle(
	row: number,
	col: number,
	style: number
): number[] {
	const contentSize = getBlockContentSizeByStyle(style);

	const x = col * CELL_W + contentSize[0] / 2 - TOTAL_W / 2;
	const y = -row * CELL_H - contentSize[1] / 2;
	return [x, y];
}
