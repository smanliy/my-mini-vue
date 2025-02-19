//根据虚拟节点创建组件实例
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type:vnode.type
    }

    return component
}

//用于设置组件实例的相关属性。这里可以做很多初始化工作
export function setupComponent(instance:any){
    //TODO

    //initProps()

    //initSlots()

    //对于有状态的组件（即类组件），会调用 setupStatefulComponent 来设置组件实例的状态。
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:any) {
    const Component = instance.vnode.type // 组件对象

    const {setup} = Component

    if(setup){
        //setuop可以返回function | Object ,如果返回fnction，就认为返回的是组件的渲染函数，如果返回object,将他注入到当前组件上下文中
        const setupResult = setup()

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

