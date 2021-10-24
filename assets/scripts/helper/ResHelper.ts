/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 16:33:26
 * @LastEditTime: 2021-10-24 18:01:01
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/helper/ResHelper.ts
 */
import { instantiate, Prefab, resources, SpriteFrame, Node } from 'cc';

class ResHelper {
	private static _instance: ResHelper;
	public static get instance(): ResHelper {
		if (!this._instance) this._instance = new ResHelper();
		return this._instance;
	}

	// 动态加载prefab
	public async loadPrefab(path: string): Promise<Node> {
		return new Promise((resolve: (node: Node) => void, reject) => {
			resources.load(path, Prefab, (err, prefab: Prefab) => {
				if (err) return reject('error');
				const ndPrefab = instantiate(prefab);
				return resolve(ndPrefab);
			});
		});
	}

	// 动态加载sprite
	public async loadSprite(path: string): Promise<SpriteFrame> {
		return new Promise((resolve: (spf: SpriteFrame) => void, reject) => {
			resources.load(`${path}/spriteFrame`, (err, spriteFrame) => {
				if (err) return reject(err);
				return resolve(spriteFrame as SpriteFrame);
			});
		});
	}
}

export const resHelper = ResHelper.instance;
