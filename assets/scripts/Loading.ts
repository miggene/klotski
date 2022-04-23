import { _decorator, Component, Node, tween, director } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Loading
 * DateTime = Sat Apr 02 2022 18:10:53 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = Loading.ts
 * FileBasenameNoExtension = Loading
 * URL = db://assets/scripts/Loading.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Loading')
export class Loading extends Component {
	// [1]
	// dummy = '';

	// [2]
	// @property
	// serializableDummy = 0;

	start() {
		// [3]
		tween(this.node)
			.delay(2)
			.call(() => {
				director.loadScene('Main');
			})
			.start();
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
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
