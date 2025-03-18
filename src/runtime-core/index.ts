// import { createApp } from "./createApp";
import { h } from "./h";
import { renderSlots } from "./helpers/renderSlots";
import { createTextVNode,createElementVNode } from "./createVNode";
import { getCurrentInstance ,registerRuntimeCompiler} from "./component";
import {provide,inject} from "./helpers/apiInject"
import { createRender } from "./render";
export {toDisplayString} from '../shared/toDisplayString'


export {h,renderSlots,createTextVNode,getCurrentInstance,provide,inject,createRender,registerRuntimeCompiler,createElementVNode}