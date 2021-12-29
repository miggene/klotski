/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:31:05
 * @LastEditTime: 2021-12-19 17:53:49
 * @LastEditors: zhupengfei
 * @Description: KlotskiModule config
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/KlotskiModuleCfg.ts
 */

export const CELL_W = 126; //格子宽
export const CELL_H = 126; //格子高
export const BLOCK_CELL_SIZE = 126; //移动时每次移动距离
export const ONE_STEP_MOVE_TIME = 0.17; //sec
export const BOARD_W = 4; //列数
export const BOARD_H = 5; //行数
export const BOARD_SIZE = BOARD_W * BOARD_H; //总格子数
export const TOTAL_W = BOARD_W * CELL_W; //行宽
export const TOTAL_H = BOARD_H * CELL_H; //列高

export const FOOD_PATH = 'prefabs/FoodPrefab';
export const HRD_FOODS_JSON_PATH = 'datas/hrd_foods';
export const BLOCK_SPRITE_FRAME_PATH = 'foods/';
