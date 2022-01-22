/*
 * @Author: zhupengfei
 * @Date: 2021-12-04 10:27:19
 * @LastEditTime: 2021-12-27 16:53:40
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/Main.ts
 */
import { _decorator, Component } from 'cc';

import { winMgr } from './common/mgrs/WinMgr';
import { WIN_ID } from './common/mgrs/WinConfig';
import { dataMgr } from './common/mgrs/DataMgr';
const { ccclass, property } = _decorator;

import HrdLib from '../scripts/hrd.bundle.js';
@ccclass('Main')
export class Main extends Component {
	onLoad() {
		winMgr.init();
		dataMgr.init();
	}

	start() {
		winMgr.openWin(WIN_ID.START_MENU);
		// const hrd = new HrdLib.default();
		// hrd.init('BBCCHNOIHAAIJAAKJ@@K');
		// const bloardList = hrd.find();
		// console.log('bloardList :>> ', bloardList);
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
