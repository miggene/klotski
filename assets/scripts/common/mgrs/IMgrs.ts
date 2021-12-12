/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 11:37:59
 * @LastEditTime: 2021-12-11 18:37:40
 * @LastEditors: zhupengfei
 * @Description:WinMgr相关的接口
 * @FilePath: /klotski/assets/scripts/common/mgrs/IMgrs.ts
 */

import { Node } from 'cc';

// window data object
export interface WinObject {
	path: string;
	zIndex: number;
}
export interface WinCache {
	uuid: string;
	count: number;
	node: Node;
}
