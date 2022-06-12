/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 14:45:59
 * @LastEditTime: 2021-12-28 16:09:52
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/overModule/OverView.ts
 */
import {
	_decorator,
	Component,
	Node,
	director,
	instantiate,
	macro,
	dragonBones,
	UIOpacity,
	tween,
	Label,
	Sprite,
} from 'cc';
import { audioMgr, SOUND_CLIPS } from '../../AudioMgr';
import { dataMgr } from '../../common/mgrs/DataMgr';
import { resMgr } from '../../common/mgrs/ResMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
import { formatTime } from '../../common/utils/Helper';

import { database } from '../../Database';
import { Main } from '../../Main';
import { KlotskiView } from '../klotskiModule/KlotskiView';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = OverView
 * DateTime = Mon Dec 27 2021 14:45:59 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = OverView.ts
 * FileBasenameNoExtension = OverView
 * URL = db://assets/scripts/modules/overModule/OverView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('OverView')
export class OverView extends Component {
	private _time: number;
	public get time(): number {
		return this._time;
	}
	public set time(v: number) {
		this._time = v;
		// this.lblTime.string = formatTime(v);
	}

	private _moveStep: number;
	public get moveStep(): number {
		return this._moveStep;
	}
	public set moveStep(v: number) {
		this._moveStep = v;
		this.lblMoveStep.string = `${v}`;
	}

	private _bestTime: number;
	public get bestTime(): number {
		return this._bestTime;
	}
	public set bestTime(v: number) {
		this._bestTime = v;
		this.lblBestTime.string = formatTime(v);
	}

	private _level: number;
	public get level(): number {
		return this._level;
	}
	public set level(v: number) {
		this._level = v;
	}

	private _blockName: string;
	private _bFail: boolean = false;

	@property(Node)
	winTip: Node;

	@property(dragonBones.ArmatureDisplay)
	drgFood: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	drgEnd: dragonBones.ArmatureDisplay;

	@property(Label)
	lblBestTime: Label;

	@property(Label)
	lblMoveStep: Label;
	@property(dragonBones.ArmatureDisplay)
	drgBB: dragonBones.ArmatureDisplay;

	// @property(Label)
	// lblTime: Label;

	@property(dragonBones.ArmatureDisplay)
	drgFail: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	drgGas: dragonBones.ArmatureDisplay;

	@property(dragonBones.ArmatureDisplay)
	drgPaper: dragonBones.ArmatureDisplay;

