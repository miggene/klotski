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
} from 'cc';

import { winMgr } from './common/mgrs/WinMgr';
import { WIN_ID } from './common/mgrs/WinConfig';
import { dataMgr } from './common/mgrs/DataMgr';
import { ILevelData } from './modules/levelsModule/ILevelsModule';
import { Level_Per_Page } from './modules/levelsModule/ILevelsModuleCfg';
import { resMgr } from './common/mgrs/ResMgr';
import { LevelItem } from './modules/levelsModule/components/LevelItem';

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

	onLoad() {
		winMgr.init();
		resMgr.loadJson(LEVELS_DATA_PATH).then((data: ILevelData[]) => {
			this.levelsData = data;
		});
		this.btnPrev.node.active = false;
		this.btnNext.node.active = false;
	}

	start() {
		this.dragonBook.node.active = true;
		this.dragonBook.playAnimation('usual', 0);

		// winMgr.openWin(WIN_ID.START_MENU);
		// console.log('lodash :>> ', lodash);
		// console.log('Hrd :>> ', Hrd);
		// const hrd = new Hrd.Hrd();
		// hrd.init('BBCCHNOIHAAIJAAKJ@@K');
		// const bloardList = hrd.find();
		// console.log('bloardList :>> ', bloardList);
	}

	onDestroy() {
		winMgr.destroy();
	}

	onBtnClickToLevel() {
		console.log(`go to level`);
		const btnSettingX = this.btnSetting.node.getPosition().x;
		const bntRankX = this.btnRank.node.getPosition().x;
		const btnDinnerX = this.btnDinner.node.getPosition().x;
		tween(this.btnSetting.node)
			.to(0.5, {
				position: v3(
					btnSettingX,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.start();
		tween(this.btnDinner.node)
			.to(0.5, {
				position: v3(
					btnDinnerX,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.start();
		tween(this.btnRank.node)
			.to(0.5, {
				position: v3(
					bntRankX,
					-this.node.getComponent(UITransform).height * 2,
					0
				),
			})
			.call(() => {
				this.dragonBook.playAnimation('open_1', 1);
				this._createBook();
			})
			.start();
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
		const bookNode = instantiate(this.prefBook);
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
			this._refreshLevelIndex(bookNode, this.curIndex, true);
			if (!bAnti) {
				this._refreshLevelIndex(bookNode, this.curIndex, true);
			}
		}
		if (event.animationState.name === 'open_2B') {
			this._refreshLevelIndex(bookNode, this.curIndex, true);
			this.node.getChildByName(`dragonBook_${this.curIndex + 1}`)?.destroy();
		}
	}

	private _playBookNext(index: number, cb: Function) {
		const bookNode = this.node.getChildByName(`dragonBook_${index}`);
		bookNode.setSiblingIndex(FRONT);
		const dragonBook = bookNode.getComponent(dragonBones.ArmatureDisplay);
		dragonBook.once(
			dragonBones.EventObject.COMPLETE,
			(event) => {
				dragonBook.node.destroy();
			},
			this
		);
		const children = bookNode.getChildByName('container').children;
		const len = children.length;
		children.forEach((child, index) => {
			tween(child.getComponent(UIOpacity))
				.to(1, { opacity: 0 })
				.call(() => {
					if (index === len - 1) {
						dragonBook.timeScale = 0.8;
						dragonBook.playAnimation('open_2B', 1);
						cb();
					}
				})
				.start();
		});
	}

	onBtnClickToNext() {
		this._playBookNext(this.curIndex, () => {
			this.curIndex++;
			this._createBook();
		});
	}
	onBtnClickToPrev() {
		this.curIndex--;
		this._createBook(true);
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
