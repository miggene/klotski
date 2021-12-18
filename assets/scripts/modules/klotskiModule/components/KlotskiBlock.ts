/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 16:18:37
 * @LastEditTime: 2021-12-18 17:51:17
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/components/KlotskiBlock.ts
 */
import {
	_decorator,
	Component,
	Node,
	Sprite,
	UITransform,
	SpriteFrame,
} from 'cc';
import { resMgr } from '../../../common/mgrs/ResMgr';
import { IBlock } from '../IKlotskiModule';
import { BLOCK_SPRITE_FRAME_PATH } from '../KlotskiModuleCfg';
import {
	getBlockContentSizeByStyle,
	getBlockSizeByStyle,
} from '../KlotskiService';
const { ccclass, property } = _decorator;

@ccclass('KlotskiBlock')
export class KlotskiBlock extends Component {
	private _blockName: string;
	public get blockName(): string {
		return this._blockName;
	}
	public set blockName(v: string) {
		this._blockName = v;
		resMgr
			.loadSprite(`${BLOCK_SPRITE_FRAME_PATH}${v}`)
			.then((spriteFrame: SpriteFrame) => {
				this.spBlock.spriteFrame = spriteFrame;
			})
			.catch((err) => console.error(err));
	}

	private _style: number;
	public get style(): number {
		return this._style;
	}
	public set style(v: number) {
		this._style = v;
		const blockSize = getBlockContentSizeByStyle(v);
		this.node
			.getComponent(UITransform)
			.setContentSize(blockSize[0], blockSize[1]);
	}

	private _blockId: number;
	public get blockId(): number {
		return this._blockId;
	}
	public set blockId(v: number) {
		this._blockId = v;
	}

	private _row: number;
	public get row(): number {
		return this._row;
	}
	public set row(v: number) {
		this._row = v;
	}

	private _col: number;
	public get col(): number {
		return this._col;
	}
	public set col(v: number) {
		this._col = v;
	}

	private _sizeX: number;
	public get sizeX(): number {
		return this._sizeX;
	}
	public set sizeX(v: number) {
		this._sizeX = v;
	}

	private _sizeY: number;
	public get sizeY(): number {
		return this._sizeY;
	}
	public set sizeY(v: number) {
		this._sizeY = v;
	}

	@property(Sprite)
	spBlock: Sprite;

	start() {
		// [3]
	}

	public initProps(props: IBlock) {
		const { blockId, blockName, style, row, col } = props;
		this.blockId = blockId;
		this.blockName = blockName;
		this.style = style;
		this.row = row;
		this.col = col;
	}

	// update (deltaTime: number) {
	//     // [4]
	// }

	/**
	 * refreshBlockImg
	 */
	public refreshBlockImg() {}
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
