// import { createApp } from "./createApp";
import { h } from "./h";
import { renderSlots } from "./helpers/renderSlots";
import { createTextVNode } from "./createVNode";
import { getCurrentInstance } from "./component";
import {provide,inject} from "./helpers/apiInject"
import { createRender } from "./render";

export {h,renderSlots,createTextVNode,getCurrentInstance,provide,inject,createRender}