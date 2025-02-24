import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance:any,children:any){
    const {vnode} = instance
    if(vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN){
        normalizeObjectSlots(children,instance.slots) 
    }

}

function normalizeSlotValue(val:any){
    
    return Array.isArray(val) ? val :[val]
}

function normalizeObjectSlots(children:any,slots:any){

    for (const key in children) {
       const val = children[key];
       slots[key] = (props:any)=> normalizeSlotValue(val(props))
    }
}