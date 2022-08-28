import { instantiate, Node, Prefab } from 'cc';
import { resMgr } from '../common/mgrs/ResMgr';

const Router = {};

export interface Location {
	path: string;
	parent: Node;
	params?: any;
}

export interface NavigateProps {
	to: Location;
	replace?: boolean;
	state?: any;
}

export default class Navigate {
	public static to(props: NavigateProps) {
		const {
			to: { path, parent },
			replace,
			state,
		} = props;
		resMgr
			.loadPrefab(path)
			.then((prefab: Prefab) => {
				parent.addChild(instantiate(prefab));
			})
			.catch((err) => console.error(err));
	}
}
