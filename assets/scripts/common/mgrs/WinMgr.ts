/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:50:28
 * @LastEditTime: 2021-12-12 17:24:24
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/common/mgrs/WinMgr.ts
 */
import { director, instantiate, Layers, Node, Prefab, Widget } from 'cc';
import { WinCache } from './IMgrs';
import { resMgr } from './ResMgr';
import { getWinInfo, WIN_ID, WIN_ZINDEX } from './WinConfig';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 11:24:02
 * @LastEditTime: 2021-12-12 17:23:13
 * @LastEditors: zhupengfei
 * @Description: 视窗管理类
 * @FilePath: /klotski/assets/scripts/common/mgrs/WinMgr.ts
 */
class WinMgr {
	private _winLayer: Node;
	private static _instance: WinMgr;
	public static get instance(): WinMgr {
		if (!this._instance) this._instance = new WinMgr();
		return this._instance;
	}
	private _winCaches: Map<WIN_ID, WinCache[]> = new Map();
	public init() {
		const canvas = director.getScene().getChildByName('Canvas');
		this._winLayer = new Node('winLayer');
		this._winLayer.layer = Layers.Enum.UI_2D;
		this._winLayer.setSiblingIndex(WIN_ZINDEX.WINDOW);
		const widget = this._winLayer.addComponent(Widget);
		widget.enabled = true;
		widget.left = 0;
		widget.right = 0;
		widget.top = 0;
		widget.bottom = 0;
		canvas.addChild(this._winLayer);
	}
	public async openWin(winId: WIN_ID) {
		return new Promise((resolve, reject) => {
			const { path } = getWinInfo(winId);
			resMgr
				.loadPrefab(path)
				.then((prefab: Prefab) => {
					const ndWin = instantiate(prefab);
					this._winLayer.addChild(ndWin);
					resolve(ndWin);
				})
				.catch((err) => reject(err));
		});
		try {
		} catch (error) {
			console.error(error);
		}
	}
	public closeWin(winId: WIN_ID, node?: Node | string) {}
	public destroy() {
		this._winLayer?.destroy();
		this._winLayer = null;
	}

	private _addWin(winId: WIN_ID, node: Node) {
		const tarWinCaches = this._winCaches.get(winId);
		let val: WinCache;
		if (!tarWinCaches) {
			val = { node, uuid: node.uuid, count: 1 };
			this._winCaches.set(winId, [val]);
			return val;
		}

		const uuid = node.uuid;
		const cache = tarWinCaches.find((v) => v.uuid === uuid);
		if (!cache) {
			val = { node, uuid, count: 1 };
			tarWinCaches.push(val);
			return val;
		}
		cache.count += 1;
		return cache;
	}
}

export const winMgr = WinMgr.instance;
