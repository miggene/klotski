export interface ILevel {
	level: number;
	blocks: IBlock[];
}

export interface IBlock {
	shape: number[];
	position: number[];
	directions?: number[];
}

export interface IState {
	board: number[][];
	blocks: IBlock[];
	types: { [key: string]: number };
	hash: number;
	mirrorHash: number;
	move: {
		blockIdx: number;
		dirIdx: number;
	};
	parent: IState | null;
	step: number;
}

export interface IGameState {
	states: IState[];
	zHash: { [key: string]: boolean };
	result: {
		moves: {
			step: number;
			blockIdx: number;
			dirIdx: number;
			state: IState;
		}[];
		time: number | null;
	};
}

export interface IHrdOptions {
	blocks: IBlock[];
	boardSize?: number[];
	bMirror?: boolean;
	escapePoints?: number[];
}

const DIRECTIONS = [
	{ x: 0, y: 1 },
	{ x: 1, y: 0 },
	{ x: 0, y: -1 },
	{ x: -1, y: 0 },
];

const HRD_ROW = 5;
const HRD_COL = 4;
const ESCAPE_ROW = 3;
const ESCAPE_COL = 1;
const NO_LR_MIRROR_ALLOW = true;
const MAX_MOVE_DIRECTION = 4;

export default class Hrd {
	private _gameState: IGameState;
	private _state: IState;
	private _bMirror: boolean;
	private _escapePoints: number[];
	private readonly _row: number;
	private readonly _col: number;
	private _zobHash: { [key: string]: number[] };
	get emptyBoard() {
		const board: number[][] = [];
		for (let i = 0; i < this._row; ++i) {
			board[i] = [];
			for (let j = 0; j < this._col; ++j) {
				board[i][j] = 0;
			}
		}
		return board;
	}
	get blocks() {
		return this._state.blocks;
	}

	get board() {
		return this._state.board;
	}

	get state() {
		return this._state;
	}
	set state(s: IState) {
		this._state = s;
	}

	get states() {
		return this._gameState.states;
	}

	get moves() {
		return this._gameState.result.moves;
	}

	constructor(options: IHrdOptions) {
		const { bMirror, escapePoints, boardSize, blocks } = options;
		this._bMirror = bMirror != null ? bMirror : NO_LR_MIRROR_ALLOW;
		this._escapePoints = escapePoints || [ESCAPE_ROW, ESCAPE_COL];
		const [row, col] = boardSize || [HRD_ROW, HRD_COL];

		this._row = row;
		this._col = col;
		this._state = {
			blocks: [],
			board: this.emptyBoard,
			types: {},
			hash: 0,
			mirrorHash: 0,
			move: { blockIdx: 0, dirIdx: 0 },
			parent: null,
			step: 0,
		};
		this._zobHash = {};
		this._gameState = {
			states: [],
			zHash: {},
			result: {
				time: null,
				moves: [],
			},
		};

		this.init(blocks);
	}

	getType(shape: number[]) {
		const key = shape.toString();
		return key in this._state.types ? this._state.types[key] : -1;
	}

	setType(shape: number[]) {
		const key = shape.toString();
		if (this.getType(shape) === -1) {
			this._state.types[key] = Object.keys(this._state.types).length + 1;
		}
	}

	setBoard(block: IBlock, index: number) {
		const { shape, position } = block;
		const blockIdx = index + 1;
		const [row, col] = position;
		const [h, w] = shape;
		for (let i = row; i < row + h; ++i) {
			for (let j = col; j < col + w; ++j) {
				this._state.board[i][j] = blockIdx;
			}
		}
	}

	init(blocks: IBlock[]) {
		this._state.blocks = blocks;
		blocks.forEach((block, index) => {
			this.setType(block.shape);
			this.setBoard(block, index);
		});
		this._state.parent = null;
		this._state.move = { blockIdx: 0, dirIdx: 0 };
		this._state.step = 0;
		this.initZobristHash();

		this._state.hash = this.getZobristHash(this._state);
		this._state.mirrorHash = this.getMirrorZobristHash(this._state);

		this._gameState.states.push(this._state);
	}

	initZobristHash() {
		for (let i = 0; i < this._row; ++i) {
			for (let j = 0; j < this._col; ++j) {
				const key = `${i},${j}`;
				this._zobHash[key] = [];
				const len = Object.keys(this._state.types).length + 1;
				for (let m = 0; m < len; ++m) {
					this._zobHash[key][m] = this.random32();
				}
			}
		}
	}

	random32() {
		let ret = 0;
		do {
			ret = Math.floor(Math.random() * Math.pow(2, 31));
		} while (ret === 0);
		return ret;
	}

