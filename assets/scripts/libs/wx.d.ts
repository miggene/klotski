declare module wx {
	// 功能描述
	// 显示当前页面的转发按钮
	export function showShareMenu(param: {
		withShareTicket: boolean;
		menus: string[]; //['shareAppMessage','shareTimeline'],
		success: (res: any) => void;
		fail: (res: any) => void;
		complete: (res: any) => void;
	}): void;

	// 功能描述
	// 监听用户点击右上角菜单的「分享到朋友圈」按钮时触发的事件。本接口为 Beta 版本，暂只在 Android 平台支持。

	// 参数
	// function listener
	// 用户点击右上角菜单的「分享到朋友圈」按钮时触发的事件的监听函数
	export function onShareTimeline(
		listener: (res: {
			title?: string;
			imageUrl?: string;
			imageUrlId: string;
			imagePreviewUrl: string;
			imagePreviewUrlId: string;
			query: string;
			path: string;
		}) => void
	): void;

	// 功能描述
	// 移除用户点击右上角菜单的「分享到朋友圈」按钮时触发的事件的监听函数

	// 参数
	// function listener
	// onShareTimeline 传入的监听函数。不传此参数则移除所有监听函数。
	export function offShareTimeline(): void;

	// 功能描述
	// 监听用户点击右上角菜单的「转发」按钮时触发的事件

	// 参数
	// function listener
	// 用户点击右上角菜单的「转发」按钮时触发的事件的监听函数
	export function onShareAppMessage(
		listener: (res: {
			title?: string;
			imageUrl?: string;
			imageUrlId: string;
			query: string;
			promise: Promise<any>;
			path: string;
		}) => void
	): void;

	// 功能描述
	// 移除用户点击右上角菜单的「转发」按钮时触发的事件的监听函数

	// 参数
	// function listener
	// onShareAppMessage 传入的监听函数。不传此参数则移除所有监听函数
	export function offShareAppMessage(): void;

	export function shareAppMessage(param: {
		title?: string;
		imageUrl?: string;
		query?: string;
		imageUrlId: string;
		toCurrentGroup?: boolean;
		path?: string;
	}): void;
}
