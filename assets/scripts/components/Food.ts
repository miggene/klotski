/*
 * @Author: zhupengfei
 * @Date: 2021-12-04 11:50:42
 * @LastEditTime: 2021-12-05 17:48:29
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/components/Food.ts
 */
import { _decorator, Component, Sprite, resources, SpriteFrame } from 'cc';
export type Shape = [number, number];

const { ccclass, property } = _decorator;

@ccclass('Food')
export class Food extends Component {
	// [1]
	// dummy = '';

	private _blockIdx: number;
	public get blockIdx(): number {
		return this._blockIdx;
	}
	public set blockIdx(v: number) {
		this._blockIdx = v;
	}

	private _position: [number, number];
	public get position(): [number, number] {
		return this._position;
	}
	public set position(v: [number, number]) {
		this._position = v;
	}

	private _shape: Shape;
	public get shape(): Shape {
		return this._shape;
	}
	public set shape(v: Shape) {
		this._shape = v;
	}

	private _foodName: string;
	public get foodName(): string {
		return this._foodName;
	}
	public set foodName(v: string) {
		if (this._foodName !== v) {
			this._foodName = v;
			resources.load(
				`foods/${v}/spriteFrame`,
				SpriteFrame,
				(err, spriteFrame) => {
					if (err) console.error(err);
					else this.spFood.spriteFrame = spriteFrame;
				}
			);
		}
	}

	@property(Sprite)
	spFood: Sprite;

	start() {
		// [3]
	}

	// update (deltaTime: number) {
	//     // [4]
	// }
	initProps(
		foodName: string,
		blockIdx: number,
		position: [number, number],
		shape: Shape
	) {
		this.foodName = foodName;
		this.blockIdx = blockIdx;
		this.position = position;
		this.shape = shape;
	}
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
