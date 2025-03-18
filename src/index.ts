//作为Mini-vue的出口

export * from "./runtime-dom";

export * from "./runtime-core";

export * from "./reactivity";

import { baseCompile } from "./example/compiler-core/src";

import * as runtimeDom from './runtime-dom'

import{registerRuntimeCompiler } from "./runtime-dom";
function compileToFucntion(template: any) {
  const { code } = baseCompile(template);
//   作为动态函数的参数名 → new Function("Vue", code) 生成一个匿名函数，该函数接受 Vue 作为参数。
// 在 code 代码中被引用 → code 里用到的 Vue.xxx 其实是参数 Vue，即 runtimeDom。
// 让 code 里的 Vue 可变 → 这样 code 可以适配不同的 Vue 运行时（如 runtime-core、runtime-dom、SSR 运行时等）。
  const render = new Function("Vue", code)(runtimeDom)
  return render
}
registerRuntimeCompiler(compileToFucntion)