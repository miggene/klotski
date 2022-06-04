import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
import { CELL_H } from './KlotskiModuleCfg';
const { ccclass, property } = _decorator;

@ccclass('Finger')
export class Finger extends Component {
	onLoad() {
		this.node.active = false;
	}

	start() {}

	// update(deltaTime: number) {}

	public show(pos: Vec3) {
		this.node.active = true;
		tween(this.node).stop();
		this.node.setPosition(pos);
		const moveAct = tween(this.node)
			.by(1, { position: v3(0, -CELL_H * 2, 0) }, { easing: 'quadInOut' })
			.by(0.5, { position: v3(0, CELL_H * 2, 0) }, { easing: 'sineOut' });
		tween(this.node).repeatForever(moveAct).start();
	}

	public hide() {
		tween(this.node).stop();
		this.node.active = false;
	}
}
