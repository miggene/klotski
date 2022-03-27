import {
	_decorator,
	Component,
	Sprite,
	Color,
	v3,
	UITransform,
	tween,
} from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = WinTip
 * DateTime = Sun Mar 27 2022 11:40:42 GMT+0800 (中国标准时间)
 * Author = dailycode365
 * FileBasename = WinTip.ts
 * FileBasenameNoExtension = WinTip
 * URL = db://assets/scripts/modules/overModule/WinTip.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

const COLORS = [
	'#FFB6C1',
	'#FFC0CB',
	'#DC143C',
	'#FFF0F5',
	'#DB7093',
	'#FF69B4',
	'#FF1493',
	'#C71585',
	'#DA70D6',
	'#D8BFD8',
	'#DDA0DD',
	'#EE82EE',
	'#FF00FF',
	'#FF00FF',
	'#8B008B',
	'#800080',
	'#BA55D3',
	'#9400D3',
	'#9932CC',
	'#4B0082',
	'#8A2BE2',
	'#9370DB',
	'#7B68EE',
	'#6A5ACD',
	'#483D8B',
	'#E6E6FA',
	'#F8F8FF',
	'#0000FF',
	'#0000CD',
	'#191970',
	'#00008B',
	'#000080',
	'#4169E1',
	'#6495ED',
	'#B0C4DE',
	'#778899',
	'#708090',
	'#1E90FF',
	'#F0F8FF',
	'#4682B4',
	'#87CEFA',
	'#87CEEB',
	'#00BFFF',
	'#ADD8E6',
	'#B0E0E6',
	'#5F9EA0',
	'#F0FFFF',
	'#E0FFFF',
	'#AFEEEE',
	'#00FFFF',
	'#00CED1',
	'#2F4F4F',
	'#008B8B',
	'#008080',
	'#48D1CC',
	'#20B2AA',
	'#40E0D0',
	'#7FFFD4',
	'#66CDAA',
	'#00FA9A',
	'#F5FFFA',
	'#00FF7F',
	'#3CB371',
	'#2E8B57',
	'#F0FFF0',
	'#90EE90',
	'#98FB98',
	'#8FBC8F',
	'#32CD32',
	'#00FF00',
	'#228B22',
	'#008000',
	'#006400',
	'#7FFF00',
	'#7CFC00',
	'#ADFF2F',
	'#556B2F',
	'#9ACD32',
	'#6B8E23',
	'#F5F5DC',
	'#FAFAD2',
	'#FFFFF0',
	'#FFFFE0',
	'#FFFF00',
	'#808000',
	'#BDB76B',
	'#FFFACD',
	'#EEE8AA',
	'#F0E68C',
	'#FFD700',
	'#FFF8DC',
	'#DAA520',
	'#B8860B',
	'#FFFAF0',
	'#FDF5E6',
	'#F5DEB3',
	'#FFE4B5',
	'#FFA500',
	'#FFEFD5',
	'#FFEBCD',
	'#FFDEAD',
	'#FAEBD7',
	'#D2B48C',
	'#DEB887',
	'#FFE4C4',
	'#FF8C00',
	'#FAF0E6',
	'#CD853F',
	'#FFDAB9',
	'#F4A460',
	'#D2691E',
	'#8B4513',
	'#FFF5EE',
	'#A0522D',
	'#FFA07A',
	'#FF7F50',
	'#FF4500',
	'#E9967A',
	'#FF6347',
	'#FFE4E1',
	'#FA8072',
	'#FFFAFA',
	'#F08080',
	'#BC8F8F',
	'#CD5C5C',
	'#FF0000',
	'#A52A2A',
	'#B22222',
	'#8B0000',
	'#800000',
	'#FFFFFF',
	'#F5F5F5',
	'#DCDCDC',
	'#D3D3D3',
	'#C0C0C0',
	'#A9A9A9',
	'#808080',
	'#696969',
	'#000000',
];

@ccclass('WinTip')
export class WinTip extends Component {
	@property(Sprite)
	spWinTip: Sprite;

	onLoad() {
		const { width, height } = this.node.parent.getComponent(UITransform);
		const tipHeight = this.spWinTip.node.getComponent(UITransform).height;
		const colorValue = COLORS[Math.floor(Math.random() * COLORS.length)];
		this.spWinTip.color = new Color(colorValue);
		this.node.setPosition(
			v3(width * 2, (Math.random() * height) / 2 - tipHeight, 0)
		);
	}

	start() {
		// [3]
		const { width } = this.node.parent.getComponent(UITransform);
		const finallyPos = v3(-width * 2, this.node.getPosition().y, 0);
		const duration = Math.random() * 10 + 1;
		tween(this.node)
			.to(duration, { position: finallyPos })
			.removeSelf()
			.start();
	}

	// update (deltaTime: number) {
	//     // [4]
	// }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
