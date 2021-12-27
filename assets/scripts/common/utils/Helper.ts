/*
 * @Author: zhupengfei
 * @Date: 2021-12-10 15:35:41
 * @LastEditTime: 2021-12-27 17:42:14
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/common/utils/Helper.ts
 */

import { Node, Tween, tween, UITransform, v2, v3 } from 'cc';

export function formatTime(time: number, format: string = 'HH:MM:SS'): string {
	const len = format.split(':').length;
	if (time < 60) {
		let s = time.toString();
		let m = '00';
		let h = '00';
		s = s.length > 1 ? s : `0${s}`;
		return len > 2 ? `${h}:${m}:${s}` : `${m}:${s}`;
	}
	if (time >= 60 && time < 3600) {
		let m = Math.floor(time / 60).toString();
		let s = Math.floor(time % 60).toString();
		let h = '00';
		m = m.length > 1 ? m : `0${m}`;
		s = s.length > 1 ? s : `0${s}`;
		return len > 2 ? `${h}:${m}:${s}` : `${m}:${s}`;
	}
	if (time >= 3600) {
		let n = Math.floor(time % 3600);
		const ms = this._updateUsedTime(n);
		let h = Math.floor(time / 3600).toString();
		h = h.length > 1 ? h : `0${h}`;
		return len > 2 ? `${h}:${ms}` : `${ms}`;
	}
}

export function deepClone(obj: Object) {
	return JSON.parse(JSON.stringify(obj));
}

// 字符串转数字
export function string2Number(str: string): number {
	const re = /^\d{1,}$/;
	const result = re.exec(str);
	if (result.length === str.length) {
		return parseInt(str, 10);
	}
	throw new Error('非全部是数字');
}
