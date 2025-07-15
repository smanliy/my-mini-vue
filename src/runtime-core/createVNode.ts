import { ShapeFlags } from "../shared/shapeFlags"

export const Fragment = Symbol("Fragment")

export const Text = Symbol("Text")

export {
    createVNode as createElementVNode
}
export function createVNode(type:any,props?:any,children?:any){

    const vnode = {
        type,
        props,
        children,
        component:null,
        el:null,
        shapeFlag:getShapeFlag(type),
        key:props && props.key ,
        KeepAliveInstance:null
    }
    //children
    if(typeof children === "string"){
        //子元素是文本
        vnode.shapeFlag|= ShapeFlags.TEXT_CHILDREN
    }else if(Array.isArray(children)){
        //子元素是数组
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    //父元素是组件
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    ){
        //子元素是插槽
        if(typeof children === "object"){
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }
    return vnode
}

function getShapeFlag(type:any){
    return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode(text:string){
    return createVNode(Text,{},text)
}