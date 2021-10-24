import { Node } from 'cc';
import { resHelper } from '../../helper/ResHelper';

/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 17:11:08
 * @LastEditTime: 2021-10-24 17:52:16
 * @LastEditors: zhupengfei
 * @Description: ui管理器
 * @FilePath: /klotski/assets/scripts/server/mgrs/UIMgr.ts
 */
class UIMgr {
	private static _instance: UIMgr;
	public static get instance(): UIMgr {
		if (!this._instance) this._instance = new UIMgr();
		return this._instance;
	}

	public async start(finishCb?: Function) {
		try {
			console.log(`uiMgr start`);
			if (finishCb) finishCb();
		} catch (error) {
			console.error(error);
		}
	}

	// 挂载
	public async mount(mountNode: Node, data: any) {
		try {
			const prefab = await resHelper.loadPrefab('prefabs/FoodPrefab');
			mountNode.addChild(prefab);
		} catch (error) {
			console.error(error);
		}
	}

	// 卸载
	public async unmount() {}
}
export const uiMgr = UIMgr.instance;
