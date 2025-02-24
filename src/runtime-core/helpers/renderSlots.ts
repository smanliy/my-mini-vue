import { createVNode, Fragment } from "../createVNode";

export function renderSlots(slots:any,name:any,props:any){
    const slot = slots[name]
    if(slot){
        if(typeof slot == "function"){
            return createVNode(Fragment,{},slot(props))
        }

    }

}