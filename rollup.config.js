import pkg from './package.json' assert { type: 'json' };
import typescript from '@rollup/plugin-typescript'
export default{
    input:"./src/index.ts",
    output:[
        //1. cjs ——>  node.js的commonjs规范
        //2.esm 
        {
            format:'cjs',
            file:pkg.main
        },
        {
            format:'es',
            file:pkg.module
        },
    ]
,
//用ts写的，不理解Ts需要编译一下
    plugins:[
        typescript()
    ]
}