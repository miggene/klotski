/*
 * @Author: zhupengfei
 * @Date: 2021-10-07 14:47:42
 * @LastEditTime: 2021-10-11 11:30:22
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/server/db/Database.ts
 */
import { randomRangeInt } from 'cc';
import { dbHelper } from './DbHelper';

export interface IFood {
	id: number;
	name: string;
	h: number;
	v: number;
	isLR: boolean;
	group: number;
}

export interface IGroupType {
	h: number;
	v: number;
}

class Database {
	public levelsClt: any[];
	public foodsClt: any[];

	private static _instance;
	public static get instance(): Database {
		if (!this._instance) this._instance = new Database();
		return this._instance;
	}

	/**
	 * 初始化数据库
	 */
	public async init() {
		try {
			const jsonList = await dbHelper.loadJsonDir();
			this.foodsClt = jsonList.find((val) => val.name === 'foods').json as [];
			this.levelsClt = jsonList.find((val) => val.name === 'levels').json as [];
			console.log('this.foodsClt :>> ', this.foodsClt);
			console.log('this.levelsClt :>> ', this.levelsClt);
		} catch (error) {
			console.log('error :>> ', error);
		}
	}

	/**
	 * 获取关卡数据
	 * @param id 关卡id
	 * @returns 返回对应关卡包括的食物数据
	 */
	public queryLevel(id: number): IFood[] {
		const { group_1, group_2, group_3, group_4, group_5, targetId } =
			this.levelsClt.find((v) => v.id === id);
		const foods_1 = this._getFoods(group_1, 1, targetId);
		const foods_2 = this._getFoods(group_2, 2, targetId);
		const foods_3 = this._getFoods(group_3, 3, targetId);
		const foods_4 = this._getFoods(group_4, 4, targetId);
		const foods_5 = this._getFoods(group_5, 5, targetId);
		const targetFoods = this.foodsClt.filter((v) => v.id === targetId);
		return [
			...foods_1,
			...foods_2,
			...foods_3,
			...foods_4,
			...foods_5,
			...targetFoods,
		];
	}

	/**
	 * 获取对应食物组id的食物数组且不能包含目标食物
	 * @param group 食物所在组的id
	 * @param targetId 目标食物id
	 * @returns 返回食物组数组
	 */
	private _getFoodGroup(group: number, targetId: number): number[] {
		return this.foodsClt.filter((v) => v.group === group && v.id !== targetId);
	}

	/**
	 * 随机获取所在食物组中的一种食物
	 * @param group 食物所有组id
	 * @param targetId 目标食物id
	 * @returns 随机食物
	 */
	private _getFoodRnd(group: number, targetId: number) {
		const foodGroupList = this._getFoodGroup(group, targetId);
		const index = randomRangeInt(0, foodGroupList.length);
		return foodGroupList[index];
	}

	/**
	 * 获取食物数组
	 * @param num 食物数量
	 * @param group 食物所在组id
	 * @param targetId 目标食物id
	 * @returns 返回食物数组
	 */
	private _getFoods(num: number, group: number, targetId: number): any[] {
		let data = [];
		for (let i = 0; i < num; ++i) {
			const food = this._getFoodRnd(group, targetId);
			data.push(food);
		}
		return data;
	}

	/**
	 * 计算食物的总分组数
	 */
	public countGroup(): { [key: string]: IGroupType } {
		const list = this.foodsClt
			.sort((a, b) => a.group - b.group)
			.reduce((acc, cv) => {
				if (!(cv.group in acc)) {
					acc[cv.group] = { h: cv.h, v: cv.v };
				}
				return acc;
			}, {});
		return list;
	}
}

export const db = Database.instance;
