import { project } from './common/config/Projectrc';

const UserSchema = {
	curLevel: 0,
	maxUnlockLevel: 0,
	projectKey: 'hrd_user_schema',
};

// const UserSettingSchema = {
// 	soundOn: 1,
// 	shakeOn: 1,
// 	projectKey: 'hrd_user_setting_schema',
// };

class Database {
	// public user: UserSchema;
	public user: { [key: string]: any };

	constructor() {
		this.user = JSON.parse(JSON.stringify(UserSchema));
		// this.userSetting = JSON.parse(JSON.stringify(UserSettingSchema));
	}
	private static _instance: Database;
	public static get instance(): Database {
		if (!this._instance) this._instance = new Database();
		return this._instance;
	}

	public init() {
		this.initLocalStorage(this.user);
	}

	public initLocalStorage(initValue: { [key: string]: any }) {
		console.log('initValue :>> ', initValue);
		const projectKey = initValue.projectKey;
		const ls = localStorage.getItem(projectKey);
		console.log('ls :>> ', ls);
		if (ls) {
			const parseObj = JSON.parse(ls);
			this.user = parseObj;
		} else {
			localStorage.setItem(projectKey, JSON.stringify(initValue));
		}
	}

	public setState(state: { [key: string]: any }) {
		for (const key in state) {
			if (Object.prototype.hasOwnProperty.call(state, key)) {
				const element = state[key];
				if (key in this.user) {
					this.user[key] = element;
				}
				// if (!this[key] || this[key] !== element) {
				// 	this[key] = element;
				// }
			}
		}
		localStorage.setItem(this.user.projectKey, JSON.stringify(this.user));
	}
}

export const database = Database.instance;
