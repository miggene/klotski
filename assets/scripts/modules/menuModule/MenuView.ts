/*
 * @Author: zhupengfei
 * @Date: 2021-12-11 17:59:27
 * @LastEditTime: 2021-12-22 19:35:48
 * @LastEditors: zhupengfei
 * @Description:开始界面窗口
 * @FilePath: /klotski/assets/scripts/modules/menuModule/MenuView.ts
 */
import { _decorator, Component, Node, Label, tween, UITransform } from 'cc';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
const { ccclass, property } = _decorator;

@ccclass('MenuView')
export class MenuView extends Component {
	@property(Label)
	lblStart: Label = null;

	start() {
		// [3]
		tween(this.lblStart.color)
			.repeatForever(tween().to(1, { a: 0 }).to(1, { a: 255 }).delay(1))
			.start();
	}

	// update (deltaTime: number) {
	//     // [4]
	// }
	onBtnClickToStart() {
		console.log(`点击开始游戏`);
		// winMgr.openWin(WIN_ID.KLOTSKI);
		winMgr.openWin(WIN_ID.LEVELS);
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
