/*
 * @Author: zhupengfei
 * @Date: 2021-09-22 13:59:44
 * @LastEditTime: 2021-09-22 14:11:02
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/helper/UtilHelper.ts
 */
import { Node } from 'cc';

export interface ITouchListener {
	start?: () => void;
	move?: () => void;
	end?: () => void;
	cancel: () => void;
}

class UtilHelper {
	private static _instance: UtilHelper;
	public static get instance(): UtilHelper {
		if (!this._instance) this._instance = new UtilHelper();
		return this._instance;
	}
	// 注册在节点上移动监听
	public onTch(nd: Node, tch: ITouchListener, target: any): void {
		for (const key in tch) {
			if (Object.prototype.hasOwnProperty.call(tch, key)) {
				const func = tch[key];
				nd.on(key, func, target);
			}
		}
	}
	// 取消在节点上移动监听
	public offTch(nd: Node, tch: ITouchListener, target: any): void {
		for (const key in tch) {
			if (Object.prototype.hasOwnProperty.call(tch, key)) {
				const func = tch[key];
				nd.off(key, func, target);
			}
		}
	}
}

export const utilHelper = UtilHelper.instance;
