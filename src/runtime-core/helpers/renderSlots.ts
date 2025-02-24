import { createVNode } from "../createVNode";

export function renderSlots(slots:any){
    return createVNode("div",{},slots)
}