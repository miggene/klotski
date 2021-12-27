/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:50:28
 * @LastEditTime: 2021-12-27 16:57:52
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/common/mgrs/WinMgr.ts
 */
import { director, instantiate, Layers, Node, Prefab, UITransform } from 'cc';
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
		this._winLayer.addComponent(UITransform);
		canvas.addChild(this._winLayer);
		this._winLayer
			.getComponent(UITransform)
			.setContentSize(canvas.getComponent(UITransform).contentSize);
	}
	public async openWin(winId: WIN_ID) {
		return new Promise((resolve, reject) => {
			const { path } = getWinInfo(winId);
			resMgr
				.loadPrefab(path)
				.then((prefab: Prefab) => {
					const ndWin = instantiate(prefab);
					this._winLayer.addChild(ndWin);
					const size = this._winLayer.getComponent(UITransform).contentSize;
					resolve(ndWin);
				})
				.catch((err) => reject(err));
		});
	}
	public closeWin(winId: WIN_ID, node?: Node | string) {}
	public clearWin() {
		this._winLayer?.destroyAllChildren();
	}
	public destroy() {
		this._winLayer?.destroy();
		this._winLayer = null;
	}
}

export const winMgr = WinMgr.instance;
