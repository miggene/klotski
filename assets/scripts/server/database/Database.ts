import { utilHelper } from '../../helper/UtilHelper';
import { IFoodModel, ILevelModel } from './IDataModel';

/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 11:43:35
 * @LastEditTime: 2021-10-24 18:05:07
 * @LastEditors: zhupengfei
 * @Description:数据库
 * @FilePath: /klotski/assets/scripts/server/database/Database.ts
 */

const FOODS_PATH = 'datas/foods';
const LEVELS_PATH = 'datas/levels';

class Database {
	private static _instance: Database;
	public static get instance(): Database {
		if (!this._instance) this._instance = new Database();
		return this._instance;
	}
	private _foodDt: IFoodModel[];
	private _levelDt: ILevelModel[];
	public async start(completeCb?: Function): Promise<void> {
		try {
			const [foodDt, levelDt] = await utilHelper.loadJsons([
				FOODS_PATH,
				LEVELS_PATH,
			]);
			this._foodDt = foodDt as IFoodModel[];
			this._levelDt = levelDt as ILevelModel[];
			console.log('this._foodDt :>> ', this._foodDt);
			console.log('this._levelDt :>> ', this._levelDt);
			console.log('database start');
		} catch (error) {
			console.error(error);
		}
	}
	public async queryLvlDt(level: number): Promise<ILevelModel> {
		const lvlDt = this._levelDt.find((v) => v.id === level);
		return new Promise((resolve, reject) => {
			if (lvlDt) {
				return resolve(lvlDt);
			}
			return reject(new Error(`level: ${level} can not find data`));
		});
	}
	public async queryFood(id: number | string): Promise<IFoodModel> {
		try {
			const data = this._foodDt.find((v) => `${v.id}` === id);
			return data;
		} catch (error) {
			console.error(`queryFood error: data not exist`);
		}
	}
}

export const db = Database.instance;
