import { createVNode } from "./createVNode"
import { render } from "./render"

export function createApp(rootComponent:any){
    return{
        // 将根组件转换为虚拟节点，然后将其渲染到指定的 DOM 容器中。
        mount(rootContainer:any){


            //component   ----> vNode
            //转换成虚拟节点 都会给予虚拟节点做处理
            const vnode = createVNode(rootComponent)



            render(vnode, rootContainer)
        }
    }
}


