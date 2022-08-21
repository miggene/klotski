/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 17:07:49
 * @LastEditTime: 2021-12-29 15:42:23
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/KlotskiService.ts
 */

import { CELL_H, CELL_W, TOTAL_W } from './KlotskiModuleCfg';

export function getBlockSizeByStyle(style: string): number[] {
	// return gBlockStyle[style];
	const a = style.split(',');
	const ret = a.map((v) => parseInt(v, 10));
	// const ret = [...style.split(',')].map(parseInt);
	return ret;
}

export function getBlockContentSizeByStyle(style: string): number[] {
	const [h, w] = getBlockSizeByStyle(style);
	return [w * CELL_W, h * CELL_H];
}

export function getBlockPositionByStyle(
	row: number,
	col: number,
	style: string
): number[] {
	const contentSize = getBlockContentSizeByStyle(style);

	const x = col * CELL_W + contentSize[0] / 2 - TOTAL_W / 2;
	const y = -row * CELL_H - contentSize[1] / 2;
	return [x, y];
}
