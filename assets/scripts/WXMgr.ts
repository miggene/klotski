export default class WXMgr {
	private static _instance: WXMgr;
	public static get instance() {
		if (!this._instance) {
			this._instance = new WXMgr();
		}
		return this._instance;
	}

	canUseRewardAd: boolean;
	rewardAd: wx.RewardedVideoAd;
	constructor() {
		this.canUseRewardAd = false;
		this.rewardAd = null;
	}
}
