import { ILevelData } from '../../modules/levelsModule/ILevelsModule';
import Projectrc from '../config/Projectrc';
import { string2Number } from '../utils/Helper';
import { resMgr } from './ResMgr';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-27 16:43:11
 * @LastEditTime: 2021-12-27 18:05:42
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/common/mgrs/DataMgr.ts
 */
const DELIMITER = '_';
const LEVELS_DATA_PATH = 'datas/hrd_answers_straight';
const PREFIX_LS = `${Projectrc.projectName}${DELIMITER}`;

class DataMgr {
	constructor(
		private _curLevelIndex: number,
		private _unlockMaxIndex: number
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

	//当前已解琐的最大关卡
	// private _unlockMaxIndex: number;
	public get unlockMaxIndex(): number {
		return this._unlockMaxIndex;
	}
	public set unlockMaxIndex(v: number) {
		this._unlockMaxIndex = v;
	}

	public async init() {
		resMgr
			.loadJson(LEVELS_DATA_PATH)
			.then((data: ILevelData[]) => {
				this.levelsDataCache = data;
			})
			.catch((err) => console.error(err));
		try {
			this.curLevelIndex = string2Number(
				this.getLS('curLevelIndex', JSON.stringify(this._curLevelIndex))
			);
			this.unlockMaxIndex = string2Number(
				this.getLS('unlockMaxIndex', JSON.stringify(this._unlockMaxIndex))
			);
		} catch (error) {
			console.error(error);
		}
	}

	public async getlevelsDataCache() {
		if (!this.levelsDataCache) {
			await this.init();
		}
		return this.levelsDataCache;
	}

	public getLS(key: string, df: string): string {
		const prefixKey = PREFIX_LS + key;
		let ls = localStorage.getItem(prefixKey);
		if (ls === null) {
			ls = df;
			localStorage.setItem(prefixKey, df);
		}
		return ls;
	}

	public setLS(key: string, value: string) {
		const prefixKey = PREFIX_LS + key;
		localStorage.setItem(prefixKey, value);
	}
}

export const dataMgr = DataMgr.instance;
