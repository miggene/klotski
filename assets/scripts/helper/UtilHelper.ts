/*
 * @Author: zhupengfei
 * @Date: 2021-09-22 13:59:44
 * @LastEditTime: 2021-10-24 11:55:13
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/helper/UtilHelper.ts
 */
import { JsonAsset, Node, resources } from 'cc';

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

	// 动态加载json文件
	public async loadJson(path: string): Promise<object> {
		return new Promise((resolve, reject) => {
			resources.load(path, JsonAsset, (err, data: JsonAsset) => {
				if (err) return reject(err);
				return resolve(data.json);
			});
		});
	}

	// 动态加载json文件数组
	public async loadJsons(paths: string[]): Promise<object[]> {
		return new Promise((resolve, reject) => {
			resources.load(paths, JsonAsset, (err, data: JsonAsset[]) => {
				if (err) return reject(err);
				return resolve(data.map((v) => v.json));
			});
		});
	}
}

export const utilHelper = UtilHelper.instance;
