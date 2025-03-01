import { ShapeFlags } from "../shared/shapeFlags"

export const Fragment = Symbol("Fragment")

export const Text = Symbol("Text")
export function createVNode(type:any,props?:any,children?:any){

    const vnode = {
        type,
        props,
        children,
        el:null,
        shapeFlag:getShapeFlag(type),
        key:props && props.key 
    }
    //children
    if(typeof children === "string"){
        vnode.shapeFlag|= ShapeFlags.TEXT_CHILDREN
    }else if(Array.isArray(children)){vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN}
    //组件类型 + children object
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    ){
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