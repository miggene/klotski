/*
 * @Author: zhupengfei
 * @Date: 2021-12-16 20:36:06
 * @LastEditTime: 2021-12-19 11:58:23
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/libs/klotskiLibs/HashMap.ts
 */
export default class HashMap {
	//define
	private maskBit = 16;
	private divideValue = Math.pow(2, this.maskBit);
	private hashCount = 4;
	private maskValue = this.divideValue - 1; //16 bits = 0xFFFF
	private hMapInitSize = this.divideValue * this.hashCount;

	//private variable
	private node = new Array(this.hMapInitSize);

	private _size: number = 0;

	public hashCode(key: any): number {
		let code = 0;
		//key = (key^0xdeadbeef) + (key<<5);
		for (let i = 0; i < this.hashCount; ++i) {
			code += key & this.maskValue;
			//mask 16 bits
			//key >>= MASK_BIT; //javascript: bitwise shift only support 32 bits
			key /= this.divideValue;
		}
		return code;
	}
	//if no duplicate return null
	//if duplicate return node of duplicate
	public put(key: any, value: any) {
		const hashIndex = this.hashCode(key);
		let curNode = this.node[hashIndex];
		//check duplicate or not
		while (curNode) {
			//if duplicate return node of duplicate
			if (key === curNode.key) return curNode;
			curNode = curNode.next;
		}
		curNode = { key, value, next: this.node[hashIndex] };
		this.node[hashIndex] = curNode;
		this._size++;
		return null;
	}

	//return a object contains { key, value } or null (undefined) if key not found
	public get(key: any) {
		let curNode = this.node[this.hashCode(key)];
		while (curNode) {
			if (key === curNode.key) break;
			curNode = curNode.next;
		}
		return curNode;
	}

	public remove(key: any) {
		let hashIndex = this.hashCode(key);
		let curNode = this.node[hashIndex];
		let preNode = null;
		while (curNode) {
			if (key === curNode.key) break;
			preNode = curNode;
			curNode = curNode.next;
		}
		if (curNode) {
			if (preNode) {
				preNode.next = curNode.next;
			} else {
				this.node[hashIndex] = curNode.next;
			}
			this._size--;
		}
		return curNode;
	}

	public size() {
		return this._size;
	}

	public clear() {
		let curNode = this.node.shift();
		while (curNode) {
			this.remove(curNode.key);
			curNode = this.node.shift();
		}
		this.node = null;
	}

	public maxCollision() {
		let maxCollision = 0;
		for (let i = 0; i < this.hMapInitSize; ++i) {
			let curNode = this.node[i];
			let curCollision = 0;
			while (curNode) {
				curCollision++;
				curNode = curNode.next;
			}
			if (curCollision > maxCollision) maxCollision = curCollision;
		}
		return maxCollision;
	}

	public average() {
		let total = 0;
		let usedItem = 0;
		for (let i = 0; i < this.hMapInitSize; ++i) {
			let curNode = this.node[i];
			let curCollision = 0;
			while (curNode) {
				curCollision++;
				curNode = curNode.next;
			}
			if (curCollision) usedItem++;
			total += curCollision;
		}
		if (total === 0 || usedItem === 0) {
			throw new Error('no item');
		}
		return total / usedItem;
	}
}
