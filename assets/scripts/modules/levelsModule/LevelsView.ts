/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 16:53:46
 * @LastEditTime: 2021-12-18 11:20:19
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
} from 'cc';
import { resMgr } from '../../common/mgrs/ResMgr';
import { LevelItem } from '../../components/LevelItem';
import { Block } from '../../libs/Klotski';
import { ILevelData } from './ILevelsModule';
import { Levels_Data_Path } from './ILevelsModuleCfg';
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
	@property(ScrollView)
	scrollView: ScrollView;

	start() {
		resMgr
			.loadJson(Levels_Data_Path)
			.then((data: ILevelData[]) => {
				console.log('data :>> ', data);
				this._loadLevels(data);
			})
			.catch((err) => console.error(err));
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	private _loadLevels(list: ILevelData[]) {
		for (const iter of list) {
			resMgr.loadPrefab('prefabs/LevelItemPrefab').then((prefab: Prefab) => {
				const ndItem = instantiate(prefab);
				this.scrollView.content.addChild(ndItem);
				ndItem.setSiblingIndex(iter.level);
				ndItem.getComponent(LevelItem).initProps(iter);
			});
		}
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
