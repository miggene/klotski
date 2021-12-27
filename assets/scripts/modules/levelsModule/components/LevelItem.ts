/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 17:05:58
 * @LastEditTime: 2021-12-27 15:20:39
 * @LastEditors: zhupengfei
 * @Description:关卡组件
 * @FilePath: /klotski/assets/scripts/modules/levelsModule/components/LevelItem.ts
 */
import { _decorator, Component, Node, Label } from 'cc';
import { WIN_ID } from '../../../common/mgrs/WinConfig';
import { winMgr } from '../../../common/mgrs/WinMgr';
import { KlotskiView } from '../../klotskiModule/KlotskiView';
import { ILevelData } from '../ILevelsModule';
import { Level_Item_Angles } from '../ILevelsModuleCfg';
const { ccclass, property } = _decorator;

@ccclass('LevelItem')
export class LevelItem extends Component {
	private _level: number;
	public get level(): number {
		return this._level;
	}
	public set level(v: number) {
		this._level = v;
		this.lblLevelIndex.string = `${v}`;
		this.node.angle = Level_Item_Angles[(v - 1) % 3];
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
