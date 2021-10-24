/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 16:02:02
 * @LastEditTime: 2021-10-24 18:20:42
 * @LastEditors: zhupengfei
 * @Description:数据库的数据结构
 * @FilePath: /klotski/assets/scripts/server/database/IDataModel.ts
 */

export interface IFoodModel {
	id: number;
	name: string;
	range: string;
	direction: number; //0:none,1:vertical,2:horizonal,3:all
	idx?: number; // 在一维数组中的索引
}

export interface ILevelModel {
	id: number;
	startList: string;
	targetId: number;
}
