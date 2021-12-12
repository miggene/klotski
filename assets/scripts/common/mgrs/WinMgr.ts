import { director, earcut, instantiate, Layers, Node, Widget } from 'cc';
import { WinCache } from './IMgrs';
import { resMgr } from './ResMgr';
import { getWinInfo, WIN_ID, WIN_ZINDEX } from './WinConfig';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 11:24:02
 * @LastEditTime: 2021-12-12 11:08:56
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
		try {
			const { path, zIndex } = getWinInfo(winId);
			const prefab = await resMgr.loadPrefab(path);
			const ndWin = instantiate(prefab) as Node;
			this._winLayer.addChild(ndWin);
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
