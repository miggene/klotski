/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 15:28:48
 * @LastEditTime: 2021-09-21 17:37:10
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/grid/GridItem.ts
 */
import { _decorator, Component, Sprite, UITransformComponent } from 'cc';
import { resHelper } from '../helper/ResHelper';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GridItem
 * DateTime = Tue Sep 21 2021 15:28:48 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = GridItem.ts
 * FileBasenameNoExtension = GridItem
 * URL = db://assets/scripts/grid/GridItem.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface IData {
	verticeSize: number;
	name: string;
}

@ccclass('GridItem')
export class GridItem extends Component {
	@property(Sprite)
	spItem: Sprite;

	private _data: IData;
	public get data(): IData {
		return this._data;
	}
	public set data(v: IData) {
		this._data = v;
		this.initView();
	}

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	public async initView() {
		const { verticeSize, name } = this.data;
		this.node
			.getComponent(UITransformComponent)
			.setContentSize(verticeSize, verticeSize);
		try {
			const spriteFrame = await resHelper.loadSprite(`grids/${name}`);
			this.spItem.spriteFrame = spriteFrame;
		} catch (error) {
			console.error(error);
		}
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
