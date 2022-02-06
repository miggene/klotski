/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 17:05:58
 * @LastEditTime: 2021-12-28 16:35:27
 * @LastEditors: zhupengfei
 * @Description:关卡组件
 * @FilePath: /klotski/assets/scripts/modules/levelsModule/components/LevelItem.ts
 */
import { _decorator, Component, Node, Label, Sprite, dragonBones } from 'cc';
import { dataMgr } from '../../../common/mgrs/DataMgr';
import { WIN_ID } from '../../../common/mgrs/WinConfig';
import { winMgr } from '../../../common/mgrs/WinMgr';
import { Main } from '../../../Main';
import { KlotskiView } from '../../klotskiModule/KlotskiView';
import { ILevelData } from '../ILevelsModule';
import { Level_Item_Angles } from '../ILevelsModuleCfg';
const { ccclass, property } = _decorator;

@ccclass('LevelItem')
export class LevelItem extends Component {
	private _animationState: dragonBones.AnimationState;
	public get animationState(): dragonBones.AnimationState {
		return this._animationState;
	}
	public set animationState(v: dragonBones.AnimationState) {
		this._animationState = v;
	}

	private _level: number;
	public get level(): number {
		return this._level;
	}
	public set level(v: number) {
		this._level = v;
		this.lblLevelIndex.string = `${v}`;
		this.node.angle = Level_Item_Angles[(v - 1) % 3];
		this.locked = v > dataMgr.unlockMaxIndex;
		if (this.locked && this.animationState) {
			this.animationState.stop();
		}
		const animationName = `0${Math.floor((v - 1) % 6) + 1}`;
		this.dgPaper.animationName = animationName;
		if (v === dataMgr.curLevelIndex) {
			this.dgPaper.timeScale = 1;
			this.animationState = this.dgPaper.playAnimation(animationName, 1);
		} else {
			this.dgPaper.timeScale = 0;
		}
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

	private _locked: boolean;
	public get locked(): boolean {
		return this._locked;
	}
	public set locked(v: boolean) {
		this._locked = v;
		this.spLock.node.active = v;
		this.lblLevelIndex.node.active = !v;
		this.lblLevelTitle.node.active = !v;
	}

	@property(Label)
	lblLevelIndex: Label;
	@property(Label)
	lblLevelTitle: Label;
	@property(Sprite)
	spLock: Sprite;
	@property(Node)
	attachNode: Node;

	@property(dragonBones.ArmatureDisplay)
	dgPaper: dragonBones.ArmatureDisplay;

	onEnable() {
		this.dgPaper.once(
			dragonBones.EventObject.COMPLETE,
			this._playPaperLoop,
			this
		);
	}

	onDisable() {
		this.dgPaper.off(
			dragonBones.EventObject.COMPLETE,
			this._playPaperLoop,
			this
		);
	}

	start() {
		// [3]
		// this.attachNode.angle = -90;
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

	private _playPaperLoop() {
		const animationName = `0${Math.floor((this.level - 1) % 6) + 1}_0`;
		this.dgPaper.playAnimation(animationName, 0);
	}

	onBtnClickToLevel() {
		console.log(`go to level: ${this.level}`);
		if (this.level <= dataMgr.unlockMaxIndex) {
			const animationName = `0${Math.floor((this.level - 1) % 6) + 1}`;
			this.dgPaper.off(
				dragonBones.EventObject.COMPLETE,
				this._playPaperLoop,
				this
			);
			this.dgPaper.playAnimation(animationName, 1);
		}
		winMgr
			.openWin(WIN_ID.KLOTSKI)
			.then((nd: Node) => {
				nd.getComponent(KlotskiView).initProps(this.levelData);
				// this.node.parent.parent.parent.parent.parent.destroy();
				this.node.parent.destroy();
				const mainScript = this.node.parent.parent.getComponent(Main);
				const curIndex = mainScript.curIndex;
				mainScript.node.getChildByName(`dragonBook_${curIndex}`)?.destroy();
				mainScript.dragonBook.node.destroy();
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
