/*
 * @Author: zhupengfei
 * @Date: 2021-09-22 13:59:44
 * @LastEditTime: 2021-11-06 15:18:17
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/helper/UtilHelper.ts
 */
import { JsonAsset, Node, resources, UITransform, v2, v3, Vec2 } from 'cc';

export interface ITouchListener {
	'touch-start'?: (e) => void;
	'touch-move'?: (e) => void;
	'touch-end'?: (e) => void;
	'touch-cancel': (e) => void;
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
				nd.on(`${key}`, func, target);
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

	// 节点是否被点中
	public beTched(wTchPos: Vec2, targetNode: Node): boolean {
		const lTchPos = targetNode.parent
			.getComponent(UITransform)
			.convertToNodeSpaceAR(v3(wTchPos.x, wTchPos.y, 0));
		const b = targetNode
			.getComponent(UITransform)
			.getBoundingBox()
			.contains(v2(lTchPos.x, lTchPos.y));
		return b;
	}

	// 获取移动的方向[上，下，左，右] = [[0,1],[0,-1],[1,0],[-1,0]]
	public getMoveDirection(
		curPos: Vec2,
		lastPos: Vec2,
		thresHold: number = 0
	): number[] {
		const offV = curPos.clone().subtract(lastPos);
		const offX = offV.x;
		const offY = offV.y;
		if (Math.abs(offX) > Math.abs(offY)) {
			const x = offV.x > thresHold ? 1 : offV.x < -thresHold ? -1 : 0;
			return [x, 0];
		}
		if (Math.abs(offX) <= Math.abs(offY)) {
			const y = offV.y > thresHold ? 1 : offV.y < -thresHold ? -1 : 0;
			return [0, y];
		}
	}
}

export const utilHelper = UtilHelper.instance;
