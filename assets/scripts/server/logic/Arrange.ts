/*
 * @Author: zhupengfei
 * @Date: 2021-10-07 17:02:53
 * @LastEditTime: 2021-10-17 15:50:33
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/server/logic/Arrange.ts
 */

import { db, IFood, IGroupType } from '../db/Database';

export class Arrange {
	private _baseSpace: (number | string)[] = [];
	private _curSpace: (number | string)[] = [];
	private _startIndex: number = 0;
	//当前关卡的食物
	private _foods: IFood[] = [];
	private _maxR = 6;
	private _maxC = 6;
	private _minR = 0;
	private _minC = 0;
	private _groups: { [key: string]: IGroupType };
	// 1*2 1*3 2*1 2*2 3*1
	private _groupsMap: Map<string, number[][]> = new Map();
	// 每组的搜索索引数组
	private _groupSearchIdxList: number[] = [];
	private _searchRecord: Map<string, number[]> = new Map();

	constructor(foods: IFood[]) {
		for (let i = this._minR; i < this._maxR; ++i) {
			for (let j = this._minC; j < this._maxC; ++j) {
				this._baseSpace.push(0);
				this._curSpace = this._baseSpace.slice();
			}
		}
		this._foods = foods;
		console.log('this._foods :>> ', this._foods);
		this._groups = db.countGroup();
		this._initGroupList();
	}

	private _initGroupList() {
		for (const key in this._groups) {
			if (Object.prototype.hasOwnProperty.call(this._groups, key)) {
				const list = this._getList(this._groups[key]);
				this._groupsMap.set(key, list);
			}
		}
		console.log('this._groupsMap :>> ', this._groupsMap);
		this._search(0);
	}

	/**
	 * 索引范围断言（范围包含最小值，不包含最大值）
	 * @param index 索引
	 * @param min 最小值
	 * @param max 最大值
	 * @returns 断言是否成立
	 */
	public assert(index: number, min: number, max: number): boolean {
		if (index < min || index >= max) {
			// console.error(`范围错误: ${index}`);
			return true;
		}
		return false;
	}

	/**
	 * 是否已被占用
	 * @param index 索引
	 * @returns true 未占用 false 占用
	 */
	private _isEmpty(index: number) {
		if (this.assert(index, this._minR, this._maxR * this._maxC)) return;
		return this._curSpace[index] === 0;
	}

	/**
	 * 根据索引获取横纵范围
	 * @param index 索引
	 * @returns 横纵范围数组
	 */
	private _getHV(index: number): number[] {
		const v = Math.floor(index / this._maxR);
		const h = index % this._maxC;
		return [h, v];
	}

	public calPossible(index: number = this._startIndex) {
		const lastFood = this._foods[index];
	}

	/**
	 * 当前行的最大索引
	 * @param row 行索引
	 * @returns 返回当前行的最大索引
	 */
	private _getMaxRIndex(row: number): number {
		return (row + 1) * this._maxC;
	}

	/**
	 * 覆盖范围
	 * @param sIndex 开始索引
	 * @param h 横向占地
	 * @param v 纵向占地
	 */
	//TODO:考虑特殊图形，如三角形状
	private _getCoveredIndex(sIndex: number, h: number, v: number): number[] {
		if (this.assert(sIndex, this._minR, this._maxR * this._maxC)) return;
		let hList = [];
		let vList = [];
		for (let i = 0; i < h; ++i) {
			const tmpIdx = sIndex + i;
			const maxRIndex = this._getMaxRIndex(Math.floor(sIndex / this._maxC)); //每行的最大索引
			if (tmpIdx >= maxRIndex) return;
			if (this.assert(tmpIdx, this._minR, this._maxR * this._maxC)) return;
			hList.push(tmpIdx);
		}
		// console.log('ret h:>> ', hList);

		for (let j = 1; j < v; ++j) {
			const tmpIdxList = hList.map((v) => v + j * this._maxC);
			if (
				tmpIdxList.some((v) =>
					this.assert(v, this._minR, this._maxR * this._maxC)
				)
			)
				return;
			// console.log('ret v:>> ', [...tmpIdxList]);
			vList = [...vList, ...tmpIdxList];
		}
		return [...hList, ...vList];
	}

