import { createVNode } from "./createVNode"

export function createAppApi (render:any){
    return function createApp(rootComponent:any){
        return{
            mount(rootContainer:any){
                const vnode = createVNode(rootComponent);
                render(vnode,rootContainer);
            }
        }
    }
}




