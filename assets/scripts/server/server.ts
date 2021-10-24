import { db, IFood } from './db/Database';
import { Arrange } from './logic/Arrange';

/*
 * @Author: zhupengfei
 * @Date: 2021-10-11 11:24:55
 * @LastEditTime: 2021-10-17 14:40:55
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/server/server.ts
 */
class Server {
	private static _instance: Server;
	public static get instance() {
		if (!this._instance) this._instance = new Server();
		return this._instance;
	}
	public arrange: Arrange = null;

	public async init() {
		await db.init();
		this.initArrange();
	}

	public initArrange() {
		const levelData = db.queryLevel(15);
		console.log('levelData :>> ', levelData);
		this.arrange = new Arrange(levelData);
	}

	public requestLvlData(): {
		id: number;
		food: IFood;
		idxList: number[];
	}[] {
		return this.arrange.getLvlData();
	}
}

export const server = Server.instance;
