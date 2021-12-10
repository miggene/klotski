/*
 * @Author: zhupengfei
 * @Date: 2021-11-24 16:58:32
 * @LastEditTime: 2021-12-10 15:17:01
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/libs/Klotski.ts
 */

let NO_LR_MIRROR_ALLOW: boolean | undefined = true;
const MAX_MOVE_DIRECTION = 4;
export let HRD_GAME_ROW = 5;
export let HRD_GAME_COL = 4;
export let HRD_BOARD_WIDTH = HRD_GAME_COL + 2;
export let HRD_BOARD_HEIGHT = HRD_GAME_ROW + 2;

export let ESCAPE_ROW = 3;
export let ESCAPE_COL = 1;
export const BOARD_CELL_EMPTY = 0;
export const BOARD_CELL_BOARDER = -1;

export type Step = { blockIdx: number; dirIdx: number; count: number };
export type Types = { [key: string]: number };
export type Shape = [number, number];
export type Options = {
	useMirror?: boolean;
	boardSize?: [number, number];
	escapePoint?: [number, number];
	blocks?: Block[];
	name?: string;
};
export type Move = {
	step: number;
	blockIdx: number;
	dirIdx: number;
};
export type Block = {
	shape: [number, number];
	position: [number, number];
	directions?: number[];
	row?: number;
	col?: number;
};
export type Game = {
	states: State[];
	zhash: { [key: number]: boolean };
	result: {
		time: number;
		moves: Move[];
	};
};
export type State = {
	board: number[][];
	blocks: Block[];
	types: Types;
	move: Move;
	step: number;
	hash: number;
	hashMirror: number;
	parent?: State | null;
};
export type Direction = {
	x: number;
	y: number;
};

export default class Klotski {
	private directions: Direction[] = [
		{ x: 0, y: 1 },
		{ x: 1, y: 0 },
		{ x: 0, y: -1 },
		{ x: -1, y: 0 },
	];
	private directionName = ['Down', 'Right', 'Up', 'Left'];
	private zob_hash: { key: { value: number[] }[][] } = { key: [] };
	private level = 0;
	public game: Game = null;

	getType(types: Types, shape: Shape) {
		return types[shape[0] + '-' + shape[1]];
	}

	setTypes(types: Types, shape: Shape) {
		const key = shape.join('-');
		if (!(key in types)) {
			types[key] = Object.keys(types).length + 1;
		}
	}

	isReverseDirection(dirIdx1: number, dirIdx2: number) {
		return (dirIdx1 + 2) % MAX_MOVE_DIRECTION === dirIdx2;
	}

	solve(options: Options): Move[] | null {
		const { useMirror, boardSize, escapePoint, blocks } = options;
		useMirror && (NO_LR_MIRROR_ALLOW = options.useMirror);
		boardSize &&
			((HRD_GAME_ROW = boardSize[0]),
			(HRD_GAME_COL = boardSize[1]),
			(HRD_BOARD_WIDTH = HRD_GAME_COL + 2),
			(HRD_BOARD_HEIGHT = HRD_GAME_ROW + 2));
		escapePoint &&
			((ESCAPE_ROW = escapePoint[0]), (ESCAPE_COL = escapePoint[1]));
		if (blocks) {
			const game = this.createGame(blocks as Block[]);
			if (game) {
				if (this.resolveGame(game)) {
					return game.result.moves.reverse();
				}
			}
		}
		return null;
	}

	createGame(blocks: Block[]): Game | null {
		const game: Game = {
			states: [],
			zhash: {},
			result: {
				time: 0,
				moves: [],
			},
		};
		const state: State = {
			board: [],
			blocks: [],
			types: {},
			move: {
				step: 0,
				blockIdx: 0,
				dirIdx: 0,
			},
			step: 0,
			hash: 0,
			hashMirror: 0,
			parent: null,
		};
		this.initGameStateBoard(state);
		state.parent = null;
		state.step = 0;
		state.move.blockIdx = 0;
		state.move.dirIdx = 0;

		for (let i = 0; i < blocks.length; ++i) {
			const {
				shape,
				position,
				row = position[0],
				col = position[1],
				directions,
			} = blocks[i];
			const block = { shape, row, col, directions, position };

			if (!this.addGameStateBlock(state, i, block)) {
				return null;
			}
		}
		const numTypes = Object.keys(state.types).length;
		this.initZobristHash(numTypes);
		state.hash = this.getZobristHash(state);
		state.hashMirror = this.getMirrorZobristHash(state);
		game.states.push(state);
		return game;
	}

