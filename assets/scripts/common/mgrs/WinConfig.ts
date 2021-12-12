/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 11:52:34
 * @LastEditTime: 2021-12-12 11:12:38
 * @LastEditors: zhupengfei
 * @Description:窗口枚举
 * @FilePath: /klotski/assets/scripts/common/mgrs/WinConfig.ts
 */

import { WinObject } from './IMgrs';

export const enum WIN_ZINDEX {
	WINDOW = 1,
}

export const enum WIN_ID {
	START_MENU,
	KLOTSKI,
}

export const WIN_INFO: { [key: number]: WinObject } = {
	[WIN_ID.START_MENU]: {
		path: 'prefabs/MenuPrefab',
		zIndex: WIN_ZINDEX.WINDOW,
	},
	[WIN_ID.KLOTSKI]: {
		path: 'prefabs/KlotskiPrefab',
		zIndex: WIN_ZINDEX.WINDOW,
	},
};

export function getWinInfo(winId: WIN_ID) {
	if (winId in WIN_INFO) return WIN_INFO[winId];
	else throw new Error(`winId:${winId} do not exist`);
}
