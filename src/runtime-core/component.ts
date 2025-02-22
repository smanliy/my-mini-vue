import { shallowReadonly } from "../reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
// component.ts 文件主要负责创建和设置组件实例
//根据虚拟节点创建组件实例
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,//虚拟节点
        type:vnode.type,//组件类型
        setupState:{},//组件的状态
        el:null//组件的DOM元素,
        ,
        props:{}
    }

    return component
}

//用于设置组件实例的相关属性。
export function setupComponent(instance:any){
    //TODO

    initProps(instance,instance.vnode.props)

    //initSlots()

    //设置有状态组件的状态
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:any) {
    const Component = instance.vnode.type // 从虚拟节点中获取组件对象
    //创建组件的代理对象处理组件实例的属性访问
    instance.proxy = new Proxy({_:instance},publicInstanceProxyHandlers)
    const {setup} = Component

    if(setup){
        //setuoup可以返回function | Object ,如果返回fnction，就认为返回的是组件的渲染函数，如果返回object,将他注入到当前组件上下文中
        const setupResult = setup(shallowReadonly(instance.props))

        handleSetupResult(instance,setupResult)
    }
}
// 这个函数处理 setup 返回的结果。setup 方法可以返回一个对象或函数
function handleSetupResult(instance:any,setupResult: any) {
    //function object
    //TODO function


    // setup 返回的是一个对象，包含了组件的响应式状态、计算属性和方法等。Vue 会将这个对象赋值给组件实例的 setupState 属性，从而使得这些状态、计算属性等可以通过组件实例访问。
    if(typeof setupResult === "object"){
        instance.setupState = setupResult
    }
    //保证组件的render一定是有值的
    finishComponentSetup(instance)
}
//finishComponentSetup 会被调用来完成组件的其他初始化操作（比如绑定渲染函数等）
function finishComponentSetup(instance: any) {
    const Component = instance.type


    if(Component.render){
        instance.render = Component.render
    }
}