	onLoad() {
		this.drgFail.node.active = false;
		this.drgEnd.node.active = false;
		this.drgGas.node.active = false;
	}

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	onEnable() {
		this.drgBB.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._bbAnimEventHandler,
			this
		);
	}

	onDisable() {
		this.drgBB.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._bbAnimEventHandler,
			this
		);
	}

	onDestroy() {
		this.unschedule(this._createWinTip);
	}

	/**
	 *  initProps
	 */
	public async initProps(props: {
		moveStep: number;
		time: number;
		curLevel: number;
		blockName: string;
	}) {
		console.log('2');
		audioMgr.playSound(SOUND_CLIPS.WIN);
		this.schedule(this._createWinTip, 2, macro.REPEAT_FOREVER, 1);
		this.scheduleOnce(() => {
			this.drgBB.playAnimation('apper', 1);
			this.bestTime = this._bestTime;
		}, 2);
		this.drgEnd.node.active = true;
		this.drgEnd.playAnimation('end', 1);

		const { moveStep, time, curLevel, blockName } = props;
		this.level = curLevel;
		// this.moveStep = moveStep;

		this._bestTime = this._updateBestTime(curLevel, time);

		this.time = time;
		this._blockName = blockName;
		if (this.level > database.user.maxUnlockLevel) {
			const maxUnlockLevel = database.user.maxUnlockLevel + 1;
			database.user.setState({ maxUnlockLevel });
		}
		const path = `dragonBones/${this._blockName}`;
		const dragonBonesAsset = await resMgr.loadDragonAsset(path);
		const dragonBonesAtlasAsset = await resMgr.loadDragonAtlasAsset(path);
		this.drgFood.dragonAsset = dragonBonesAsset;
		this.drgFood.dragonAtlasAsset = dragonBonesAtlasAsset;
		this.drgFood.armatureName = 'Armature';
		this.drgFood.playAnimation('victory', 0);
		this.drgFood.node.getComponent(UIOpacity).opacity = 0;
		const nextLevelIndex = this.level;
		database.user.setState({ curLevel: nextLevelIndex });
		tween(this.drgFood.node.getComponent(UIOpacity))
			.delay(0.3)
			.to(0.1, { opacity: 255 })
			.call(() => {
				this.drgFood.playAnimation('victory', 0);
			})
			.start();
	}

	onBtnClickToHome() {
		audioMgr.playBgMusic();
		winMgr.clearWin();
		const mainScript = director
			.getScene()
			.getChildByName('Canvas')
			.getComponent(Main);
		mainScript.showMain();
	}
	onBtnClickToLevels() {
		audioMgr.playBgMusic();
		winMgr.clearWin();
		const mainScript = director
			.getScene()
			.getChildByName('Canvas')
			.getComponent(Main);
		mainScript.showLevel();
	}
	public async onBtnClickToRetry() {
		audioMgr.playBgMusic();
		winMgr.clearWin();
		const levelsData = await dataMgr.getlevelsDataCache();
		const data = levelsData[this.level - 1];
		if (data) {
			console.log(`go to level: ${this.level}`);
			winMgr
				.openWin(WIN_ID.KLOTSKI)
				.then((nd: Node) => {
					nd.getComponent(KlotskiView).initProps(data);
				})
				.catch((err) => console.error(err));
		}
	}
	public async onBtnClickToNext() {
		audioMgr.playBgMusic();
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);

		if (this._bFail) return;

		winMgr.clearWin();
		const levelsData = await dataMgr.getlevelsDataCache();
		// this.level++;
		const data = levelsData[this.level];
		if (data) {
			console.log(`go to level: ${this.level + 1}`);
			winMgr
				.openWin(WIN_ID.KLOTSKI)
				.then((nd: Node) => {
					nd.getComponent(KlotskiView).initProps(data);
				})
				.catch((err) => console.error(err));
		}
	}
	onBtnClickToShare() {
		// audioMgr.playBgMusic();
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		console.log('share');
	}
	onBtnClickToDinner() {
		// audioMgr.playBgMusic();
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		console.log('dinner');
	}

	private _createWinTip() {
		for (let i = 0; i < 2; ++i) {
			const tip = instantiate(this.winTip);
			tip.active = true;
			this.node.addChild(tip);
		}
	}

	private _updateBestTime(level: number, usedTime: number) {
		const lastBestTime = dataMgr.getLastBestTimeByLevel(level, `${usedTime}`);
		const bestTime = Math.min(lastBestTime, usedTime);
		dataMgr.setBestTimeByLevel(level, bestTime);
		return bestTime;
	}

	_bbAnimEventHandler(event) {
		if (event.animationState.name === 'apper') {
			this.drgBB.playAnimation('standby', 0);
		}
	}

	public async fail(curLevel: number, blockName: string) {
		this._bFail = true;
		this.level = curLevel;
		this.node.getChildByName('mask').active = true;
		audioMgr.stopBgMusic();
		audioMgr.playSound(SOUND_CLIPS.FAIL);
		this.drgPaper.node.active = false;
		this.drgFail.node.active = true;
		this.drgFail.once(
			dragonBones.EventObject.COMPLETE,
			this._failEventHandler,
			this
		);
		this.drgFail.playAnimation('on', 1);

		const slot = this.drgFail.armature().getSlot('w');
		const index = ['zongzi', 'FriedEggs', 'chips', 'toast'].indexOf(blockName);
		slot.displayIndex = index >= 0 ? index : 0;
	}

	private _failEventHandler(event) {
		if (event.animationState.name === 'on') {
			this.drgGas.node.active = true;
			this.drgGas.playAnimation('gas', 0);
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
