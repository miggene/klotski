/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 13:58:26
 * @LastEditTime: 2021-10-31 18:32:39
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import { _decorator, Component, Node, UITransform, EventTouch } from 'cc';
import { Food } from './client/Food';
import { arrange } from './client/logic/Arrange';
import { resHelper } from './helper/ResHelper';
import { utilHelper } from './helper/UtilHelper';
import { uiMgr } from './server/mgrs/UIMgr';
import { server } from './server/Server';

const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {
	@property(Node)
	gridLayer: Node = null;

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
					let [x, y] = arrange.getPosByIdx(idx);
					[x, y] = arrange.flipY([x, y]);
					[x, y] = arrange.moveRel2Center([x, y]);
					const [r, c] = data.range.split('x').map((v) => parseInt(v, 10));
					const [w, h] = arrange.getWH([r, c]);
					foodPrefab.getComponent(UITransform).setContentSize(w, h);
					[x, y] = arrange.moveRel2Self([x, y], [w, h]);
					foodPrefab.getComponent(Food).initView(data);
					foodPrefab.setPosition(x, y);
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

	start() {
		// utilHelper.onTch(
		// 	this.gridLayer,
		// 	{
		// 		'touch-start': this._touchS,
		// 		'touch-move': this._touchM,
		// 		'touch-end': this._touchE,
		// 		'touch-cancel': this._touchC,
		// 	},
		// 	this
		// );
		this.gridLayer.on(Node.EventType.TOUCH_START, this._touchS.bind(this));
		this.gridLayer.on(Node.EventType.TOUCH_MOVE, this._touchM.bind(this));
		this.gridLayer.on(Node.EventType.TOUCH_END, this._touchE.bind(this));
		this.gridLayer.on(Node.EventType.TOUCH_CANCEL, this._touchC.bind(this));
	}

	public _touchS(e: EventTouch) {
		console.log('e :>> ', e);
	}

	public _touchM(e) {}
	public _touchE(e) {}
	public _touchC(e) {}

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
