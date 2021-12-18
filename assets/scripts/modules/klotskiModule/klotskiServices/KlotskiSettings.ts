/*
 * @Author: zhupengfei
 * @Date: 2021-12-18 15:15:55
 * @LastEditTime: 2021-12-18 17:16:09
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/klotskiServices/KlotskiSettings.ts
 */
export const G_BOARD_X = 4;
export const G_BOARD_Y = 5;
export const G_BOARD_SIZE = G_BOARD_X * G_BOARD_Y; //board size

export const G_VOID_CHAR = '?';
export const G_EMPTY_CHAR = '@';

export const G_EMPTY_BLOCK = 1; //gBlockBelongTo index 1 ('@')
export const G_GOAL_BLOCK = 2; //gBlockBelongTo index 2 ('A')
export const G_GOAL_STYLE = 4; //index of gBlockStyle for goal block
//convert char to index of block style
//ASCII char   :       ?, @,  A,  B,C,D,E,F,G,  H,I,J,K,L,M,  N,O,P,Q,R,S,T,U,V,W,X,Y,Z,[
export const gBlockBelongTo = [
	-1, 0, 4, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1, 1, 1,
];
//block style:[x size, y size]
export const gBlockStyle = [
	[1, 1],
	[1, 1],
	[2, 1],
	[1, 2],
	[2, 2],
];
export const gGoalPos = [
	[1, 4],
	[2, 4],
]; //goal position: [x,y]

//0   1   2   3   4
export const gBlockStartStyle = ['@', 'N', 'B', 'H', 'A'];
