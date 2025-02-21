 const publicPropertiesMap ={
    $el:(i:any)=>i.node.el
 }
 export const publicInstanceProxyHandlers = {
    get:({_:instance}:{_:any},key:any)=>{
        const {setupState} = instance;
        if(key in setupState){
            debugger;
            return setupState[key]
        }
        const publicGetter = publicPropertiesMap[key as keyof typeof publicPropertiesMap]

        if(publicGetter){
            return publicGetter(instance)
        }
    }
 }