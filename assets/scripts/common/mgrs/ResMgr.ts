/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 16:14:50
 * @LastEditTime: 2021-12-12 11:36:45
 * @LastEditors: zhupengfei
 * @Description: 资源加载管理类
 * @FilePath: /klotski/assets/scripts/common/mgrs/ResMgr.ts
 */

import { JsonAsset, Prefab, resources } from 'cc';

class ResMgr {
	private static _instance: ResMgr;
	public static get instance(): ResMgr {
		if (!this._instance) this._instance = new ResMgr();
		return this._instance;
	}

	public async loadPrefab(path: string) {
		return new Promise((resolve, reject) => {
			resources.load(path, Prefab, (err, prefab: Prefab) => {
				if (err) reject(err);
				else resolve(prefab);
			});
		});
	}

	public async loadJson(path: string) {
		return new Promise((resolve, reject) => {
			resources.load(path, JsonAsset, (err, data: JsonAsset) => {
				if (err) reject(err);
				else resolve(JSON.parse(JSON.stringify(data.json)));
			});
		});
	}
}

export const resMgr = ResMgr.instance;
