/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 17:05:58
 * @LastEditTime: 2021-12-12 17:55:19
 * @LastEditors: zhupengfei
 * @Description:关卡组件
 * @FilePath: /klotski/assets/scripts/components/LevelItem.ts
 */
import { _decorator, Component, Node, Label } from 'cc';
import { WIN_ID } from '../common/mgrs/WinConfig';
import { winMgr } from '../common/mgrs/WinMgr';
import { Block } from '../libs/Klotski';
import { KlotskiView } from '../modules/klotskiModule/KlotskiView';
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
	private _levelIndex: number;
	public get levelIndex(): number {
		return this._levelIndex;
	}
	public set levelIndex(v: number) {
		this._levelIndex = v;
		this.lblLevelIndex.string = `${v + 1}`;
	}

	private _blocks: Block[];
	public get blocks(): Block[] {
		return this._blocks;
	}
	public set blocks(v: Block[]) {
		this._blocks = v;
	}

	@property(Label)
	lblLevelIndex: Label;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	initProps(props: { name: string; blocks: Block[]; index: number }) {
		const { blocks, index } = props;
		this.levelIndex = index;
		this.blocks = blocks;
	}

	onBtnClickToLevel() {
		console.log(`go to level: ${this.levelIndex}`);
		winMgr
			.openWin(WIN_ID.KLOTSKI)
			.then((nd: Node) => {
				nd.getComponent(KlotskiView).initProps(this.blocks);
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
