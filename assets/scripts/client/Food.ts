/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 17:56:39
 * @LastEditTime: 2021-10-31 15:37:22
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/client/Food.ts
 */
import { _decorator, Component, Node, Sprite } from 'cc';
import { resHelper } from '../helper/ResHelper';
import { IFoodModel } from '../server/database/IDataModel';
import { arrange } from './logic/Arrange';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Food
 * DateTime = Sun Oct 24 2021 17:56:39 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = Food.ts
 * FileBasenameNoExtension = Food
 * URL = db://assets/scripts/client/Food.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Food')
export class Food extends Component {
	@property(Sprite)
	spFood: Sprite = null;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	public async initView(data: IFoodModel) {
		const { name, idx } = data;
		// const [x, y] = arrange.getPosByIdx(idx);
		// this.node.setPosition(x, y);
		this.spFood.spriteFrame = await resHelper.loadSprite(`foods/${name}`);
	}
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
