import { ILevelData } from '../../modules/levelsModule/ILevelsModule';
// import Projectrc from '../config/Projectrc';
import { string2Number } from '../utils/Helper';
import { resMgr } from './ResMgr';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 16:43:11
 * @LastEditTime: 2021-12-28 16:08:06
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/common/mgrs/DataMgr.ts
 */

// const LEVELS_DATA_PATH = 'datas/hrd_answers_straight';
const LEVELS_DATA_PATH = 'datas/hrd_levels';

const UNLOCK_MAX_INDEX = 'unlockMaxIndex';
// const CURRENT_LEVEL_INDEX = 'curLevelIndex';
export const APP = 'hrd';
const SHAKE_ON = APP + '_shakeOn';
const SOUND_ON = APP + '_soundOn';
const BEST_TIME_PREFIX = APP + '_bestTime_level_';
class DataMgr {
	constructor(
		private _curLevelIndex: number,
		private _unlockMaxIndex: number,
		private _shakeOn = 0,
		private _soundOn = 1
	) {}

	private static _instance: DataMgr;
	public static get instance() {
		if (!this._instance) this._instance = new DataMgr(1, 1);
		return this._instance;
	}

	private _levelsDataCache: ILevelData[];
	public get levelsDataCache(): ILevelData[] {
		return this._levelsDataCache;
	}
	private set levelsDataCache(v: ILevelData[]) {
		this._levelsDataCache = v;
	}

	//当前选中关卡
	// private _curLevelIndex: number;
	public get curLevelIndex(): number {
		return this._curLevelIndex;
	}
	public set curLevelIndex(v: number) {
		this._curLevelIndex = v;
	}

	// 当前已解琐的最大关卡;
	// private _unlockMaxIndex: number;
	// public get unlockMaxIndex(): number {
	// 	return this._unlockMaxIndex;
	// }
	// public set unlockMaxIndex(v: number) {
	// 	this._unlockMaxIndex = v;
	// 	this.setLS(UNLOCK_MAX_INDEX, JSON.stringify(v));
	// }

	// 震动开头;
	public get shakeOn(): number {
		return this._shakeOn;
	}
	public set shakeOn(v: number) {
		this._shakeOn = v;
		// this.setLS(SHAKE_ON, JSON.stringify(v));
		localStorage.setItem(SHAKE_ON, JSON.stringify(v));
	}

	//音乐音效开关

	public get soundOn(): number {
		return this._soundOn;
	}
	public set soundOn(v: number) {
		this._soundOn = v;
		// this.setLS(SOUND_ON, JSON.stringify(v));
		localStorage.setItem(SOUND_ON, JSON.stringify(v));
	}

	public async init() {
		resMgr
			.loadJson(LEVELS_DATA_PATH)
			.then((data: ILevelData[]) => {
				this.levelsDataCache = data;
			})
			.catch((err) => console.error(err));
		// try {
		// 	// this.curLevelIndex = string2Number(
		// 	// 	this.getLS(CURRENT_LEVEL_INDEX, JSON.stringify(this._curLevelIndex))
		// 	// );
		// 	this.unlockMaxIndex = string2Number(
		// 		this.getLS(UNLOCK_MAX_INDEX, JSON.stringify(this._unlockMaxIndex))
		// 	);
		// 	this.curLevelIndex = this.unlockMaxIndex;
		// 	this.shakeOn = string2Number(
		// 		this.getLS(SHAKE_ON, JSON.stringify(this._shakeOn))
		// 	);
		// 	this.soundOn = string2Number(
		// 		this.getLS(SOUND_ON, JSON.stringify(this._soundOn))
		// 	);
		// } catch (error) {
		// 	console.error(error);
		// }

		// this.shakeOn = string2Number(
		// this.getLS(SHAKE_ON, JSON.stringify(this._shakeOn))
		// );
		// this.soundOn = string2Number(
		// this.getLS(SOUND_ON, JSON.stringify(this._soundOn))
		// );
		const shakeOn = localStorage.getItem(SHAKE_ON);
		if (shakeOn) {
			this.shakeOn = parseInt(JSON.parse(shakeOn), 10);
		} else {
			this.shakeOn = 0;
		}

		const soundOn = localStorage.getItem(SOUND_ON);
		if (soundOn) {
			this.soundOn = parseInt(JSON.parse(soundOn), 10);
		} else {
			this.soundOn = 1;
		}
	}

	public async getlevelsDataCache() {
		if (!this.levelsDataCache) {
			await this.init();
			return this.levelsDataCache;
		}
		return this.levelsDataCache;
	}

	// public getLS(key: string, df: string): string {
	// 	const prefixKey = PREFIX_LS + key;
	// 	let ls = localStorage.getItem(prefixKey);
	// 	if (ls === null) {
	// 		ls = df;
	// 		localStorage.setItem(prefixKey, df);
	// 	}
	// 	return ls;
	// }

	// public setLS(key: string, value: string) {
	// 	const prefixKey = PREFIX_LS + key;
	// 	localStorage.setItem(prefixKey, value);
	// }

	public getLastBestTimeByLevel(
		level: number,
		defaultBestTime = `${24 * 3600}`
	) {
		const bestTime = localStorage.getItem(`${BEST_TIME_PREFIX}${level}`);
		if (bestTime === null || bestTime === undefined) {
			localStorage.setItem(`${BEST_TIME_PREFIX}${level}`, defaultBestTime);
			return parseInt(defaultBestTime, 10);
		}
		return parseInt(bestTime, 10);

		// const curTime = parseInt(defaultBestTime, 10);
		// const curBestTime = Math.min(lastBestTime, curTime);
		// localStorage.setItem(`${BEST_TIME_PREFIX}${level}`, `${curBestTime}`);
		// return `${curBestTime}`;
	}

	public setBestTimeByLevel(level: number, bestTime: number) {
		localStorage.setItem(`${BEST_TIME_PREFIX}${level}`, `${bestTime}`);
	}
}

export const dataMgr = DataMgr.instance;
