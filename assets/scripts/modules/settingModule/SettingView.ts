/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 16:26:06
 * @LastEditTime: 2021-12-27 16:31:17
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/settingModule/SettingView.ts
 */
import { _decorator, Component, Node } from 'cc';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SettingView
 * DateTime = Mon Dec 27 2021 16:26:06 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = SettingView.ts
 * FileBasenameNoExtension = SettingView
 * URL = db://assets/scripts/modules/settingModule/SettingView.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SettingView')
export class SettingView extends Component {
	// [1]
	// dummy = '';

	// [2]
	// @property
	// serializableDummy = 0;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	onBtnClickToHome() {
		winMgr.openWin(WIN_ID.START_MENU);
		this.node.destroy();
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