	initGameStateBoard(state: State) {
		for (let i = 0; i < HRD_BOARD_HEIGHT; ++i) {
			state.board[i] = [];
			for (let j = 0; j < HRD_BOARD_WIDTH; ++j) {
				state.board[i][j] =
					i !== 0 &&
					i !== HRD_BOARD_HEIGHT - 1 &&
					j !== 0 &&
					j !== HRD_BOARD_WIDTH - 1
						? BOARD_CELL_EMPTY
						: BOARD_CELL_BOARDER;
			}
		}
	}

	addGameStateBlock(state: State, blockIdx: number, block: Block) {
		if (this.isPositionAvailable(state, block.shape, block.row, block.col)) {
			this.takePosition(state, blockIdx, block.shape, block.row, block.col);
			this.setTypes(state.types, block.shape);
			state.blocks.push(block);
			return true;
		}
		return false;
	}

	isPositionAvailable(state: State, shape: Shape, row?: number, col?: number) {
		const r = shape[0];
		const c = shape[1];
		for (let i = 1; i <= r; ++i) {
			for (let j = 1; j <= c; ++j) {
				if (
					row !== undefined &&
					col !== undefined &&
					state.board[row + i][col + j] !== BOARD_CELL_EMPTY
				)
					return false;
			}
		}
		return true;
	}

	takePosition(
		state: State,
		blockIdx: number,
		shape: Shape,
		row?: number,
		col?: number
	) {
		for (var i = 1; i <= shape[0]; i++) {
			for (var j = 1; j <= shape[1]; j++) {
				if (row !== undefined && col !== undefined) {
					state.board[row + i][col + j] = blockIdx + 1;
				}
			}
		}
	}

	clearPosition(state: State, shape: Shape, row: number, col: number) {
		for (let i = 1; i <= shape[0]; ++i) {
			for (let j = 1; j <= shape[1]; ++j) {
				state.board[row + i][col + j] = BOARD_CELL_EMPTY;
			}
		}
	}

	initZobristHash(numTypes: number) {
		for (let i = 0; i < HRD_GAME_ROW; ++i) {
			this.zob_hash.key[i] = [];
			for (let j = 0; j < HRD_GAME_COL; ++j) {
				this.zob_hash.key[i][j] = { value: [] };
				this.makeCellState(numTypes, this.zob_hash.key[i][j]);
			}
		}
	}

	makeCellState(numTypes: number, cr: { value: number[] }) {
		for (let i = 0; i < numTypes; ++i) {
			cr.value[i] = this.random32();
		}
	}

	random32() {
		let tmp = 0;
		do {
			tmp = Math.floor(Math.random() * Math.pow(2, 31));
		} while (!tmp);
		return tmp;
	}

	getZobristHash(gameState: State) {
		let hash = 0;
		const { blocks } = gameState;
		for (let i = 1; i <= HRD_GAME_ROW; ++i) {
			for (let j = 1; j <= HRD_GAME_COL; ++j) {
				const index = gameState.board[i][j] - 1;
				const type =
					index >= 0 && index < blocks.length
						? this.getType(gameState.types, blocks[index].shape)
						: 0;
				hash ^= this.zob_hash.key[i - 1][j - 1].value[type];
			}
		}
		return hash;
	}

	getMirrorZobristHash(gameState: State) {
		let hash = 0;
		const { blocks } = gameState;
		for (let i = 1; i <= HRD_GAME_ROW; i++) {
			for (let j = 1; j <= HRD_GAME_COL; j++) {
				var index = gameState.board[i][j] - 1;
				var type =
					index >= 0 && index < blocks.length
						? this.getType(gameState.types, blocks[index].shape)
						: 0;
				hash ^= this.zob_hash.key[i - 1][HRD_GAME_COL - j].value[type];
			}
		}
		return hash;
	}

