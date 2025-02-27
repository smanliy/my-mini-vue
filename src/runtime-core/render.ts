import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Text, Fragment } from "./createVNode";
// render 函数用于渲染虚拟节点到指定的容器中
export function createRender(options: any) {
  const {
    createElement: hostCreateElement,
    pathProp: hostPathProps,
    insert: hostInsert,
  } = options;

  function render(n2: any, container: any) {
    patch(null, n2, container, null);
  }
  // patch 函数用于判断虚拟节点的类型，并调用相应的处理函数
  function patch(n1: any, n2: any, container: any, parentComponent: any) {
    // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 如果 vnode 是一个对象，则处理组件
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }
  // processComponent 函数用于处理组件节点
  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    mountComponent(n2, container, parentComponent);
  }
  // mountComponent 函数用于挂载组件
  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent: any
  ) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 设置组件实例
    setupComponent(instance);
    // 设置渲染效果
    setupRenderEffect(initialVNode, instance, initialVNode, container);
  }
  // setupRenderEffect 函数用于设置渲染效果
  function setupRenderEffect(n1: any, instance: any, n2: any, container: any) {
    effect(() => {
      if (instance.isMounted) {
        const { proxy } = instance;
        // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
        let subTree = {} as any;
        if (typeof instance.render === "function") {
          subTree = instance.subTree = instance.render.call(proxy);
        }

        // 通过 patch 函数将虚拟节点渲染到 DOM 中
        patch(null, subTree, container, instance);

        // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
        n2.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
        let subTree = {} as any;
        if (typeof instance.render === "function") {
          subTree = instance.render.call(proxy);
        }
        const preSubTree = instance.subTree;
        instance.subTree = subTree;
        // 通过 patch 函数将虚拟节点渲染到 DOM 中
        patch(preSubTree, subTree, container, instance);

        // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
      }
    });
  }

  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1: any, n2: any, container: any) {
    console.log("patchele", n1, n2);
    const oldProps = n1.props || EMPTY_OBJ;

    const newProps = n2.props || EMPTY_OBJ;
    // 在 Vue 的虚拟 DOM 渲染过程中，第一次渲染时的 n2 会在后续更新过程中作为 n1 传递给相关的函数。这个过程主要体现在 setupRenderEffect 函数中，通过 effect 函数来响应式地更新组件。在初次渲染时，n1 是 null，n2 是新的虚拟节点。在更新渲染时，n1 是旧的虚拟节点，n2 是新的虚拟节点，n2 会作为 n1 传递给相关的函数，以便进行最小化的 DOM 更新。
    //齐天大圣
    const el = (n2.el = n1.el);
    // console.log("添加n2",n1.el === n2.el)
    // const el =  n1.el
    // console.log("不添加n2",n1.el === n2.el)
    // console.log("n1.el",n1.el)
    // console.log("n2.el",n2.el)
    // console.log(el)
    patchProps(el, oldProps, newProps);
  }
  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps != newProps) {
      for (const key in newProps) {
        const preProp = oldProps[key];

        const nextProp = newProps[key];

        if (preProp !== nextProp) {
          hostPathProps(el, key, preProp, nextProp);
        }
      }
      if(oldProps != EMPTY_OBJ){
        for (const key in oldProps) {
          if (!(key in newProps)) {
            el.removeAttribute(key);
          }
        }
      }

    }
  }

  // mountElement 函数用于挂载元素节点
  function mountElement(n2: any, container: any, parentComponent: any) {
    // 创建元素节点
    const el = (n2.el = hostCreateElement(n2.type));
    const { shapeFlag } = n2;
    const { children } = n2;
    // 处理元素的子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerHTML = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(n2, el, parentComponent);
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
    hostInsert(el, container);
  }
  // mountChildren 函数用于挂载子节点
  function mountChildren(n2: any, el: any, parentComponent: any) {
    n2.children.forEach((v: any) => {
      patch(null, v, el, parentComponent);
    });
  }
  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    //注释?
    const testNode = (n2.el = document.createTextNode(children));

    container.append(testNode);
  }
  return { createApp: createAppApi(render) };
}
