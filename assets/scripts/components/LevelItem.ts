/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 17:05:58
 * @LastEditTime: 2021-12-18 17:43:19
 * @LastEditors: zhupengfei
 * @Description:关卡组件
 * @FilePath: /klotski/assets/scripts/components/LevelItem.ts
 */
import { _decorator, Component, Node, Label } from 'cc';
import { WIN_ID } from '../common/mgrs/WinConfig';
import { winMgr } from '../common/mgrs/WinMgr';
import { Block } from '../libs/Klotski';
import { KlotskiView } from '../modules/klotskiModule/KlotskiView';
import { ILevelData } from '../modules/levelsModule/ILevelsModule';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = LevelItem
 * DateTime = Sun Dec 12 2021 17:05:58 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = LevelItem.ts
 * FileBasenameNoExtension = LevelItem
 * URL = db://assets/scripts/components/LevelItem.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('LevelItem')
export class LevelItem extends Component {
	private _level: number;
	public get level(): number {
		return this._level;
	}
	public set level(v: number) {
		this._level = v;
		this.lblLevelIndex.string = `${v}`;
	}

	private _boardString: string;
	public get boardString(): string {
		return this._boardString;
	}
	public set boardString(v: string) {
		this._boardString = v;
	}

	private _levelData: ILevelData;
	public get levelData(): ILevelData {
		return this._levelData;
	}
	public set levelData(v: ILevelData) {
		this._levelData = v;
	}

	@property(Label)
	lblLevelIndex: Label;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	public initProps(props: ILevelData) {
		this.levelData = props;
		const { level, board } = props;
		this.level = level;
		this.boardString = board;
		// this.blocks = blocks;
	}

	onBtnClickToLevel() {
		console.log(`go to level: ${this.level}`);
		winMgr
			.openWin(WIN_ID.KLOTSKI)
			.then((nd: Node) => {
				nd.getComponent(KlotskiView).initProps(this.levelData);
				this.node.parent.parent.parent.parent.parent.destroy();
			})
			.catch((err) => console.error(err));
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