	getZobristHashUpdate(
		gameState: State,
		blockIdx: number,
		dirIdx: number,
		isMirror?: boolean
	) {
		let hash = isMirror ? gameState.hashMirror : gameState.hash;
		const block = gameState.blocks[blockIdx];
		const { shape, row } = block;
		const type = this.getType(gameState.types, shape);
		const col = isMirror ? HRD_GAME_COL - 1 - block.col! : block.col!;
		const dx = isMirror ? -1 : 1;
		const dir =
			this.directions[
				isMirror && (dirIdx & 1) === 1 ? (dirIdx + 2) % 4 : dirIdx
			];
		const { x, y } = dir;
		//clear the old position
		for (let i = 0; i < shape[0]; ++i) {
			for (let j = 0; j < shape[1]; ++j) {
				hash ^= this.zob_hash.key[row! + i][col + j * dx].value[type];
				hash ^= this.zob_hash.key[row! + i][col + j * dx].value[0];
			}
		}

		//take the new position
		for (let i = 0; i < shape[0]; ++i) {
			for (let j = 0; j < shape[1]; ++j) {
				hash ^= this.zob_hash.key[row! + y + i][col + x + j * dx].value[0];
				hash ^= this.zob_hash.key[row! + y + i][col + x + j * dx].value[type];
			}
		}

		return hash;
	}

	resolveGame(game: Game) {
		let index = 0;
		while (index < game.states.length) {
			const gameState = game.states[index++];
			this.markGameState(game, gameState);
			if (this.isEscaped(gameState)) {
				this.outputMoveRecords(game, gameState);
				return true;
			}
			this.searchNewGameStates(game, gameState);
		}
		return false;
	}

	markGameState(game: Game, gameState: State) {
		const l2rHash = gameState.hash;
		game.zhash[l2rHash] = true;
		if (NO_LR_MIRROR_ALLOW) {
			const r2lHash = gameState.hashMirror;
			game.zhash[r2lHash] = true;
		}
	}

	isEscaped(gameState: State) {
		const block = gameState.blocks[0];
		return block.row === ESCAPE_ROW && block.col === ESCAPE_COL;
	}

	outputMoveRecords(game: Game, gameState: State) {
		let state = gameState;
		while (state) {
			if (state.step > 0) {
				const move = {
					...state.move,
					step: state.step,
				};
				game.result.moves.push(move);
			}
			state = state.parent as State;
		}
	}

	searchNewGameStates(game: Game, gameState: State) {
		for (let i = 0; i < gameState.blocks.length; ++i) {
			for (let j = 0; j < MAX_MOVE_DIRECTION; ++j) {
				this.trySearchBlockNewState(game, gameState, i, j);
			}
		}
	}

	trySearchBlockNewState(
		game: Game,
		gameState: State,
		blockIdx: number,
		dirIdx: number
	) {
		const newState = this.moveBlockToNewState(
			game,
			gameState,
			blockIdx,
			dirIdx
		);
		if (newState) {
			if (this.addNewStatePattern(game, newState)) {
				this.tryBlockContinueMove(game, newState, blockIdx, dirIdx);
				return;
			}
		}
	}

	moveBlockToNewState(
		game: Game,
		gameState: State,
		blockIdx: number,
		dirIdx: number
	) {
		if (this.canBlockMove(gameState, blockIdx, dirIdx)) {
			const hash = this.getZobristHashUpdate(gameState, blockIdx, dirIdx);
			if (hash in game.zhash) {
				return null;
			}
			let hashMirror = 0;
			if (NO_LR_MIRROR_ALLOW) {
				hashMirror = this.getZobristHashUpdate(
					gameState,
					blockIdx,
					dirIdx,
					true
				);
				if (hashMirror in game.zhash) return null;
			}

			const newState = this.copyGameState(gameState);
			const block = newState.blocks[blockIdx];
			const dir = this.directions[dirIdx];
			this.clearPosition(newState, block.shape, block.row!, block.col!);
			this.takePosition(
				newState,
				blockIdx,
				block.shape,
				block.row! + dir.y,
				block.col! + dir.x
			);
			block.row = block.row! + dir.y;
			block.col = block.col! + dir.x;
			newState.blocks[blockIdx] = block;
			newState.step = gameState.step + 1;
			newState.parent = gameState;
			newState.move.blockIdx = blockIdx;
			newState.move.dirIdx = dirIdx;
			newState.hash = hash;
			if (NO_LR_MIRROR_ALLOW) {
				newState.hashMirror = hashMirror;
			}
			return newState;
		}
		return null;
	}

