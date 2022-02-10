/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 14:45:59
 * @LastEditTime: 2021-12-28 16:09:52
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/overModule/OverView.ts
 */
import { _decorator, Component, Node, Label, director } from 'cc';
import { dataMgr } from '../../common/mgrs/DataMgr';
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
		this.lblTime.string = formatTime(v);
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

	@property(Label)
	lblBestTime: Label;

	@property(Label)
	lblMoveStep: Label;

	@property(Label)
	lblTime: Label;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	/**
	 *  initProps
	 */
	public initProps(props: {
		moveStep: number;
		time: number;
		curLevel: number;
	}) {
		const { moveStep, time, curLevel } = props;
		this.level = curLevel;
		this.moveStep = moveStep;
		// this.bestTime = bestTime;
		this.time = time;

		if (this.level > database.user.maxUnlockLevel) {
			const maxUnlockLevel = database.user.maxUnlockLevel + 1;
			database.user.setState({ maxUnlockLevel });
		}

		const nextLevelIndex = this.level;
		database.user.setState({ curLevel: nextLevelIndex });
	}

	onBtnClickToHome() {
		winMgr.clearWin();
		const mainScript = director
			.getScene()
			.getChildByName('Canvas')
			.getComponent(Main);
		mainScript.showMain();
	}
	onBtnClickToLevels() {
		winMgr.clearWin();
		const mainScript = director
			.getScene()
			.getChildByName('Canvas')
			.getComponent(Main);
		mainScript.showLevel();
	}
	public async onBtnClickToRetry() {
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
		console.log('share');
	}
	onBtnClickToDinner() {
		console.log('dinner');
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
