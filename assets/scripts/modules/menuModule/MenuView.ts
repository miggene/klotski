/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 17:59:27
 * @LastEditTime: 2021-12-12 11:09:26
 * @LastEditors: zhupengfei
 * @Description:开始界面窗口
 * @FilePath: /klotski/assets/scripts/modules/menuModule/MenuView.ts
 */
import { _decorator, Component, Node } from 'cc';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MenuView
 * DateTime = Sat Dec 11 2021 17:59:27 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = MenuView.ts
 * FileBasenameNoExtension = MenuView
 * URL = db://assets/scripts/modules/menuModule/MenuView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('MenuView')
export class MenuView extends Component {
	// [1]
	// dummy = '';

	// [2]
	// @property
	// serializableDummy = 0;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }
	onBtnClickToStart() {
		console.log(`点击开始游戏`);
		winMgr.openWin(WIN_ID.KLOTSKI);
		this.node.destroy();
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