	private _getList(groupType: IGroupType) {
		const { h, v } = groupType;
		let ret = [];
		for (let i = 0; i < this._maxR * this._maxC; ++i) {
			const coveredList = this._getCoveredIndex(i, h, v);
			if (Array.isArray(coveredList)) ret.push(coveredList);
		}
		return ret;
	}

	/**
	 * 根据食物组索引返回食物组
	 * @param groupId 食物组索引
	 * @returns 返回食物组
	 */
	private _getGroupList(groupId: number): number[][] {
		return this._groupsMap.get(`${groupId}`);
	}

	private _search(foodIndex: number, dir: 'forward' | 'backward' = 'forward') {
		if (foodIndex < 0) {
			console.warn(`无合理组合排列`);
			return;
		}
		if (dir === 'backward') {
			const deleteIdxList = this._searchRecord.get(`${foodIndex + 1}`);
			this._searchRecord.delete(`${foodIndex + 1}`);
			deleteIdxList.forEach((v) => this._updateSpace(v, 0));
		}
		const foods = this._foods;
		const len = foods.length;
		if (foodIndex < len) {
			const curFood = foods[foodIndex];
			const groupList = this._getGroupList(curFood.group);
			const searchIdx = this._loopGroupList(foodIndex, groupList, curFood, dir);
			if (searchIdx !== -1) {
				this._groupSearchIdxList.push(searchIdx);
				this._search(foodIndex + 1);
				return;
			}
			this._search(foodIndex - 1, 'backward');
			return;
		}
		console.log(`已找到合理组合排列: ${this._groupSearchIdxList}`);
		console.log('this._searchRecord :>> ', this._searchRecord);
	}

	/**
	 * 获取对应当前食物所在食物组的搜索索引
	 * @param groupList 食物组
	 * @param food 当前食物
	 * @returns 返回搜索索引
	 */
	private _loopGroupList(
		foodIndex: number,
		groupList: number[][],
		food: IFood,
		dir: 'forward' | 'backward'
	): number {
		let schIndex = 0;
		if (dir === 'backward') {
			schIndex = this._groupSearchIdxList.pop();
			if (schIndex) {
				schIndex += 1;
			} else {
				console.warn(`后退到头->错误`);
				return;
			}
		}
		if (this.assert(schIndex, this._minC, this._maxR * this._maxC)) {
			console.log(`继续后退`);
			this._search(foodIndex - 1, 'backward');
			return;
		}

		for (let i = schIndex, len = groupList.length; i < len; ++i) {
			const item = groupList[i];
			if (item.every((v) => this._isEmpty(v))) {
				item.forEach((v) => this._updateSpace(v, food.id));
				this._searchRecord.set(`${foodIndex}`, item);
				return i;
			}
		}
		return -1;
	}

	private _updateSpace(v: number, id: number) {
		this._curSpace[v] = id;
	}

	// 获取关卡数据
	public getLvlData() {
		let ret = [];
		let foodIndex = 0;
		const foods = this._foods;
		while (foodIndex < foods.length) {
			const curFood = foods[foodIndex];
			const groupList = this._getGroupList(curFood.group);
			const searchIdx = this._groupSearchIdxList[foodIndex];
			ret.push({
				id: curFood.id,
				food: curFood,
				idxList: groupList[searchIdx],
			});
			++foodIndex;
		}
		return ret;
		// for (let index = 0; index < this._groupSearchIdxList.length; index++) {
		// 	const id = this._groupSearchIdxList[index];
		// 	const idxList = this._searchRecord.get(`${index}`);
		// 	const food: IFood = this._foods.find((food) => {
		// 		return food.id === id;
		// 	});
		// 	ret.push({ id, food, idxList });
		// }
		// return ret;
	}
}
