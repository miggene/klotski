/*
 * @Author: zhupengfei
 * @Date: 2021-09-21 16:04:02
 * @LastEditTime: 2021-09-21 17:37:53
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/grid/GridProperty.ts
 */

// 可拖动的item枚举
export const enum ItemList {
	Beef,
	Bun,
	Corn,
	EggRoll,
	FishBall,
	Fries,
	Sushi,
	Zongzi,
	Icecream,
	Sausage,
}

// grid属性
export interface Property {
	size: number[];
	verticeSize: number;
	offSize: number;
	itemList: ItemList[];
}

// 可拖动的item list
const ITEM_LIST: number[] = [
	ItemList.Beef,
	ItemList.Bun,
	ItemList.Corn,
	ItemList.EggRoll,
	ItemList.FishBall,
	ItemList.Fries,
	ItemList.Sushi,
	ItemList.Zongzi,
	ItemList.Icecream,
	ItemList.Sausage,
];

export default class GridProperty {
	public property: Property;
	constructor(prop?: Property) {
		if (!prop) {
			prop = {
				size: [7, 7],
				verticeSize: 100,
				offSize: 0,
				itemList: ITEM_LIST,
			};
		}
		this.property = prop;
	}

	// 行
	get row(): number {
		return this.property.size[0];
	}
	set row(v: number) {
		this.property.size[0] = v;
	}
	// 列
	get col(): number {
		return this.property.size[1];
	}
	set col(v: number) {
		this.property.size[1] = v;
	}

	// 格子大小
	get verticeSize(): number {
		return this.property.verticeSize;
	}
	set verticeSize(v: number) {
		this.property.verticeSize = v;
	}

	// 间隔大小
	get offSize(): number {
		return this.property.offSize;
	}
	set offSize(v: number) {
		this.property.offSize = v;
	}
}
