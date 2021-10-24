/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 13:58:26
 * @LastEditTime: 2021-10-24 11:30:49
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {
	@property(Node)
	gridLayer: Node;

	onLoad() {

	}

	start() {

	}





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
