/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 16:26:06
 * @LastEditTime: 2021-12-28 11:24:16
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/settingModule/SettingView.ts
 */
import {
	_decorator,
	Component,
	Node,
	Sprite,
	dragonBones,
	SpriteFrame,
	tween,
} from 'cc';
import { audioMgr, SOUND_CLIPS } from '../../AudioMgr';
import { dataMgr } from '../../common/mgrs/DataMgr';
import { WIN_ID } from '../../common/mgrs/WinConfig';
import { winMgr } from '../../common/mgrs/WinMgr';
import { Main } from '../../Main';
const { ccclass, property } = _decorator;

@ccclass('SettingView')
export class SettingView extends Component {
	private _soundOn: number;
	public get soundOn(): number {
		return this._soundOn;
	}
	public set soundOn(v: number) {
		if (this._soundOn !== v) {
			this._soundOn = v;
			dataMgr.soundOn = v;
			this.spSound.spriteFrame = this.spSoundList[v];
			this.dgSound.timeScale = v === 1 ? 4 : -4;
			this.dgSound.playAnimation('newAnimation', 1);
		}
	}

	private _shakeOn: number;
	public get shakeOn(): number {
		return this._shakeOn;
	}
	public set shakeOn(v: number) {
		if (this._shakeOn !== v) {
			this._shakeOn = v;
			dataMgr.shakeOn = v;
			this.dgShake.timeScale = v === 1 ? 4 : -4;
			this.dgShake.playAnimation('newAnimation', 1);
		}
	}

	@property(Sprite)
	spShake: Sprite;

	@property(Sprite)
	spSound: Sprite;

	@property(SpriteFrame)
	spSoundList: SpriteFrame[] = []; //0关，1开

	@property(dragonBones.ArmatureDisplay)
	dgShake: dragonBones.ArmatureDisplay;

	@property(dragonBones.ArmatureDisplay)
	dgSound: dragonBones.ArmatureDisplay;

	start() {
		this.soundOn = dataMgr.soundOn;
		this.shakeOn = dataMgr.shakeOn;
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	onBtnClickToHome() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.node.parent.getComponent(Main).showSettingToMain();
	}

	onBtnClickToShake() {
		audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.shakeOn = 1 ^ this.shakeOn;
		if (this.shakeOn === 1) {
			tween(this.spShake.node)
				.repeat(3, tween().to(0.1, { angle: 20 }).to(0.1, { angle: -20 }))
				.start();
		}
	}
	onBtnClickToSound() {
		!!this.soundOn && audioMgr.playSound(SOUND_CLIPS.DEFAULT_CLICK);
		this.soundOn = 1 ^ this.soundOn;
		if (this.soundOn === 1) {
			audioMgr.playBgMusic();
			return;
		}
		if (this.soundOn !== 1) {
			audioMgr.stopBgMusic();
		}
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
