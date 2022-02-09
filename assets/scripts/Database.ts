import { project } from './common/config/Projectrc';

type State = { [key: string]: any };

class Schema {
	constructor(public key: string) {}
	public get projectKey(): string {
		return `${project.name}_${this.key}`;
	}
	public setState(state: State) {
		for (const key in state) {
			if (Object.prototype.hasOwnProperty.call(state, key)) {
				const element = state[key];
				if (!this[key] || this[key] !== element) {
					this[key] = element;
				}
			}
		}
		localStorage.setItem(this.projectKey, JSON.stringify(this));
	}
}

class UserSchema extends Schema {
	curLevel: number = 0;
	maxUnlockLevel: number = 0;
}

class UserSettingSchema extends Schema {
	soundOn: number = 1;
	shakeOn: number = 1;
}

class Database {
	// public user: UserSchema;
	private _user: UserSchema;
	public get user(): UserSchema {
		return this._user;
	}
	public set user(v: UserSchema) {
		this._user = v;
	}
	public userSetting: UserSettingSchema;

	constructor() {
		this.user = new UserSchema('user');
		this.userSetting = new UserSettingSchema('userSetting');
	}
	private static _instance: Database;
	public static get instance(): Database {
		if (!this._instance) this._instance = new Database();
		return this._instance;
	}

	public init() {
		this.initLocalStorage(this.user);
		this.initLocalStorage(this.userSetting);
	}

	public initLocalStorage<T extends Schema>(initValue: T) {
		const projectKey = initValue.projectKey;
		const ls = localStorage.getItem(projectKey);
		if (ls !== null) {
			const parseObj = JSON.parse(ls);
			for (const key in parseObj) {
				if (Object.prototype.hasOwnProperty.call(parseObj, key)) {
					const element = parseObj[key];
					initValue[key] = element;
				}
			}
		} else {
			localStorage.setItem(projectKey, JSON.stringify(initValue));
		}
	}
}

export const database = Database.instance;
