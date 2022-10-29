/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 16:14:50
 * @LastEditTime: 2021-12-18 17:30:35
 * @LastEditors: zhupengfei
 * @Description: 资源加载管理类
 * @FilePath: /klotski/assets/scripts/common/mgrs/ResMgr.ts
 */

import {
	AssetManager,
	assetManager,
	dragonBones,
	JsonAsset,
	Prefab,
	resources,
	Sprite,
	SpriteFrame,
} from 'cc';

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

	public async loadSprite(path: string) {
		return new Promise<SpriteFrame>((resolve, reject) => {
			resources.load(
				path + '/spriteFrame',
				SpriteFrame,
				(err, asset: SpriteFrame) => {
					if (err) reject(err);
					else resolve(asset);
				}
			);
		});
	}

	public async loadBundle(bundleName: string) {
		return new Promise<AssetManager.Bundle>((resolve, reject) => {
			assetManager.loadBundle(bundleName, null, (err, bundle) => {
				if (err) {
					reject(err);
				} else {
					resolve(bundle);
				}
			});
		});
	}

	public async loadDragonAsset(path: string, bundle: AssetManager.Bundle) {
		return new Promise<dragonBones.DragonBonesAsset>((resolve, reject) => {
			bundle.load(
				`${path}_ske`,
				dragonBones.DragonBonesAsset,
				(err, dragonBonesAsset: dragonBones.DragonBonesAsset) => {
					if (err) reject(err);
					else resolve(dragonBonesAsset);
				}
			);
		});
	}

	public async loadDragonAtlasAsset(path: string, bundle: AssetManager.Bundle) {
		return new Promise<dragonBones.DragonBonesAtlasAsset>((resolve, reject) => {
			bundle.load(
				`${path}_tex`,
				dragonBones.DragonBonesAtlasAsset,
				(err, dragonBonesAtlasAsset: dragonBones.DragonBonesAtlasAsset) => {
					if (err) reject(err);
					else resolve(dragonBonesAtlasAsset);
				}
			);
		});
	}

	public async preloadPrefab(path: string) {
		resources.preload(path, Prefab);
	}
}

export const resMgr = ResMgr.instance;
