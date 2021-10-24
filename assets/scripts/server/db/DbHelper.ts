/*
 * @Author: zhupengfei
 * @Date: 2021-10-07 14:53:45
 * @LastEditTime: 2021-10-07 15:41:04
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/server/DbHelper.ts
 */
import {
	instantiate,
	Prefab,
	resources,
	SpriteFrame,
	Node,
	JsonAsset,
} from 'cc';
import { dbCfg } from './DbCfg';

class DbHelper {
	private static _instance: DbHelper;
	public static get instance(): DbHelper {
		if (!this._instance) this._instance = new DbHelper();
		return this._instance;
	}

	// 动态加载Json
	async loadJson(path: string): Promise<JsonAsset> {
		return new Promise((resolve, reject) => {
			resources.load(path, JsonAsset, (err, data: JsonAsset) => {
				if (err) return reject(err);
				return resolve(data);
			});
		});
	}

	async loadJsonDir(): Promise<JsonAsset[]> {
		const { dbPath } = dbCfg;
		return new Promise((resolve, reject) => {
			resources.loadDir(dbPath, (err, data: JsonAsset[]) => {
				if (err) return reject(err);
				return resolve(data);
			});
		});
	}
}

export const dbHelper = DbHelper.instance;
