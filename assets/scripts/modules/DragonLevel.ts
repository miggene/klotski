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
	Vec3,
} from 'cc';
import { audioMgr, SOUND_CLIPS } from '../AudioMgr';
import { WIN_ID } from '../common/mgrs/WinConfig';
import { winMgr } from '../common/mgrs/WinMgr';
import { database } from '../Database';
import { Main } from '../Main';
import { KlotskiView } from './klotskiModule/KlotskiView';
import { ILevelData } from './levelsModule/ILevelsModule';
import { Level_Per_Page } from './levelsModule/ILevelsModuleCfg';
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
	@property(dragonBones.ArmatureDisplay)
	dragonStar: dragonBones.ArmatureDisplay;

	@property(Node)
	blockLayer: Node;

	private _levelDataList: ILevelData[];
	public get levelDataList(): ILevelData[] {
		return this._levelDataList;
	}
	public set levelDataList(v: ILevelData[]) {
		this._levelDataList = v;
	}

	private _hideCb: Function = null;

	private _bookIndex: number;
	public get bookIndex(): number {
		return this._bookIndex;
	}
	public set bookIndex(v: number) {
		this._bookIndex = v;
	}

	onEnable() {
		this.blockLayer.active = false;
		this.dragonLevel.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonLevelListener,
			this
		);
		this.dragonLevel.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonStarListener,
			this
		);
	}

	onDisable() {
		this.dragonLevel.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonLevelListener,
			this
		);
		this.dragonLevel.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonStarListener,
			this
		);
	}

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	private _dragonLevelListener(event: any) {
		if (event.animationState.name === 'all_label_appear') {
			if (this._hideCb) {
				this._hideCb();
				this._hideCb = null;
			}
			return;
		}
		for (let i = 0; i < Level_Per_Page; ++i) {
			if (event.animationState.name === `label${i}_activation`) {
				this.dragonLevel.playAnimation(`label${i}_standby`, 0);
				return;
			}
			if (event.animationState.name === `label${i}_locked`) {
				const index = Math.floor(database.user.curLevel / Level_Per_Page);
				const left = database.user.curLevel % Level_Per_Page;

				if (this.bookIndex === index) {
					this.dragonLevel.playAnimation(`label${left}_standby`, 0);
					return;
				}
			}
		}
	}

	show(index: number, list: ILevelData[]) {
		console.log(`show: ${index}`);
		this.bookIndex = index;
		this.dragonLevel.timeScale = 1;
		this.dragonLevel.playAnimation('all_label_appear', 1);
		// this.node.children.forEach((child, index) => {
		// 	// child.getComponent(LevelItem).initProps(list[index]);
		// 	tween(child.getComponent(UIOpacity)).to(1, { opacity: 255 }).start();
		// });
		this.levelDataList = list;
		for (let i = 0, len = list.length; i < len; ++i) {
			const data = list[i];
			const { level } = data;
			const labelTitleNode = this.node.getChildByName(`Label${i}`);
			const lblLevelIndexNode = this.node.getChildByName(`lblLevelIndex${i}`);
			const spLockNode = this.node.getChildByName(`spLock${i}`);
			lblLevelIndexNode.getComponent(Label).string = `${level}`;
			const { maxUnlockLevel } = database.user;
			tween(labelTitleNode.getComponent(UIOpacity))
				.to(1.2, { opacity: 255 })
				.start();
			tween(lblLevelIndexNode.getComponent(UIOpacity))
				.to(1.2, {
					opacity: level - 1 > maxUnlockLevel ? 0 : 255,
				})
				.start();
			tween(spLockNode.getComponent(UIOpacity))
				.to(1.2, {
					opacity: level - 1 > maxUnlockLevel ? 255 : 0,
				})
				.start();
			if (level - 1 === database.user.curLevel) {
				this.scheduleOnce(() => {
					this.dragonLevel.playAnimation(`label${i}_activation`, 1);
				}, 1.2);
			}
		}
		tween(this.node.getChildByName('lblHome').getComponent(UIOpacity))
			.delay(0.8)
			.to(1, { opacity: 255 })
			.start();
		tween(this.node.getChildByName('lblDinner').getComponent(UIOpacity))
			.delay(0.8)
			.to(1, { opacity: 255 })
			.start();
		tween(this.node.getChildByName('homeIcon').getComponent(UIOpacity))
			.delay(0.8)
			.to(1, { opacity: 255 })
			.start();
		tween(this.node.getChildByName('dinnerIcon').getComponent(UIOpacity))
			.delay(0.8)
			.to(1, { opacity: 255 })
			.start();
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
		this.blockLayer.active = true;
		const index = parseInt(event.target.name.slice(6), 10);
		const level = this.bookIndex * Level_Per_Page + index;
		const { maxUnlockLevel } = database.user;
		if (level > maxUnlockLevel) {
			this.dragonLevel.playAnimation(`label${index}_locked`, 1);
		} else {
			audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
			this.dragonLevel.playAnimation(`label${index}_activation`, 1);
			this._showDragonStar((event.target as Node).parent.getPosition());
			winMgr
				.openWin(WIN_ID.KLOTSKI)
				.then((nd: Node) => {
					nd.getComponent(KlotskiView).initProps(
						this.levelDataList[level % Level_Per_Page]
					);
					// this.node.parent.parent.parent.parent.parent.destroy();
					this.blockLayer.active = false;
					this.node.destroy();
					const mainScript = this.node.parent.getComponent(Main);
					mainScript.hideMain();
					mainScript.adjustGirl();
				})
				.catch((err) => console.error(err));
		}
	}

	onBtnClickToHome() {
		this.blockLayer.active = true;
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		const mainScript = this.node.parent.getComponent(Main);
		mainScript.showLevelToMain();
		this.blockLayer.active = false;
	}

	private _dragonStarListener(event) {
		this.dragonStar.node.active = false;
	}

	private _showDragonStar(pos: Vec3) {
		this.dragonStar.node.active = true;
		this.dragonStar.node.setPosition(pos);
		this.dragonStar.playAnimation('newAnimation', 1);
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
