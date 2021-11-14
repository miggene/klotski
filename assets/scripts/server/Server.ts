import { db } from './database/Database';
import { IFoodModel, ILevelModel } from './database/IDataModel';

/*
 * @Author: zhupengfei
 * @Date: 2021-10-24 11:39:07
 * @LastEditTime: 2021-11-07 15:04:29
 * @LastEditors: zhupengfei
 * @Description: 服务端启动脚本
 * @FilePath: /klotski/assets/scripts/server/Server.ts
 */
class Server {
	private static _instance: Server;
	public static get instance(): Server {
		if (!this._instance) this._instance = new Server();
		return this._instance;
	}
	public async start(completeCb?: Function) {
		try {
			await db.start();
			console.log('server start');
			if (completeCb) completeCb();
		} catch (error) {
			console.error(error);
		}
	}

	public reqLvlDt(level: number): ILevelModel {
		return db.queryLvlDt(level);
	}

	// public async reqFood(id: number | string): Promise<IFoodModel> {
	// 	try {
	// 		const data = await db.queryFood(id);
	// 		return data;
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// }
	public reqFood(id: number | string): IFoodModel {
		return db.queryFood(id);
		// try {
		// 	const data = await db.queryFood(id);
		// 	return data;
		// } catch (error) {
		// 	console.error(error);
		// }
	}
}

export const server = Server.instance;
