/*
 * @Author: zhupengfei
 * @Date: 2021-12-04 10:27:19
 * @LastEditTime: 2021-12-27 16:53:40
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import {
	_decorator,
	Component,
	Button,
	tween,
	v3,
	UITransform,
	Node,
	Prefab,
	instantiate,
	dragonBones,
	UIOpacity,
	Vec3,
	Sprite,
	AudioSource,
} from 'cc';

import { winMgr } from './common/mgrs/WinMgr';
import { WIN_ID } from './common/mgrs/WinConfig';
import { dataMgr } from './common/mgrs/DataMgr';
import { ILevelData } from './modules/levelsModule/ILevelsModule';
import { Level_Per_Page } from './modules/levelsModule/ILevelsModuleCfg';
import { resMgr } from './common/mgrs/ResMgr';
import { LevelItem } from './modules/levelsModule/components/LevelItem';
import { DragonLevel } from './modules/DragonLevel';
import { database } from './Database';
import { audioMgr, SOUND_CLIPS } from './AudioMgr';

// import lodash from 'lodash-es';
// import Hrd from 'hrd-solver';
const { ccclass, property } = _decorator;

const LEVELS_DATA_PATH = 'datas/hrd_answers_straight';
const FRONT = 11;
const AFTER = 3;
@ccclass('Main')
export class Main extends Component {
	@property(dragonBones.ArmatureDisplay)
	dragonBook: dragonBones.ArmatureDisplay;

	@property(Prefab)
	prefBook: Prefab;
	@property(Prefab)
	prefLevel: Prefab;

	@property(Button)
	btnSetting: Button;
	@property(Button)
	btnRank: Button;
	@property(Button)
	btnDinner: Button;
	@property(Button)
	btnNext: Button;
	@property(Button)
	btnPrev: Button;

	@property(dragonBones.ArmatureDisplay)
	drgLeft: dragonBones.ArmatureDisplay;
	@property(dragonBones.ArmatureDisplay)
	drgRight: dragonBones.ArmatureDisplay;

	@property(Sprite)
	spCookGirl: Sprite;

	@property(Node)
	settingView: Node;

	private _bOpenLevelImmediately: boolean = false;

	private _lastBook: Node = null;
	private _curBook: Node = null;

	private _levelsData: ILevelData[];
	public get levelsData(): ILevelData[] {
		return this._levelsData;
	}
	public set levelsData(v: ILevelData[]) {
		this._levelsData = v;
	}
	private _curIndex: number = 0;
	public get curIndex(): number {
		return this._curIndex;
	}
	public set curIndex(v: number) {
		this._curIndex = v;
		const maxPages = Math.floor(this.levelsData.length / Level_Per_Page);
		this._curIndex = Math.min(v, maxPages);
		this._curIndex = Math.max(v, 0);
		this.btnNext.node.active = this._curIndex !== maxPages;
		this.btnPrev.node.active = this._curIndex !== 0;

		this.btnNext.node.setSiblingIndex(100);
		this.btnPrev.node.setSiblingIndex(100);
	}

	private _srcLeftPos: Vec3;
	private _srcRightPos: Vec3;

	private _srcSettingPos: Vec3;
	private _srcRankPos: Vec3;
	private _srcDinnerPos: Vec3;

	private _srcCookGirlPos: Vec3;
	private _animFromSetting = false;

	onLoad() {
		// audioMgr.init(this.node.getComponent(AudioSource));
		const audioSource = this.node.addComponent(AudioSource);
		audioMgr.init(audioSource);
		audioMgr.playBgMusic();
		winMgr.init();
		dataMgr.init();
		database.init();
		resMgr.loadJson(LEVELS_DATA_PATH).then((data: ILevelData[]) => {
			this.levelsData = data;
		});
		this.btnPrev.node.active = false;
		this.btnNext.node.active = false;
		this._srcLeftPos = this.drgLeft.node.getPosition();
		this._srcRightPos = this.drgRight.node.getPosition();

		tween(this.drgLeft.node)
			.to(0, { position: v3(0, this._srcLeftPos.y, this._srcLeftPos.z) })
			.start();
		tween(this.drgRight.node)
			.to(0, { position: v3(0, this._srcRightPos.y, this._srcRightPos.z) })
			.start();

		this._srcRankPos = this.btnRank.node.getPosition();
		this._srcSettingPos = this.btnSetting.node.getPosition();
		this._srcDinnerPos = this.btnDinner.node.getPosition();
		this._srcCookGirlPos = this.spCookGirl.node.getPosition();
	}

	onEnable() {
		this.dragonBook.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonBookListener,
			this
		);
	}

	onDisable() {
		this.dragonBook.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonBookListener,
			this
		);
	}

	start() {
		this.dragonBook.node.active = true;
		this.dragonBook.playAnimation('appear', 1);
	}

	private _dragonBookListener(event) {
		if (event.animationState.name === 'appear') {
			if (this._bOpenLevelImmediately) {
				this.onBtnClickToLevel();
			} else {
				this.dragonBook.playAnimation('usual', 0);
				tween(this.btnSetting.node)
					.to(0.5, { position: this._srcSettingPos }, { easing: 'sineInOut' })
					.start();
				tween(this.btnSetting.node.getComponent(UIOpacity))
					.to(0.5, { opacity: 255 }, { easing: 'sineOutIn' })
					.start();
				this.drgLeft.node.getComponent(UIOpacity).opacity = 255;
				tween(this.drgLeft.node)
					.to(0.5, {
						position: v3(
							this._srcLeftPos.x,
							this._srcLeftPos.y,
							this._srcLeftPos.z
						),
					})
					.start();
				this.drgRight.node.getComponent(UIOpacity).opacity = 255;
				tween(this.drgRight.node)
					.to(1.5, {
						position: v3(
							this._srcRightPos.x,
							this._srcRightPos.y,
							this._srcRightPos.z
						),
					})
					.start();
			}

			return;
		}
		if (event.animationState.name === 'open_1') {
			if (this._animFromSetting) {
				this.btnNext.node.active = false;
				this.btnPrev.node.active = false;

				this.btnNext.node.setSiblingIndex(100);
				this.btnPrev.node.setSiblingIndex(100);
				if (this.dragonBook.timeScale === -1) {
					this.dragonBook.timeScale = 1;
					this.dragonBook.playAnimation('usual', 0);
					this.settingView.active = false;
					this._animFromSetting = false;
				}
				return;
			}
			this.curIndex = 0;
			if (this.dragonBook.timeScale === -1) {
				this.btnNext.node.active = false;
				this.btnPrev.node.active = false;

				this.btnNext.node.setSiblingIndex(100);
				this.btnPrev.node.setSiblingIndex(100);
				this.dragonBook.timeScale = 1;
				this.dragonBook.playAnimation('usual', 0);
				this.node.getChildByName('DragonLevel')?.destroy();
				tween(this.btnSetting.node)
					.to(0.5, {
						position: this._srcSettingPos,
					})
					.start();
				tween(this.btnDinner.node)
					.to(0.5, {
						position: this._srcDinnerPos,
					})
					.start();
				tween(this.btnRank.node)
					.to(0.5, {
						position: this._srcRankPos,
					})
					.start();
				this.drgLeft.node.getComponent(UIOpacity).opacity = 255;
				this.drgRight.node.getComponent(UIOpacity).opacity = 255;
				tween(this.drgLeft.node)
					.to(0.5, { position: this._srcLeftPos }, { easing: 'sineOutIn' })
					.start();
				tween(this.drgRight.node)
					.to(1.5, { position: this._srcRightPos }, { easing: 'sineOutIn' })
					.start();
				// tween(this.spCookGirl.node)
				// 	.to(0.5, {
				// 		position: this._srcCookGirlPos,
				// 	})
				// 	.start();
			}
		}
	}

	onDestroy() {
		winMgr.destroy();
	}

	private _createDragonLevel() {
		const [start, end] = [0, 1].map(
			(v) => (v + this.curIndex) * Level_Per_Page
		);
		const list = this.levelsData.slice(start, end);
		const name = 'DragonLevel';
		let levelNode = this.node.getChildByName(name);
		if (!levelNode) {
			levelNode = instantiate(this.prefLevel);
			levelNode.name = name;
			this.node.addChild(levelNode);
		}
		levelNode.getComponent(DragonLevel).show(this.curIndex, list);
	}

	onBtnClickToLevel() {
		console.log(`go to level`);
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.drgLeft.node.getComponent(UIOpacity).opacity = 0;
		this.drgRight.node.getComponent(UIOpacity).opacity = 0;
		tween(this.drgLeft.node)
			.to(0.5, { position: v3(0, this._srcLeftPos.y, this._srcLeftPos.z) })
			.start();
		tween(this.drgRight.node)
			.to(0.5, { position: v3(0, this._srcRightPos.y, this._srcRightPos.z) })
			.start();

		tween(this.btnSetting.node)
			.to(0.5, {
				position: v3(
					this._srcSettingPos.x,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.start();
		tween(this.btnDinner.node)
			.to(0.5, {
				position: v3(
					this._srcDinnerPos.x,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.start();
		tween(this.btnRank.node)
			.to(0.5, {
				position: v3(
					this._srcRankPos.x,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.call(() => {
				this.dragonBook.playAnimation('open_1', 1);
				audioMgr.playSound(SOUND_CLIPS.FLIP);
				this._createBook();
			})
			.start();

		// tween(this.spCookGirl.node)
		// 	.to(0.5, {
		// 		position: v3(this._srcCookGirlPos.x, 2000, this._srcCookGirlPos.z),
		// 	})
		// 	.start();
	}

	private _refreshLevelIndex(book: Node, index: number, delateShow: boolean) {
		this.curIndex = index;
		const [start, end] = [0, 1].map((v) => (v + index) * Level_Per_Page);
		const list = this.levelsData.slice(start, end);
		const container = book.getChildByName('container');
		for (let i = 0; i < list.length; ++i) {
			const levelItemNode = container.getChildByName(`LevelItem${i}`);
			if (delateShow) {
				tween(levelItemNode.getComponent(UIOpacity))
					.to(2, { opacity: 255 })
					.start();
			}
			levelItemNode.active = true;
			levelItemNode!.getComponent(LevelItem).initProps(list[i]);
		}
	}

	private _createBook(bAnti: boolean = false) {
		const name = `dragonBook_${this.curIndex}`;
		let bookNode = this.node.getChildByName(name);
		bookNode = bookNode ? bookNode : instantiate(this.prefBook);
		bookNode.name = name;
		this.node.addChild(bookNode);
		bookNode.setSiblingIndex(bAnti ? FRONT : AFTER);
		const dragonBook = bookNode.getComponent(dragonBones.ArmatureDisplay);
		const timeScale = bAnti ? -0.8 : 0.8;
		const animationName = bAnti ? 'open_2B' : 'open_2B_0';
		dragonBook.timeScale = timeScale;
		dragonBook.animationName = animationName;
		dragonBook.once(
			dragonBones.EventObject.COMPLETE,
			this._showLevels.bind(this, bAnti, bookNode),
			this
		);
		dragonBook.playAnimation(animationName, 1);
	}

	private _showLevels(bAnti: boolean, bookNode: Node, event: any) {
		if (event.animationState.name === 'open_2B_0') {
			this._createDragonLevel();
		}
		if (event.animationState.name === 'open_2B') {
			this.node.getChildByName(`dragonBook_${this.curIndex + 1}`)?.destroy();
			this._createDragonLevel();
		}
	}

	private _playBookNext(cb?: Function) {
		const bookNode = this.node.getChildByName(
			`dragonBook_${this.curIndex - 1}`
		);
		bookNode.setSiblingIndex(FRONT);
		const dragonBook = bookNode.getComponent(dragonBones.ArmatureDisplay);
		dragonBook.once(
			dragonBones.EventObject.COMPLETE,
			(event) => {
				dragonBook.node.destroy();
			},
			this
		);
		dragonBook.timeScale = 0.8;
		dragonBook.playAnimation('open_2B', 1);
	}

	onBtnClickToNext() {
		// audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		audioMgr.playSound(SOUND_CLIPS.FLIP);
		this.curIndex++;
		const levelScript = this.node
			.getChildByName('DragonLevel')
			.getComponent(DragonLevel);
		levelScript.hide(() => {
			this._playBookNext();
			this._createBook();
		});
	}
	onBtnClickToPrev() {
		// audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		audioMgr.playSound(SOUND_CLIPS.FLIP);
		this.curIndex--;
		const levelScript = this.node
			.getChildByName('DragonLevel')
			.getComponent(DragonLevel);
		levelScript.hide(() => {
			this._createBook(true);
		});
	}

	public hideMain() {
		this.node.getChildByName(`dragonBook_${this.curIndex}`)?.destroy();
		const leftPos = this.dragonBook.node.getPosition().subtract(v3(1000, 0, 0));
		tween(this.dragonBook.node).to(1, { position: leftPos }).start();
		this.btnNext.node.active = false;
		this.btnPrev.node.active = false;
	}

	public showMain() {
		this._bOpenLevelImmediately = false;
		const centerPos = v3(0, 0, 0);
		this.dragonBook.node.setPosition(centerPos);
		this.dragonBook.playAnimation('appear', 1);
	}
	public showLevel() {
		this._bOpenLevelImmediately = true;
		const centerPos = v3(0, 0, 0);
		this.dragonBook.node.setPosition(centerPos);
		this.dragonBook.playAnimation('appear', 1);
	}
	public showLevelToMain() {
		this.btnNext.node.active = false;
		this.btnPrev.node.active = false;

		this.btnNext.node.setSiblingIndex(100);
		this.btnPrev.node.setSiblingIndex(100);
		const levelScript = this.node
			.getChildByName('DragonLevel')
			.getComponent(DragonLevel);
		levelScript.hide(() => {
			this._bOpenLevelImmediately = false;
			this.dragonBook.timeScale = -1;
			this.dragonBook.playAnimation('open_1', 1);
			audioMgr.playSound(SOUND_CLIPS.FLIP);
			const centerPos = v3(0, 0, 0);
			this.dragonBook.node.setPosition(centerPos);
		});
	}
	public showSettingToMain() {
		this.dragonBook.timeScale = -1;
		this.dragonBook.playAnimation('open_1', 1);
		audioMgr.playSound(SOUND_CLIPS.FLIP);
	}

	onBtnClickToSetting() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this._animFromSetting = true;
		tween(this.btnSetting.node)
			.to(0.5, {
				position: v3(
					this._srcSettingPos.x,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.start();
		this.settingView.active = true;
		this.dragonBook.playAnimation('open_1', 1);
		audioMgr.playSound(SOUND_CLIPS.FLIP);
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
