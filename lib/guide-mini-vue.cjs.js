'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 16] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
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
    //组件类型 + children object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot == "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (obj) => {
    return obj != null && typeof obj == 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// capitalize 函数用于将字符串的首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
// toHandlerKey 函数用于将事件名称转换为事件处理函数的键名 
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

//收集依赖
const targetMap = new Map();
//触发依赖
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    if (!dep)
        return;
    triggerEffects(dep);
}
function triggerEffects(dep) {
    if (dep) {
        for (const effect of dep) {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        }
    }
}

//重构优化，避免每次都要创建get
const get = createGetter(false);
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = function (target, key, value) {
    console.warn(`${target}的${String(key)}属性被设置为只读属性`);
    return true;
};
// shallowReadonly 是一种浅层只读的响应式处理器。它的作用是将对象的顶层属性设置为只读，但不递归地将嵌套的对象属性设置为只读。这意味着只有对象的第一层属性是只读的，而嵌套的对象属性仍然是可变的。
const shallowReadonlyGet = createGetter(true, true);
//isreadyonly -----> 决定是否收集依赖
function createGetter(isreadonly, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (shallow)
            return res;
        //readonly 和reactive嵌套对象转换功能
        if (isObject(res))
            return isreadonly ? readonly(res) : reactive(res);
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isreadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isreadonly;
        }
        return res;
    };
}
//创建setter
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
//reactive的proxy处理器
const mutableHandlers = {
    get: get,
    set: set
};
//readonly的proxy处理器
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet
};
//shallowReadonlyHanslers的处理器
const shallowReadonlyBaseHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createProxyObject(raw, mutableHandlers);
}
//isreadonly
function readonly(raw) {
    return createProxyObject(raw, readonlyHandlers);
}
//创建proxy对象
function createProxyObject(raw, handlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not a object`);
        return raw;
    }
    return new Proxy(raw, handlers);
}
function shallowReadonly(raw) {
    return createProxyObject(raw, shallowReadonlyBaseHandlers);
}

// emit 函数用于触发组件实例上的事件
function emit(instance, e, ...args) {
    console.log("emit", e);
    const { props } = instance;
    //TPP
    //先去写一个特定的行为，重构成通用的行为
    // 将事件名称转换为事件处理函数的键名
    const handlerName = toHandlerKey(camelize(e));
    // 从组件实例的 props 中获取对应的事件处理函数
    const handler = props[handlerName];
    // 如果事件处理函数存在，则调用该函数
    handler & handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicInstanceProxyHandlers = {
    get: ({ _: instance }, key) => {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val];
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const val = children[key];
        slots[key] = (props) => normalizeSlotValue(val(props));
    }
}

// component.ts 文件主要负责创建和设置组件实例
//根据虚拟节点创建组件实例
function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode, //虚拟节点
        type: vnode.type, //组件类型
        setupState: {}, //组件的状态
        el: null, //组件的DOM元素,
        slots: {},
        props: {},
        emit: () => { },
        providers: parent ? parent.providers : {},
        parent
    };
    component.emit = emit.bind(null, component);
    return component;
}
//用于设置组件实例的相关属性。
function setupComponent(instance) {
    //TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        currentInstance = null;
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { providers } = currentInstance;
        // 获取父组件的 providers 对象
        const parentProvides = currentInstance.parent.providers;
        // 如果当前组件实例的 providers 对象与父组件的 providers 对象相同
        if (providers === parentProvides) {
            // 创建一个新的 providers 对象，并将其原型设置为父组件的 providers 对象
            providers = currentInstance.providers = Object.create(parentProvides);
        }
        providers[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // 获取父组件的 providers 对象
        const parentProvides = currentInstance.parent.providers;
        if (key in parentProvides) {
            // 返回父组件的 providers 对象中的值
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
        }
        else {
            // 如果没有找到该键，则返回默认值
            return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

// render 函数用于渲染虚拟节点到指定的容器中
function createRender(options) {
    const { createElement, pathProp, insert } = options;
    function render(vnode, container) {
        patch(vnode, container, null);
    }
    // patch 函数用于判断虚拟节点的类型，并调用相应的处理函数
    function patch(vnode, container, parentComponent) {
        // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
        const { type, shapeFlag } = vnode;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 如果 vnode 是一个对象，则处理组件
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    // processComponent 函数用于处理组件节点
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    // mountComponent 函数用于挂载组件
    function mountComponent(initVnode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initVnode, parentComponent);
        // 设置组件实例
        setupComponent(instance);
        // 设置渲染效果
        setupRenderEffect(instance, initVnode, container);
    }
    // setupRenderEffect 函数用于设置渲染效果
    function setupRenderEffect(instance, initVnode, container) {
        const { proxy } = instance;
        // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
        let subTree = {};
        if (typeof instance.render === "function") {
            subTree = instance.render.call(proxy);
        }
        // 通过 patch 函数将虚拟节点渲染到 DOM 中
        patch(subTree, container, instance);
        // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
        initVnode.el = subTree.el;
    }
    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }
    // mountElement 函数用于挂载元素节点
    function mountElement(vnode, container, parentComponent) {
        // 创建元素节点
        const el = (vnode.el = createElement(vnode.type));
        const { shapeFlag } = vnode;
        const { children } = vnode;
        // 处理元素的子节点
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.innerHTML = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent);
        }
        const { props } = vnode;
        //props
        // 处理元素的属性
        for (const key in props) {
            const val = props[key];
            pathProp(el, key, val);
        }
        // 将元素添加到容器中
        // container.append(el);
        insert(el, container);
    }
    // mountChildren 函数用于挂载子节点
    function mountChildren(vnode, el, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, el, parentComponent);
        });
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    function processText(vnode, container) {
        const { children } = vnode;
        //注释?
        const testNode = (vnode.el = document.createTextNode(children));
        container.append(testNode);
    }
    return { createApp: createAppApi(render) };
}

function createElement(type) {
    return document.createElement(type);
}
function pathProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        console.log(key);
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, container) {
    container.append(el);
}
const render = createRender({
    createElement,
    pathProp,
    insert
});
function createApp(...args) {
    return render.createApp(...args);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
