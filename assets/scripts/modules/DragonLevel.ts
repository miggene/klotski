import { _decorator, Component, Node, dragonBones, tween, UIOpacity } from 'cc';
import { LevelItem } from './levelsModule/components/LevelItem';
import { ILevelData } from './levelsModule/ILevelsModule';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DragonLevel
 * DateTime = Sat Feb 05 2022 15:33:54 GMT+0800 (中国标准时间)
 * Author = COUPLESTUDIO
 * FileBasename = DragonLevel.ts
 * FileBasenameNoExtension = DragonLevel
 * URL = db://assets/scripts/modules/DragonLevel.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('DragonLevel')
export class DragonLevel extends Component {
	@property(dragonBones.ArmatureDisplay)
	dragonLevel: dragonBones.ArmatureDisplay;

	private _hideCb: Function = null;

	onEnable() {
		this.dragonLevel.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._listener,
			this
		);
	}

	onDisable() {
		this.dragonLevel.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._listener,
			this
		);
	}

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	private _listener(event: any) {
		if (event.animationState.name === 'open_2B') {
			if (this._hideCb) {
				this._hideCb();
				this._hideCb = null;
			}
		}
	}

	show(index: number, list: ILevelData[]) {
		console.log(`show: ${index}`);
		this.dragonLevel.timeScale = 1;
		this.dragonLevel.playAnimation('open_2B', 1);
		this.node.children.forEach((child, index) => {
			child.getComponent(LevelItem).initProps(list[index]);
			tween(child.getComponent(UIOpacity)).to(1.2, { opacity: 255 }).start();
		});
	}
	hide(cb: Function) {
		this._hideCb = cb;
		this.dragonLevel.timeScale = -1;
		this.dragonLevel.playAnimation('open_2B', 1);

		this.node.children.forEach((child) => {
			tween(child.getComponent(UIOpacity)).to(1.2, { opacity: 0 }).start();
		});
	}
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
