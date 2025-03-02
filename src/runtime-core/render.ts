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
    remove: hostRemove,
    setElement: hostSetElementText,
  } = options;

  function render(n2: any, container: any,anchor:any) {
    patch(null, n2, container, null,null);
  }
  //  函数用于比较新旧虚拟节点，并根据差异进行最小化的 DOM 更新。它接受四个参数：n1 表示旧的虚拟节点，n2 表示新的虚拟节点，container 表示要渲染的容器，parentComponent 表示父组件。
  function patch(n1: any, n2: any, container: any, parentComponent: any,anchor:any) {
    // 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent,anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent,anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 如果 vnode 是一个对象，则处理组件
          processComponent(n1, n2, container, parentComponent,anchor);
        }
        break;
    }
  }
  // processComponent 函数用于处理组件节点
  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
    mountComponent(n2, container, parentComponent,anchor);
  }
  // mountComponent 函数用于挂载组件
  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 设置组件实例
    setupComponent(instance);
    // 设置渲染效果
    setupRenderEffect(initialVNode, instance, initialVNode, container,anchor);
  }
  // setupRenderEffect 函数用于设置渲染效果
  function setupRenderEffect(n1: any, instance: any, n2: any, container: any,anchor:any) {
    effect(() => {
      if (instance.isMounted) {
        const { proxy } = instance;
        // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
        let subTree = {} as any;
        if (typeof instance.render === "function") {
          subTree = instance.subTree = instance.render.call(proxy);
        }

        // 通过 patch 函数将虚拟节点渲染到 DOM 中
        patch(null, subTree, container, instance,anchor);

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
        patch(preSubTree, subTree, container, instance,anchor);

        // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
      }
    });
  }

  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent,anchor);
    } else {
      patchElement(n1, n2, container, parentComponent,anchor);
    }
  }

  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
    console.log("patchele", n1, n2);
    const oldProps = n1.props || EMPTY_OBJ;

    const newProps = n2.props || EMPTY_OBJ;
    // 在 Vue 的虚拟 DOM 渲染过程中，第一次渲染时的 n2 会在后续更新过程中作为 n1 传递给相关的函数。这个过程主要体现在 setupRenderEffect 函数中，通过 effect 函数来响应式地更新组件。在初次渲染时，n1 是 null，n2 是新的虚拟节点。在更新渲染时，n1 是旧的虚拟节点，n2 是新的虚拟节点，n2 会作为 n1 传递给相关的函数，以便进行最小化的 DOM 更新。
    //齐天大圣
    const el = (n2.el = n1.el);
    // const el = n1.el;
    patchChildren(n1, n2, el, parentComponent,anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
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
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent,anchor);
      } else {
        //array diff array
        patchKeyedChildren(n1.children, n2.children, container, parentComponent,anchor);
      }
    }
  }
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    const l2 =c2.length
  // 确定需要比较的最小边界
    let border = Math.min(e1, e2);

  // 从头开始比较两个子节点数组
    while (i <= border) {
      const n1 = c1[i];
      const n2 = c2[i];
  // 如果两个节点类型相同，则递归调用 patch 函数进行更新
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent,anchor);
      } else {
  // 如果节点类型不同，则退出循环
        break;
      }
      i++;
    }
    //右侧
    while(i <= e1 && i <= e2){
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSomeVNodeType(n1,n2)){
        patch(n1, n2, container, parentComponent,anchor);
      }else{
        break
      }
      e1--
      e2--
    }
//新的比旧的多
    if(i > e1 ){
      if(i <= e2){
        const nextPro =  e2 + 1;
        // const anchor = i  + 1 > l2? null:c2[nextPro].el
        const anchor = nextPro + 1< l2? c2[nextPro].el:null
        while(i<=e2){
          patch(null,c2[i],container,parentComponent,anchor)
          i++
        }

      }

  }
  //新的比旧的少
  else if(i > e2){
    while(i <= e1){
      hostRemove(c1[i].el)
      i++
    }
  }else{
    //中间对比
    let s1 = i;
    let s2 = i;
//当所有的新节点已经比对完时，旧节点还有剩余（和新节点比对有差异的部分有剩余），需要删除
    const toBePatched = e2 - s2 + 1
    let hasPatched = 0
    const keyToIndexMap = new Map()
    //建立映射表
    for(let i = s2;i <= e2;i++){
      const nextChild = c2[i];

      keyToIndexMap.set(nextChild.key,i)
    }

    for (let i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      if(hasPatched >= toBePatched) {
        hostRemove(prevChild.el)
        continue
      }
      
      //查哦找两种方法，遍历和映射表取决于用户是否设置key
      let newIndex
      if(prevChild.key != null){
        newIndex = keyToIndexMap.get(prevChild.key)
      }else{


        for(let j = s2;j < e2;j++){
          if(isSomeVNodeType(prevChild,c2[j])){
            newIndex = j
            break
          }
        }
      }


      if(newIndex === undefined){
        hostRemove(prevChild.el)
      }else{
        patch(prevChild,c2[newIndex],container,parentComponent,null)
        hasPatched++
      }
    }
  }
  }

  function isSomeVNodeType(n1: any, n2: any) {
    //type
    return n1.type == n2.type && n1.key == n2.key;
    //key
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      //remove
      hostRemove(el);
    }
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
  function mountElement(n2: any, container: any, parentComponent: any,anchor:any) {
    // 创建元素节点
    const el = (n2.el = hostCreateElement(n2.type));
    const { shapeFlag } = n2;
    const { children } = n2;
    // 处理元素的子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerHTML = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(n2.children, el, parentComponent,anchor);
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
    hostInsert(el, container,anchor);
  }
  // mountChildren 函数用于挂载子节点
  function mountChildren(children: any, el: any, parentComponent: any,anchor:any) {
    children.forEach((v: any) => {
      patch(null, v, el, parentComponent,anchor);
    });
  }
  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor:any
  ) {
    mountChildren(n2.children, container, parentComponent,anchor);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    //注释?
    const testNode = (n2.el = document.createTextNode(children));

    container.append(testNode);
  }
  return { createApp: createAppApi(render) };
}
