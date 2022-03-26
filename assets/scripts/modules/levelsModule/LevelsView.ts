/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 16:53:46
 * @LastEditTime: 2021-12-27 17:05:11
 * @LastEditors: zhupengfei
 * @Description: 关卡选择窗口
 * @FilePath: /klotski/assets/scripts/modules/levelsModule/LevelsView.ts
 */
import {
	_decorator,
	Component,
	Node,
	ScrollView,
	Prefab,
	instantiate,
	Button,
} from 'cc';
import { resMgr } from '../../common/mgrs/ResMgr';
import { LevelItem } from './components/LevelItem';
import { ILevelData } from './ILevelsModule';
import { Level_Per_Page } from './ILevelsModuleCfg';
import { winMgr } from '../../common/mgrs/WinMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { dataMgr } from '../../common/mgrs/DataMgr';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = LevelsView
 * DateTime = Sun Dec 12 2021 16:53:46 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = LevelsView.ts
 * FileBasenameNoExtension = LevelsView
 * URL = db://assets/scripts/modules/levelModule/LevelsView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('LevelsView')
export class LevelsView extends Component {
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
	}

	private _levelsData: ILevelData[];
	public get levelsData(): ILevelData[] {
		return this._levelsData;
	}
	public set levelsData(v: ILevelData[]) {
		this._levelsData = v;
	}

	@property(ScrollView)
	scrollView: ScrollView;
	@property(Button)
	btnNext: Button;
	@property(Button)
	btnPrev: Button;

	start() {
		dataMgr
			.getlevelsDataCache()
			.then((data) => {
				this.levelsData = data;
				this._loadLevels(this.curIndex);
			})
			.catch((err) => console.error(err));
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	// index:0 开始第一页
	private _loadLevels(index: number) {
		this.scrollView.content.destroyAllChildren();
		const [start, end] = [0, 1].map((v) => (v + index) * Level_Per_Page);
		const list = this.levelsData.slice(start, end);
		console.log('list :>> ', list);

		for (const iter of list) {
			resMgr.loadPrefab('prefabs/LevelItemPrefab').then((prefab: Prefab) => {
				const ndItem = instantiate(prefab);
				this.scrollView.content.addChild(ndItem);
				ndItem.setSiblingIndex(iter.level);
				ndItem.getComponent(LevelItem).initProps(iter);
			});
		}
	}

	onBtnClickToNext() {
		this.curIndex++;
		this._loadLevels(this.curIndex);
	}
	onBtnClickToPrev() {
		this.curIndex--;
		this._loadLevels(this.curIndex);
	}
	onBtnClickToHome() {
		this.node.destroy();
		// winMgr.openWin(WIN_ID.START_MENU);
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
