import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Text, Fragment } from "./createVNode";
// render 函数用于渲染虚拟节点到指定的容器中
export function createRender(options: any) {
  const { createElement:hostCreateElement, pathProp:hostPathProps, insert:hostInsert } = options;

  function render(n2: any, container: any) {
    patch(null,n2, container, null);
  }
  // patch 函数用于判断虚拟节点的类型，并调用相应的处理函数
  function patch(n1:any,n2:any, container: any, parentComponent: any) {
    // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1,n2, container, parentComponent);
        break;
      case Text:
        processText(n1,n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1,n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 如果 vnode 是一个对象，则处理组件
          processComponent(n1,n2, container, parentComponent);
        }
        break;
    }
  }
  // processComponent 函数用于处理组件节点
  function processComponent(n1:any,n2: any, container: any, parentComponent: any) {
    mountComponent(n2,container, parentComponent);
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
    setupRenderEffect(initialVNode,instance, initialVNode, container);
  }
  // setupRenderEffect 函数用于设置渲染效果
  function setupRenderEffect(n1:any,instance: any, n2: any, container: any) {
    effect(()=>{if(instance.isMounted){
      const { proxy } = instance;
      // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
      let subTree = {} as any;
      if (typeof instance.render === "function") {
        subTree =instance.subTree = instance.render.call(proxy);
      }
  
      // 通过 patch 函数将虚拟节点渲染到 DOM 中
      patch(null,subTree, container, instance);
  
      // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
      n2.el = subTree.el;
      instance.isMounted = true;
    }else{
      const { proxy } = instance;
      // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
      let subTree = {} as any;
      if (typeof instance.render === "function") {
        subTree = instance.render.call(proxy);
      }
      const preSubTree = instance.subTree;
      instance.subTree = subTree;
      // 通过 patch 函数将虚拟节点渲染到 DOM 中
      patch(preSubTree,subTree, container, instance);
  
      // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
      // n2.el = subTree.el;

    }
  })

  }

  function processElement(n1:any,n2: any, container: any, parentComponent: any) {
    if(!n1){
      mountElement(n2, container, parentComponent);
    }else{
      patchElement(n1,n2, container);
    }

  }

  function patchElement(n1:any,n2: any, container: any) {
    console.log("patchele",n1,n2)

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

      hostPathProps(el, key, val);
    }
    // 将元素添加到容器中
    // container.append(el);
    hostInsert(el, container);
  }
  // mountChildren 函数用于挂载子节点
  function mountChildren(n2: any, el: any, parentComponent: any) {
    n2.children.forEach((v: any) => {
      patch(null,v, el, parentComponent);
    });
  }
  function processFragment(n1:any,n2: any, container: any, parentComponent: any) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1:any,n2: any, container: any) {
    const { children } = n2;
    //注释?
    const testNode = (n2.el = document.createTextNode(children));

    container.append(testNode);
  }
  return { createApp: createAppApi(render) };
}
