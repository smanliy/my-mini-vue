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
        shapeFlag: getShapeFlag(type),
        key: props && props.key
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
const hasChanged = (oldVal, newVal) => {
    return !Object.is(oldVal, newVal);
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
const EMPTY_OBJ = {};

let activeEffect = null;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn,
            this.scheduler = scheduler; // 保存 scheduler
    }
    run() {
        let result;
        // active控制是否需要收集依赖
        if (!this.active) {
            result = this._fn();
        }
        else {
            shouldTrack = true;
            activeEffect = this;
            result = this._fn();
        }
        // shouldTrack 是一个全局标志，控制是否收集依赖。在副作用函数执行结束后，设置 shouldTrack = false 是为了避免后续的代码（例如副作用函数外的代码）无意中触发依赖收集。如果不把它设置为 false，可能会导致后续的代码不必要地收集依赖，造成不必要的性能开销。
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
        }
    }
    cleanupEffect(effect) {
        effect.deps.forEach((dep) => {
            dep.delete(effect);
        });
        effect.deps.length = 0;
    }
}
function isTracking() {
    return shouldTrack && activeEffect != undefined;
}
//收集依赖
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (activeEffect) {
        //看dep之前有没有添加过，没有添加过就不添加了
        if (dep) {
            if (dep.has(activeEffect))
                return;
            dep.add(activeEffect);
            activeEffect.deps.push(dep);
        }
    }
}
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
function effect(fn, options = {}) {
    // scheduler 是在数据变化时触发的调度器，用来控制副作用函数何时执行。
    const scheduler = options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    //extend
    extend(_effect, options);
    //fn
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isreadonly) {
            //依赖收集
            track(target, key);
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

class RefIml {
    constructor(value) {
        this.__v_isRef = true;
        this._rawvalue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        tarckRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(newValue, this._rawvalue))
            return;
        this._rawvalue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
function ref(raw) {
    return new RefIml(raw);
}
//收集ref相关的依赖
function tarckRefValue(target) {
    if (isTracking()) {
        trackEffects(target.dep);
    }
}
//防止value是嵌套对象(暗含递归)
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
//判断是否是ref对象
function isRef(ref) {
    return !!ref.__v_isRef;
}
//拿取ref（在不知道ref是不是响应式对象的时候用）的值
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
//proxyRefs
//直接获取.value之后的值
function proxyRefs(objectsWithRefs) {
    return new Proxy(objectsWithRefs, {
        get: (target, key) => {
            return unRef(Reflect.get(target, key));
        },
        set: (target, key, value) => {
            if (isRef(target[key]) && !isRef(value)) {
                return Reflect.get(target, key).value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
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
        parent,
        suBTree: {},
        isMounted: false
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
        instance.setupState = proxyRefs(setupResult);
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
    const { createElement: hostCreateElement, pathProp: hostPathProps, insert: hostInsert, remove: hostRemove, setElement: hostSetElementText, } = options;
    function render(n2, container, anchor) {
        patch(null, n2, container, null, null);
    }
    //  函数用于比较新旧虚拟节点，并根据差异进行最小化的 DOM 更新。它接受四个参数：n1 表示旧的虚拟节点，n2 表示新的虚拟节点，container 表示要渲染的容器，parentComponent 表示父组件。
    function patch(n1, n2, container, parentComponent, anchor) {
        // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 如果 vnode 是一个对象，则处理组件
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    // processComponent 函数用于处理组件节点
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    // mountComponent 函数用于挂载组件
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        // 创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 设置组件实例
        setupComponent(instance);
        // 设置渲染效果
        setupRenderEffect(initialVNode, instance, initialVNode, container, anchor);
    }
    // setupRenderEffect 函数用于设置渲染效果
    function setupRenderEffect(n1, instance, n2, container, anchor) {
        effect(() => {
            if (instance.isMounted) {
                const { proxy } = instance;
                // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
                let subTree = {};
                if (typeof instance.render === "function") {
                    subTree = instance.subTree = instance.render.call(proxy);
                }
                // 通过 patch 函数将虚拟节点渲染到 DOM 中
                patch(null, subTree, container, instance, anchor);
                // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
                n2.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
                let subTree = {};
                if (typeof instance.render === "function") {
                    subTree = instance.render.call(proxy);
                }
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                // 通过 patch 函数将虚拟节点渲染到 DOM 中
                patch(preSubTree, subTree, container, instance, anchor);
                // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
            }
        });
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchele", n1, n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 在 Vue 的虚拟 DOM 渲染过程中，第一次渲染时的 n2 会在后续更新过程中作为 n1 传递给相关的函数。这个过程主要体现在 setupRenderEffect 函数中，通过 effect 函数来响应式地更新组件。在初次渲染时，n1 是 null，n2 是新的虚拟节点。在更新渲染时，n1 是旧的虚拟节点，n2 是新的虚拟节点，n2 会作为 n1 传递给相关的函数，以便进行最小化的 DOM 更新。
        //齐天大圣
        const el = (n2.el = n1.el);
        // const el = n1.el;
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        const c1 = n1.children;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                //1.把老的child清空
                unmountChildren(n1.children);
                //2.添加新的text
                if (c1 !== c2) {
                    hostSetElementText(container, c2);
                }
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                //array diff array
                patchKeyedChildren(n1.children, n2.children, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        const l2 = c2.length;
        // 确定需要比较的最小边界
        let border = Math.min(e1, e2);
        // 从头开始比较两个子节点数组
        while (i <= border) {
            const n1 = c1[i];
            const n2 = c2[i];
            // 如果两个节点类型相同，则递归调用 patch 函数进行更新
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                // 如果节点类型不同，则退出循环
                break;
            }
            i++;
        }
        //右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        //新的比旧的多
        if (i > e1) {
            if (i <= e2) {
                const nextPro = e2 + 1;
                // const anchor = i  + 1 > l2? null:c2[nextPro].el
                const anchor = nextPro + 1 < l2 ? c2[nextPro].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        //新的比旧的少
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            //中间对比
            let s1 = i;
            let s2 = i;
            //当所有的新节点已经比对完时，旧节点还有剩余（和新节点比对有差异的部分有剩余），需要删除
            const toBePatched = e2 - s2 + 1;
            let hasPatched = 0;
            let moved = false;
            let maxNewIndexSofar = 0;
            const keyToIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0); //初始化数组
            //建立映射表
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (hasPatched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                //查哦找两种方法，遍历和映射表取决于用户是否设置key
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    //判断是否移动
                    if (newIndex >= maxNewIndexSofar) {
                        maxNewIndexSofar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 加 1 的原因是为了区分未找到的节点和索引为 0 的节点。
                    // 如果不加 1，当索引为 0 时，无法区分是未找到的节点还是索引为 0 的节点。
                    // 通过加 1，可以确保未找到的节点在数组中表示为 0，而索引为 0 的节点表示为 1。
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    hasPatched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            console.log(increasingNewIndexSequence);
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                //锚点等于当前节点的下一个
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (i != increasingNewIndexSequence[j]) {
                        console.log("移动位置");
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function isSomeVNodeType(n1, n2) {
        //type
        return n1.type == n2.type && n1.key == n2.key;
        //key
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            //remove
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps != newProps) {
            for (const key in newProps) {
                const preProp = oldProps[key];
                const nextProp = newProps[key];
                if (preProp !== nextProp) {
                    hostPathProps(el, key, preProp, nextProp);
                }
            }
            if (oldProps != EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        el.removeAttribute(key);
                    }
                }
            }
        }
    }
    // mountElement 函数用于挂载元素节点
    function mountElement(n2, container, parentComponent, anchor) {
        // 创建元素节点
        const el = (n2.el = hostCreateElement(n2.type));
        const { shapeFlag } = n2;
        const { children } = n2;
        // 处理元素的子节点
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.innerHTML = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(n2.children, el, parentComponent, anchor);
        }
        const { props } = n2;
        //props
        // 处理元素的属性
        for (const key in props) {
            const val = props[key];
            hostPathProps(el, key, null, val);
        }
        // 将元素添加到容器中
        // container.append(el);
        hostInsert(el, container, anchor);
    }
    // mountChildren 函数用于挂载子节点
    function mountChildren(children, el, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, el, parentComponent, anchor);
        });
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        //注释?
        const testNode = (n2.el = document.createTextNode(children));
        container.append(testNode);
    }
    return { createApp: createAppApi(render) };
}
function getSequence(arr) {
    if (arr.length === 0)
        return [];
    const dp = new Array(arr.length).fill(1);
    const prev = new Array(arr.length).fill(-1);
    let res = 1;
    let resIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < i; j++) {
            if (arr[i] > arr[j]) {
                if (dp[i] < dp[j] + 1) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }
        }
        if (res < dp[i]) {
            res = dp[i];
            resIndex = i;
        }
    }
    const lisIndices = [];
    for (let i = resIndex; i >= 0; i = prev[i]) {
        lisIndices.push(i);
        if (prev[i] === -1)
            break;
    }
    lisIndices.reverse();
    return lisIndices;
}

function createElement(type) {
    return document.createElement(type);
}
function pathProp(el, key, preVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        console.log(key);
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        el.setAttribute(key, nextVal);
    }
}
function insert(el, container, anchor) {
    // container.append(el)
    container.insertBefore(el, anchor);
}
function setElement(el, text) {
    el.textContent = text;
}
const render = createRender({
    createElement,
    pathProp,
    insert,
    remove,
    setElement
});
function createApp(...args) {
    return render.createApp(...args);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}

export { createApp, createRender, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
