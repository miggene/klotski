import {
	_decorator,
	Component,
	Node,
	dragonBones,
	tween,
	UIOpacity,
	v3,
	Label,
	EventTouch,
} from 'cc';
import { dataMgr } from '../common/mgrs/DataMgr';
import { WIN_ID } from '../common/mgrs/WinConfig';
import { winMgr } from '../common/mgrs/WinMgr';
import { Main } from '../Main';
import { KlotskiView } from './klotskiModule/KlotskiView';
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

	private _levelDataList: ILevelData[];
	public get levelDataList(): ILevelData[] {
		return this._levelDataList;
	}
	public set levelDataList(v: ILevelData[]) {
		this._levelDataList = v;
	}

	private _hideCb: Function = null;

	private _curIndex: number;
	public get curIndex(): number {
		return this._curIndex;
	}
	public set curIndex(v: number) {
		this._curIndex = v;
	}

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
		if (event.animationState.name === 'all_label_appear') {
			if (this._hideCb) {
				this._hideCb();
				this._hideCb = null;
			}
			return;
		}
		for (let i = 0; i < 12; ++i) {
			if (event.animationState.name === `label${i}_activation`) {
				this.dragonLevel.playAnimation(`label${i}_standby`, 0);
				return;
			}
			if (event.animationState.name === `label${i}_locked`) {
				this.dragonLevel.playAnimation(`label${this.curIndex}_standby`, 0);
			}
		}
	}

	show(index: number, list: ILevelData[]) {
		console.log(`show: ${index}`);
		this.dragonLevel.timeScale = 1;
		this.dragonLevel.playAnimation('all_label_appear', 1);
		// this.node.children.forEach((child, index) => {
		// 	// child.getComponent(LevelItem).initProps(list[index]);
		// 	tween(child.getComponent(UIOpacity)).to(1, { opacity: 255 }).start();
		// });
		this.levelDataList = list;
		for (let i = 0, len = list.length; i < len; ++i) {
			const data = list[i];
			const { board, level } = data;
			const labelTitleNode = this.node.getChildByName(`Label${i}`);
			const lblLevelIndexNode = this.node.getChildByName(`lblLevelIndex${i}`);
			const spLockNode = this.node.getChildByName(`spLock${i}`);
			lblLevelIndexNode.getComponent(Label).string = `${level}`;
			tween(labelTitleNode.getComponent(UIOpacity))
				.to(1.2, { opacity: 255 })
				.start();
			tween(lblLevelIndexNode.getComponent(UIOpacity))
				.to(1.2, { opacity: level > dataMgr.unlockMaxIndex ? 0 : 255 })
				.start();
			tween(spLockNode.getComponent(UIOpacity))
				.to(1.2, { opacity: level > dataMgr.unlockMaxIndex ? 255 : 0 })
				.start();
			if (level === dataMgr.curLevelIndex) {
				this.curIndex = i;
				this.scheduleOnce(() => {
					this.dragonLevel.playAnimation(`label${i}_activation`, 1);
				}, 1.2);
			}
		}
	}
	hide(cb: Function) {
		this._hideCb = cb;
		this.dragonLevel.timeScale = -1;
		this.dragonLevel.playAnimation('all_label_appear', 1);

		this.node.children.forEach((child) => {
			tween(child.getComponent(UIOpacity)).to(1, { opacity: 0 }).start();
		});
	}

	onBtnClickToLevel(event: EventTouch) {
		const index = parseInt(event.target.name.slice(6), 10);
		console.log('dataMgr.unlockMaxIndex :>> ', dataMgr.unlockMaxIndex);
		if (index >= dataMgr.unlockMaxIndex) {
			this.dragonLevel.playAnimation(`label${index}_locked`, 1);
		} else {
			this.dragonLevel.playAnimation(`label${index}_activation`, 1);
			winMgr
				.openWin(WIN_ID.KLOTSKI)
				.then((nd: Node) => {
					nd.getComponent(KlotskiView).initProps(this.levelDataList[index]);
					// this.node.parent.parent.parent.parent.parent.destroy();
					this.node.destroy();
					const mainScript = this.node.parent.getComponent(Main);
					mainScript.node
						.getChildByName(`dragonBook_${mainScript.curIndex}`)
						?.destroy();
					mainScript.dragonBook.node.destroy();
				})
				.catch((err) => console.error(err));
		}
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