	getZobristHash(state: IState) {
		let hash = 0;
		for (let i = 0; i < this._row; ++i) {
			for (let j = 0; j < this._col; ++j) {
				const key = `${i},${j}`;
				const blockIdx = state.board[i][j] - 1;
				const type =
					blockIdx < 0 ? 0 : this.getType(state.blocks[blockIdx].shape);
				hash ^= this._zobHash[key][type];
			}
		}
		return hash;
	}

	getMirrorZobristHash(state: IState) {
		let hash = 0;
		for (let i = 0; i < this._row; ++i) {
			for (let j = 0; j < this._col; ++j) {
				const mirrorKey = `${i},${this._col - j - 1}`;
				const blockIdx = state.board[i][j] - 1;
				const type =
					blockIdx < 0 ? 0 : this.getType(state.blocks[blockIdx].shape);
				hash ^= this._zobHash[mirrorKey][type];
			}
		}
		return hash;
	}

	updateZobristHash(
		state: IState,
		blockIdx: number,
		dirIdx: number,
		bMirror = false
	) {
		let hash = bMirror ? state.mirrorHash : state.hash;
		const block = state.blocks[blockIdx];
		const { shape, position } = block;

		const dir =
			DIRECTIONS[bMirror && dirIdx % 2 === 1 ? (dirIdx + 2) % 4 : dirIdx];
		const { x, y } = dir;
		const row = position[0];
		let col = position[1];
		const [h, w] = shape;
		bMirror ? (col = this._col - 1 - col) : col;
		const dx = bMirror ? -1 : 1;
		const type = this.getType(shape);
		// 清理原位置
		for (let i = 0; i < h; ++i) {
			for (let j = 0; j < w; ++j) {
				const r = row + i;
				const c = col + dx * j;
				const key = `${r},${c}`;
				hash ^= this._zobHash[key][type];
				hash ^= this._zobHash[key][0];
			}
		}

		// 占用新位置
		for (let i = 0; i < h; ++i) {
			for (let j = 0; j < w; ++j) {
				const r = row + i + y;
				const c = col + dx * j + x;
				const key = `${r},${c}`;
				hash ^= this._zobHash[key][0];
				hash ^= this._zobHash[key][type];
			}
		}

		return hash;
	}

	isEscaped(state: IState) {
		const block = state.blocks[0];
		if (block == null) return false;
		const [row, col] = block.position;
		return row === this._escapePoints[0] && col === this._escapePoints[1];
	}

	markGameState(state: IState) {
		const l2rHash = state.hash;
		this._gameState.zHash[l2rHash] = true;
		if (this._bMirror) {
			const r2lHash = state.mirrorHash;
			this._gameState.zHash[r2lHash] = true;
		}
	}

	searchNewGameState(state: IState) {
		const { blocks } = state;
		for (let i = 0; i < blocks.length; ++i) {
			for (let j = 0; j < MAX_MOVE_DIRECTION; ++j) {
				this.trySearchBlockNewState(state, i, j);
			}
		}
	}

	trySearchBlockNewState(state: IState, blockIdx: number, dirIdx: number) {
		const newState = this.moveBlockToNewState(state, blockIdx, dirIdx);
		if (newState) {
			if (this.addNewStatePattern(newState)) {
				this.tryContinueBlockMove(newState, blockIdx, dirIdx);
				return;
			}
		}
	}

	moveBlockToNewState(state: IState, blockIdx: number, dirIdx: number) {
		if (this.canBlockMove(state, blockIdx, dirIdx)) {
			const hash = this.updateZobristHash(state, blockIdx, dirIdx);
			if (hash in this._gameState.zHash) return null;
			let mirrorHash = 0;
			if (this._bMirror) {
				mirrorHash = this.updateZobristHash(state, blockIdx, dirIdx, true);
				if (mirrorHash in this._gameState.zHash) return null;
			}

			const newState = this.copyState(state);
			const block = newState.blocks[blockIdx];
			const dir = DIRECTIONS[dirIdx];

			this.clearPosition(newState, block);
			this.takePosition(newState, block, blockIdx, dirIdx);
			block.position = [dir.y, dir.x].map(
				(v, index) => v + block.position[index]
			);
			newState.blocks[blockIdx] = block;
			newState.step = state.step + 1;
			newState.parent = state;
			newState.move.blockIdx = blockIdx;
			newState.move.dirIdx = dirIdx;
			newState.hash = hash;
			if (this._bMirror) newState.mirrorHash = mirrorHash;
			return newState;
		}
		return null;
	}

	canBlockMove(state: IState, blockIdx: number, dirIdx: number) {
		const block = state.blocks[blockIdx];
		if (block.directions != null && block.directions.indexOf(dirIdx) < 0) {
			return false;
		}
		const { position, shape } = block;
		const dir = DIRECTIONS[dirIdx];
		const [row, col] = position;
		const [h, w] = shape;

		for (let i = 0; i < h; ++i) {
			for (let j = 0; j < w; ++j) {
				const r = row + i + dir.y;
				const c = col + j + dir.x;
				if (r < 0 || r >= this._row) return false;
				if (c < 0 || c >= this._col) return false;

				const value = state.board[r][c];
				if (value !== 0 && value !== blockIdx + 1) {
					return false;
				}
			}
		}
		return true;
	}

