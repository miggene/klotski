/*
 * @Author: zhupengfei
 * @Date: 2021-12-10 15:35:41
 * @LastEditTime: 2021-12-22 16:37:18
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

export function bounceAct(
	target: Node,
	dir: 'up' | 'down' | 'left' | 'right',
	scaleTime: number = 0.08
): Tween<Node> {
	const scaleNormal = v3(1, 1);
	let scaleMin = v3(1, 1);
	let scaleMax = v3(1, 1);
	let anchorPoint = v2(0.5, 0.5);
	switch (dir) {
		case 'up':
			scaleMin = v3(1, 0.7);
			scaleMax = v3(1, 1.3);
			anchorPoint = v2(0.5, 1);
			break;
		case 'down':
			scaleMin = v3(1, 0.7);
			scaleMax = v3(1, 1.3);
			anchorPoint = v2(0.5, 0);
			break;
		case 'left':
			scaleMin = v3(0.7, 1);
			scaleMax = v3(1.3, 1);
			anchorPoint = v2(0, 0.5);
			break;
		case 'right':
			scaleMin = v3(0.7, 1);
			scaleMax = v3(1.3, 1);
			anchorPoint = v2(1, 0.5);
			break;
	}
	target.getComponent(UITransform).setAnchorPoint(anchorPoint);
	const scaleAct = tween()
		.to(scaleTime, { scale: scaleMin })
		.to(scaleTime, { scale: scaleNormal })
		.to(scaleTime, { scale: scaleMax })
		.to(scaleTime, { scale: scaleNormal })
		.call(() => {
			target.getComponent(UITransform).setAnchorPoint(v2(0.5, 0.5));
		});
	return scaleAct;
}
