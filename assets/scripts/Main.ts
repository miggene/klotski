/*
 * @Author: zhupengfei
 * @Date: 2021-12-04 10:27:19
 * @LastEditTime: 2021-12-12 11:46:30
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import { _decorator, Component } from 'cc';

import { winMgr } from './common/mgrs/WinMgr';
import { WIN_ID } from './common/mgrs/WinConfig';
const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {
	onLoad() {
		winMgr.init();
	}

	start() {
		winMgr.openWin(WIN_ID.START_MENU);
	}

	onDestroy() {
		winMgr.destroy();
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