	copyState(state: IState) {
		const { board, blocks, types, hash, mirrorHash, move, parent, step } =
			state;
		const newBoard: number[][] = [];
		board.forEach((list, index) => (newBoard[index] = list.slice()));
		const newBlocks: IBlock[] = [];
		blocks.forEach((block, index) => {
			newBlocks[index] = {
				shape: block.shape.slice(),
				position: block.position.slice(),
				directions: block.directions ? block.directions.slice() : undefined,
			};
		});
		const newTypes: { [key: string]: number } = {};
		for (const key in types) {
			if (Object.prototype.hasOwnProperty.call(types, key)) {
				const element = types[key];
				newTypes[key] = element;
			}
		}
		const newState: IState = {
			board: newBoard,
			blocks: newBlocks,
			types: newTypes,
			hash,
			mirrorHash,
			move: {
				blockIdx: move.blockIdx,
				dirIdx: move.dirIdx,
			},
			parent,
			step,
		};
		return newState;
	}

	clearPosition(state: IState, block: IBlock) {
		const { board } = state;
		const [row, col] = block.position;
		const [h, w] = block.shape;
		for (let i = 0; i < h; ++i) {
			for (let j = 0; j < w; ++j) {
				board[row + i][col + j] = 0;
			}
		}
	}

	takePosition(state: IState, block: IBlock, blockIdx: number, dirIdx: number) {
		const { board } = state;
		let [row, col] = block.position;
		const { x, y } = DIRECTIONS[dirIdx];
		row += y;
		col += x;
		const [h, w] = block.shape;
		for (let i = 0; i < h; ++i) {
			for (let j = 0; j < w; ++j) {
				board[row + i][col + j] = blockIdx + 1;
			}
		}
	}

	addNewStatePattern(state: IState) {
		const l2rHash = state.hash;
		if (l2rHash in this._gameState.zHash) return false;

		let r2lHash = 0;
		if (this._bMirror) {
			r2lHash = state.mirrorHash;
			if (r2lHash in this._gameState.zHash) return false;
		}

		this._gameState.zHash[l2rHash] = true;
		this._bMirror && (this._gameState.zHash[r2lHash] = true);
		this._gameState.states.push(state);
		return true;
	}

	tryContinueBlockMove(state: IState, blockIdx: number, dirIdx: number) {
		for (let i = 0; i < MAX_MOVE_DIRECTION; ++i) {
			if (!this.isReverseDirection(i, dirIdx)) {
				const newState = this.moveBlockToNewState(state, blockIdx, i);
				if (newState) {
					if (this.addNewStatePattern(newState)) {
						--newState.step;
					}
				}
			}
		}
	}

	isReverseDirection(dirIdx1: number, dirIdx2: number) {
		return (dirIdx1 + 2) % MAX_MOVE_DIRECTION === dirIdx2;
	}

	resolveGame() {
		let index = 0;
		while (index < this.states.length) {
			const state = this.states[index++];
			this.markGameState(state);
			if (this.isEscaped(state)) {
				this.outputMoveRecords(state);
				return true;
			} else {
				this.searchNewGameState(state);
			}
		}
		return false;
	}

	outputMoveRecords(state: IState | null) {
		while (state) {
			if (state.step > 0) {
				const move = {
					step: state.step,
					blockIdx: state.move.blockIdx,
					dirIdx: state.move.dirIdx,
					state,
				};
				this._gameState.result.moves.unshift(move);
			}
			state = state.parent;
		}
	}
}

export function solve(options: IHrdOptions) {
	const hrd = new Hrd(options);
	if (hrd.resolveGame()) {
		return hrd.moves;
	}
	return null;
}

export function mergeSteps(
	moves: { blockIdx: number; dirIdx: number; step: number; state: IState }[]
) {
	const result: {
		blockIdx: number;
		dirIdx: number;
		count: number;
		state: IState;
	}[] = [];
	result[0] = {
		blockIdx: moves[0].blockIdx,
		dirIdx: moves[0].dirIdx,
		count: 1,
		state: moves[0].state,
	};
	for (let i = 1; i < moves.length; ++i) {
		const prev = result[result.length - 1];
		const cur = moves[i];
		if (cur.blockIdx === prev.blockIdx && cur.dirIdx === prev.dirIdx) {
			prev.count++;
			prev.state = cur.state;
		} else {
			result.push({
				blockIdx: cur.blockIdx,
				dirIdx: cur.dirIdx,
				count: 1,
				state: cur.state,
			});
		}
	}
	return result;
}
