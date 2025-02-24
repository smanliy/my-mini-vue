export function initSlots(instance:any,children:any){

    normalizeObjectSlots(children,instance.slots) 
}

function normalizeSlotValue(val:any){
    
    return Array.isArray(val) ? val :[val]
}

function normalizeObjectSlots(children:any,slots:any){

    for (const key in children) {
       const val = children[key];
       slots[key] =  normalizeSlotValue(val)
    }
}