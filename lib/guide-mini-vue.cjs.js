'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    //children
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandlers = {
    get: ({ _: instance }, key) => {
        const { setupState } = instance;
        if (key in setupState) {
            debugger;
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

// component.ts 文件主要负责创建和设置组件实例
//根据虚拟节点创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode, //虚拟节点
        type: vnode.type, //组件类型
        setupState: {}, //组件的状态
        el: null //组件的DOM元素
    };
    return component;
}
//用于设置组件实例的相关属性。
function setupComponent(instance) {
    //TODO
    //initProps()
    //initSlots()
    //设置有状态组件的状态
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type; // 从虚拟节点中获取组件对象
    //创建组件的代理对象处理组件实例的属性访问
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        //setuoup可以返回function | Object ,如果返回fnction，就认为返回的是组件的渲染函数，如果返回object,将他注入到当前组件上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
// 这个函数处理 setup 返回的结果。setup 方法可以返回一个对象或函数
function handleSetupResult(instance, setupResult) {
    //function object
    //TODO function
    // setup 返回的是一个对象，包含了组件的响应式状态、计算属性和方法等。Vue 会将这个对象赋值给组件实例的 setupState 属性，从而使得这些状态、计算属性等可以通过组件实例访问。
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    //保证组件的render一定是有值的
    finishComponentSetup(instance);
}
//finishComponentSetup 会被调用来完成组件的其他初始化操作（比如绑定渲染函数等）
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

// render 函数用于渲染虚拟节点到指定的容器中
function render(vnode, container) {
    patch(vnode, container);
}
// patch 函数用于判断虚拟节点的类型，并调用相应的处理函数
function patch(vnode, container) {
    // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 如果 vnode 是一个对象，则处理组件
        processComponent(vnode, container);
    }
}
// processComponent 函数用于处理组件节点
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// mountComponent 函数用于挂载组件
function mountComponent(initVnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initVnode);
    // 设置组件实例
    setupComponent(instance);
    // 设置渲染效果
    setupRenderEffect(instance, initVnode, container);
}
// setupRenderEffect 函数用于设置渲染效果
function setupRenderEffect(instance, initVnode, container) {
    const { proxy } = instance;
    // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
    const subTree = instance.render.call(proxy);
    // 通过 patch 函数将虚拟节点渲染到 DOM 中
    patch(subTree, container);
    // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
    initVnode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// mountElement 函数用于挂载元素节点
function mountElement(vnode, container) {
    // 创建元素节点
    const el = (vnode.el = document.createElement(vnode.type));
    const { shapeFlag } = vnode;
    const { children } = vnode;
    // 处理元素的子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.innerHTML = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el);
    }
    const { props } = vnode;
    //props
    // 处理元素的属性
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        el.setAttribute(key, val);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            console.log(key);
            el.addEventListener(event, val);
        }
    }
    // 将元素添加到容器中
    container.append(el);
}
// mountChildren 函数用于挂载子节点
function mountChildren(vnode, el) {
    vnode.children.forEach((v) => {
        patch(v, el);
    });
}

function createApp(rootComponent) {
    return {
        // 将根组件转换为虚拟节点，然后将其渲染到指定的 DOM 容器中。
        mount(rootContainer) {
            //component   ----> vNode
            //转换成虚拟节点 都会给予虚拟节点做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