	canBlockMove(state: State, blockIdx: number, dirIdx: number) {
		const block = state.blocks[blockIdx];
		if (block.directions && block.directions.indexOf(dirIdx) === -1) {
			return false;
		}
		const shape = block.shape;
		const dir = this.directions[dirIdx];
		for (let i = 1; i <= shape[0]; ++i) {
			for (let j = 1; j <= shape[1]; ++j) {
				const index0 = block.row! + dir.y + i;
				const index1 = block.col! + dir.x + j;
				const val = state.board[index0][index1];
				if (val !== BOARD_CELL_EMPTY && val !== blockIdx + 1) {
					return false;
				}
			}
		}
		return true;
	}

	copyGameState(gameState: State) {
		let newBoard = [];
		for (let i = 0; i < HRD_BOARD_HEIGHT; ++i) {
			newBoard[i] = gameState.board[i].slice(0);
		}
		let newBlocks: Block[] = [];
		for (let i = 0; i < gameState.blocks.length; ++i) {
			const { shape, directions, row, col, position } = gameState.blocks[i];
			newBlocks[i] = {
				shape: shape.slice(0) as [number, number],
				directions: directions ? directions.slice(0) : undefined,
				position: position.slice(0) as [number, number],
				row,
				col,
			};
		}
		let newTypes: Types = {};
		for (const key in gameState.types) {
			if (Object.prototype.hasOwnProperty.call(gameState.types, key)) {
				newTypes[key] = gameState.types[key];
			}
		}

		const newState: State = {
			...gameState,
			move: {
				...gameState.move,
			},
			board: newBoard,
			blocks: newBlocks,
			types: newTypes,
		};
		return newState;
	}

	addNewStatePattern(game: Game, gameState: State) {
		const l2rHash = gameState.hash;
		if (l2rHash in game.zhash) return false;
		game.zhash[l2rHash] = true;
		let r2lHash = 0;
		if (NO_LR_MIRROR_ALLOW) {
			r2lHash = gameState.hashMirror;
			if (r2lHash in game.zhash) return false;
			game.zhash[r2lHash] = true;
		}
		game.states.push(gameState);
		return true;
	}

	tryBlockContinueMove(
		game: Game,
		gameState: State,
		blockIdx: number,
		lastDirIdx: number
	) {
		for (let i = 0; i < MAX_MOVE_DIRECTION; ++i) {
			if (!this.isReverseDirection(i, lastDirIdx)) {
				const newState = this.moveBlockToNewState(game, gameState, blockIdx, i);
				if (newState && this.addNewStatePattern(game, newState)) {
					newState.step--;
				}
			}
		}
	}

	mergeSteps(steps: Step[]) {
		if (steps.length === 0) return steps;
		let result: Step[] = [];
		result[0] = {
			blockIdx: steps[0].blockIdx,
			dirIdx: steps[0].dirIdx,
			count: 1,
		};
		for (let i = 1; i < steps.length; ++i) {
			let prev = result[result.length - 1];
			let curr = steps[i];
			if (curr.blockIdx === prev.blockIdx && curr.dirIdx === prev.dirIdx) {
				prev.count++;
			} else {
				result.push({ blockIdx: curr.blockIdx, dirIdx: curr.dirIdx, count: 1 });
			}
		}
		return result;
	}

	getDirection(dirIdx: number): Direction {
		return this.directions[dirIdx];
	}
}
