/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 13:58:26
 * @LastEditTime: 2021-10-24 18:19:37
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import { _decorator, Component, Node } from 'cc';
import { Food } from './client/Food';
import { arrange } from './client/logic/Arrange';
import { resHelper } from './helper/ResHelper';
import { ILevelModel } from './server/database/IDataModel';
import { uiMgr } from './server/mgrs/UIMgr';
import { server } from './server/Server';

const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {
	@property(Node)
	gridLayer: Node;

	onLoad() {
		server.start(async () => {
			const lvlDt = await server.reqLvlDt(1);
			console.log('lvlDt :>> ', lvlDt);
			const startList = lvlDt.startList.split(',');
			arrange.init(startList);
			startList.forEach(async (v, idx) => {
				if (v !== '0') {
					const foodPrefab = await resHelper.loadPrefab('prefabs/FoodPrefab');
					const data = await server.reqFood(v);
					data.idx = idx;
					foodPrefab.getComponent(Food).initView(data);
					this.gridLayer.addChild(foodPrefab);
				}
			});
			// for (const v of startList) {
			// 	if (v !== '0') {
			// 		const foodPrefab = await resHelper.loadPrefab('prefabs/FoodPrefab');
			// 		const data = await server.reqFood(v);
			// 		foodPrefab.getComponent(Food).initView(data);
			// 		this.gridLayer.addChild(foodPrefab);
			// 	}
			// }
		});

		uiMgr.start();
	}

	start() {}

	// update (deltaTime: number) {
	//     // [4]
	// }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
