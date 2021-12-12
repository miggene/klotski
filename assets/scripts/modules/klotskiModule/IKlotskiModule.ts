import { Shape } from '../../libs/Klotski';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-12 11:17:27
 * @LastEditTime: 2021-12-12 11:17:28
 * @LastEditors: zhupengfei
 * @Description:KlotskiModule模块中的接口
 * @FilePath: /klotski/assets/scripts/modules/klotskiModule/IKlotskiModule.ts
 */
export interface IFood {
	name: string;
	shape: Shape;
}
