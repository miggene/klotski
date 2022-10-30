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
	sys,
	size,
	view,
	screen,
	director,
} from 'cc';

import { winMgr } from './common/mgrs/WinMgr';

import { dataMgr } from './common/mgrs/DataMgr';
import { ILevelData } from './modules/levelsModule/ILevelsModule';
import { Level_Per_Page } from './modules/levelsModule/ILevelsModuleCfg';
import { resMgr } from './common/mgrs/ResMgr';

import { DragonLevel } from './modules/DragonLevel';
import { database } from './Database';
import { audioMgr, SOUND_CLIPS } from './AudioMgr';

import { WIN_ID, getWinInfo, WIN_ZINDEX } from './common/mgrs/WinConfig';
import WXAuthorize from './common/mgrs/WXAuthorize';

const { ccclass, property } = _decorator;

const LEVELS_DATA_PATH = 'datas/hrd_levels';
const FRONT = 13;
const AFTER = 5;
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

	@property(dragonBones.ArmatureDisplay)
	drgGirl: dragonBones.ArmatureDisplay;

	@property(Node)
	settingView: Node;

	@property(Node)
	bgMask: Node;

	@property(Node)
	blockLayer: Node;

	@property(Node)
	btnStart: Node;

	private _btnAuthorize: any;

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

		if (this.btnNext.node.active) {
			this.btnNext.node.setPosition(this._baseNextPos);
			tween(this.btnNext.node).stop();
			tween(this.btnNext.node)
				.repeatForever(
					tween(this.btnNext.node)
						.to(0.5, {
							position: v3(this._baseNextPos.x + 10, this._baseNextPos.y, 0),
						})
						.to(0.5, {
							position: v3(this._baseNextPos.x, this._baseNextPos.y, 0),
						})
				)
				.start();
		}

		if (this.btnPrev.node.active) {
			this.btnPrev.node.setPosition(this._basePrevPos);
			tween(this.btnPrev.node).stop();
			tween(this.btnPrev.node)
				.repeatForever(
					tween(this.btnPrev.node)
						.to(0.5, {
							position: v3(this._basePrevPos.x - 10, this._basePrevPos.y, 0),
						})
						.to(0.5, {
							position: v3(this._basePrevPos.x, this._basePrevPos.y, 0),
						})
				)
				.start();
		}
	}

	private _srcLeftPos: Vec3;
	private _srcRightPos: Vec3;

	private _srcSettingPos: Vec3;
	private _srcRankPos: Vec3;
	private _srcDinnerPos: Vec3;

	private _animFromSetting = false;

	private _randGrilAnimName: string;

	private _basePrevPos: Vec3;
	private _baseNextPos: Vec3;

	onLoad() {
		if (sys.platform === sys.Platform.WECHAT_GAME) {
			console.log('on load auth');
			this._createAuthorizeBtn(this.btnStart);
		}
		this.blockLayer.active = false;
		// 预加载音频
		const audioSource = this.node.addComponent(AudioSource);
		audioMgr.init(audioSource);
		// audioMgr.playBgMusic();
		winMgr.init();
		dataMgr.init();
		database.init();

		// 预加载部分界面
		resMgr.preloadPrefab(getWinInfo(WIN_ID.KLOTSKI).path);
		resMgr.preloadPrefab(getWinInfo(WIN_ID.OVER).path);
	}

	onEnable() {
		this.dragonBook.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonBookListener,
			this
		);
		this.drgGirl.addEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dgnGirlListener,
			this
		);
	}

	onDisable() {
		this.dragonBook.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dragonBookListener,
			this
		);
		this.drgGirl.removeEventListener(
			dragonBones.EventObject.COMPLETE,
			this._dgnGirlListener,
			this
		);
	}

	async start() {
		// 播放背景音乐
		audioMgr.playBgMusic();
		this.levelsData = (await resMgr.loadJson(LEVELS_DATA_PATH)) as ILevelData[];

		this._basePrevPos = this.btnPrev.node.getPosition().clone();
		this._baseNextPos = this.btnNext.node.getPosition().clone();

		this.curIndex = Math.floor(database.user.curLevel / Level_Per_Page);
		this.btnPrev.node.active = false;
		this.btnNext.node.active = false;

		this._srcLeftPos = this.drgLeft.node.getPosition();
		this._srcRightPos = this.drgRight.node.getPosition();

		this.dragonBook.node.active = true;
		this.dragonBook.playAnimation('appear', 1);
		this.drgGirl.playAnimation('appear', 1);

		this.drgLeft.node.setPosition(
			v3(0, this._srcLeftPos.y, this._srcLeftPos.z)
		);
		this.drgRight.node.setPosition(
			v3(0, this._srcRightPos.y, this._srcRightPos.z)
		);

		this._srcRankPos = this.btnRank.node.getPosition();
		this._srcSettingPos = this.btnSetting.node.getPosition();
		this._srcDinnerPos = this.btnDinner.node.getPosition();

		const { y } = this.drgGirl.node.getPosition();
		this.drgGirl.node.setPosition(35, y);
	}

	private _dragonBookListener(event) {
		if (event.animationState.name === 'appear') {
			if (this._bOpenLevelImmediately) {
				this.onBtnClickToLevel();
			} else {
				this.bgMask.active = false;
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
			this.curIndex = Math.floor(database.user.curLevel / Level_Per_Page);
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
				this.drgLeft.node.active = true;
				this.drgLeft.node.getComponent(UIOpacity).opacity = 255;

				this.drgRight.node.active = true;
				this.drgRight.node.getComponent(UIOpacity).opacity = 255;
				tween(this.drgLeft.node)
					.to(0.5, { position: this._srcLeftPos }, { easing: 'sineOutIn' })
					.start();
				tween(this.drgRight.node)
					.to(1.5, { position: this._srcRightPos }, { easing: 'sineOutIn' })
					.start();
			}
		}
	}

	private _dgnGirlListener(event) {
		if (event.animationState.name === 'appear') {
			this.drgGirl.playAnimation('standby', 0);
		} else if (
			event.animationState.name === 'blink' ||
			event.animationState.name === 'daze'
		) {
			if (this.drgGirl.timeScale === 1) {
				this.drgGirl.timeScale = -1;
				const randTime = Math.floor(Math.random() * 5);
				this.scheduleOnce(() => {
					this.drgGirl.playAnimation(this._randGrilAnimName, 1);
				}, randTime);
			} else {
				this.drgGirl.playAnimation('standby', 0);
			}
		} else if (event.animationState.name === 'shock') {
			const randTime = Math.floor(Math.random() * 5);
			this.scheduleOnce(() => {
				this.drgGirl.playAnimation('shocktostandby', 1);
			}, randTime);
		} else if (event.animationState.name === 'shocktostnadby') {
			this.drgGirl.playAnimation('standby', 0);
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
		this.blockLayer.active = false;
	}

	onBtnClickToLevel() {
		// if (sys.platform === sys.Platform.WECHAT_GAME) {
		// 	let button = wx.createUserInfoButton({
		// 		type: 'text',
		// 		text: '',
		// 		style: {
		// 			left: 10,
		// 			top: 76,
		// 			width: 200,
		// 			height: 40,
		// 			lineHeight: 40,
		// 			// backgroundColor: '#ff0000',
		// 			color: '#ffffff',
		// 			textAlign: 'center',
		// 			fontSize: 16,
		// 			borderRadius: 4,
		// 		},
		// 	});
		// 	button.onTap((res) => {
		// 		console.log(res);
		// 	});
		// }
		// return;

		this.blockLayer.active = true;
		this.btnPrev.node.active = false;
		this.btnNext.node.active = false;

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
		let bookNode = this.node.getChildByName(`dragonBook_${this.curIndex - 1}`);
		if (bookNode == null) {
			bookNode = instantiate(this.prefBook);
			bookNode.name = `dragonBook_${this.curIndex - 1}`;
			this.node.addChild(bookNode);
		}
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

		this.drgLeft.node.active = false;
		this.drgRight.node.active = false;
	}

	public showMain() {
		this._bOpenLevelImmediately = false;
		const centerPos = v3(0, 0, 0);
		this.dragonBook.node.setPosition(centerPos);
		this.dragonBook.playAnimation('appear', 1);
		const { y } = this.drgGirl.node.getPosition();
		this.drgGirl.node.setPosition(35, y + 50);
		this.drgLeft.node.active = true;
		this.drgLeft.playAnimation('usual', 0);
		this.drgRight.node.active = true;
		this.drgRight.playAnimation('usual', 0);
		this.bgMask.active = true;
	}
	public showLevel() {
		this._bOpenLevelImmediately = true;
		const centerPos = v3(0, 0, 0);
		this.dragonBook.node.setPosition(centerPos);
		this.dragonBook.playAnimation('appear', 1);
		const { y } = this.drgGirl.node.getPosition();
		this.drgGirl.node.setPosition(35, y + 50);
	}
	public showLevelToMain() {
		if (
			!WXAuthorize.wxIsAuthorized &&
			sys.platform === sys.Platform.WECHAT_GAME
		) {
			this._btnAuthorize && this._btnAuthorize.show();
		}
		this.btnNext.node.active = false;
		this.btnPrev.node.active = false;

		this.btnNext.node.setSiblingIndex(100);
		this.btnPrev.node.setSiblingIndex(100);
		const levelScript = this.node
			.getChildByName('DragonLevel')
			.getComponent(DragonLevel);
		levelScript.hide(() => {
			this._bOpenLevelImmediately = false;
			this.dragonBook.node.setSiblingIndex(15);
			this.dragonBook.timeScale = -1;
			this.dragonBook.playAnimation('open_1', 1);
			audioMgr.playSound(SOUND_CLIPS.FLIP);
			const centerPos = v3(0, 0, 0);
			this.dragonBook.node.setPosition(centerPos);
			this.btnSetting.node.setSiblingIndex(15 + 1);
		});
	}
	public showSettingToMain() {
		if (
			!WXAuthorize.wxIsAuthorized &&
			sys.platform === sys.Platform.WECHAT_GAME
		) {
			this._btnAuthorize && this._btnAuthorize.show();
		}

		this.dragonBook.timeScale = -1;
		this.dragonBook.playAnimation('open_1', 1);
		audioMgr.playSound(SOUND_CLIPS.FLIP);
		this.scheduleOnce(() => {
			this.dragonBook.node.setSiblingIndex(15);
			this.btnSetting.node.setSiblingIndex(15 + 1);
			tween(this.btnSetting.node)
				.to(0.5, {
					position: v3(this._srcSettingPos.x, this._srcSettingPos.y, 0),
				})
				.start();
		}, 0.3);
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

	public adjustGirl() {
		const { x, y } = this.drgGirl.node.getPosition();
		this.drgGirl.node.setPosition(x, y - 50);
	}

	public showGirlAnimations() {
		const randTime = Math.floor(Math.random() * 5);
		// this.schedule(this._randGirlAnims, 3, macro.REPEAT_FOREVER, 1);
		this.scheduleOnce(this._randGirlAnims, randTime);
	}
	public hideGirlAnimations() {
		this.unschedule(this._randGirlAnims);
	}
	private _randGirlAnims() {
		const rand = Math.floor(Math.random() * 3);
		this._randGrilAnimName = ['blink', 'daze', 'shock'][rand];
		this.drgGirl.timeScale = 1;
		this.drgGirl.playAnimation(this._randGrilAnimName, 1);
	}

	private _createAuthorizeBtn(btnNode: Node) {
		const visibleSize = view.getVisibleSizeInPixel();
		const leftPercent =
			(btnNode.getPosition().x +
				visibleSize.width / 2 -
				btnNode.getComponent(UITransform).width / 2) /
			visibleSize.width;

		const topPercent =
			(visibleSize.height / 2 -
				(btnNode.getPosition().y +
					btnNode.getComponent(UITransform).height / 2)) /
			visibleSize.height;
		const sysWXInfo = wx.getSystemInfoSync();
		const left = leftPercent * sysWXInfo.screenWidth;
		const top = topPercent * sysWXInfo.screenHeight;
		const width =
			(btnNode.getComponent(UITransform).width / visibleSize.width) *
			sysWXInfo.screenWidth;
		const height =
			(btnNode.getComponent(UITransform).height / visibleSize.height) *
			sysWXInfo.screenHeight;

		this._btnAuthorize = wx.createUserInfoButton({
			type: 'text',
			text: '',
			style: {
				left: left,
				top: top,
				width: width,
				height: height,
				lineHeight: 0,
				// backgroundColor: '#ff0000',
				// color: '#ffffff',
				textAlign: 'center',
				fontSize: 16,
				borderRadius: 4,
			},
		});
		this._btnAuthorize.onTap((uinfo) => {
			console.log('onTap uinfo: ', uinfo);
			if (uinfo.userInfo) {
				console.log('wxLogin auth success');
				// wx.showToast({ title: '授权成功' });
				WXAuthorize.wxUserInfo = uinfo.userInfo;
				WXAuthorize.wxIsAuthorized = true;
				this.onBtnClickToLevel();
			} else {
				console.log('wxLogin auth fail');
				WXAuthorize.wxUserInfo = null;
				WXAuthorize.wxIsAuthorized = false;
				this.onBtnClickToLevel();
				// wx.showToast({ title: '授权失败' });
			}
			this._btnAuthorize.hide();
		});
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
