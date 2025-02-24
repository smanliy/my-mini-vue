import { createVNode } from "../createVNode";

export function renderSlots(slots:any,name:any){
    const slot = slots[name]
    if(slot){
        return createVNode("div",{},slot)
    }

}