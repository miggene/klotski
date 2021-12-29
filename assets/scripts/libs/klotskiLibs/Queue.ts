/*
 * @Author: zhupengfei
 * @Date: 2021-12-17 09:47:10
 * @LastEditTime: 2021-12-19 11:16:31
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/libs/klotskiLibs/queue.ts
 */
export default class Queue {
	private head: any = null;
	private tail: any = null;
	private _size = 0;

	public add(data: any) {
		const node = {
			data,
			next: null,
		};
		if (this.tail === null) {
			this.tail = node;
			this.head = node;
		} else {
			this.tail.next = node;
			this.tail = node;
		}
		this._size++;
	}

	public remove() {
		let data;
		if (this._size <= 0) return null;
		data = this.head.data;
		this.head = this.head.next;
		if (this.head === null) this.tail = null;
		this._size--;
		return data;
	}

	public size() {
		return this._size;
	}

	public clear() {
		while (this.size() > 0) {
			this.remove();
		}
	}

	// public dump() {
	// 	console.log('-- Begin queue dump --------------');
	// 	let lastIndex = 0;
	// 	for (let i = 0, node = this.head; node; node = node.next) {
	// 		console.log(++i + ')' + node.data);
	// 		lastIndex = i;
	// 	}
	// 	console.log('Queue size = ' + this._size);
	// 	console.log('-- After queue dump --------------');
	// 	if (lastIndex !== this._size) {
	// 		console.log('queue design error !');
	// 	}
	// }

	// public test(data: any) {
	// 	let node;
	// 	node = this.head;
	// 	while (node) {
	// 		if (node.data === data) {
	// 			console.log('Queue Data duplice :' + data);
	// 			break;
	// 		}
	// 		node = node.next;
	// 	}
	// }
}
