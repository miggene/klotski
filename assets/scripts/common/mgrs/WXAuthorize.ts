export interface IWXUserInfo {
	nickName: string;
	avatarUrl: string;
	gender: number; // 0未知，1男性，2女性
	country: string;
	province: string;
	city: string;
	language: string;
}

export default class WXAuthorize {
	public static wxUserInfo: IWXUserInfo = null;
	public static wxIsAuthorized: boolean = false;
}
