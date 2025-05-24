import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppApi } from "./createApp";
import { Text, Fragment } from "./createVNode";
import { queneJobs } from "./scheduler";
// render 函数用于渲染虚拟节点到指定的容器中
export function createRender(options: any) {
  const {
    createElement: hostCreateElement,
    pathProp: hostPathProps,
    insert: hostInsert,
    remove: hostRemove,
    setElement: hostSetElementText,
  } = options;
  // 生成一个虚拟 DOM（subTree）。此时，render 函数的上下文是 proxy，即组件的代理对象，包含了组件的所有响应式数据和方法。
  function render(n2: any, container: any) {
    patch(null, n2, container, null, null);
  }
  //  函数用于比较新旧虚拟节点，并根据差异进行最小化的 DOM 更新。它接受四个参数：n1 表示旧的虚拟节点，n2 表示新的虚拟节点，container 表示要渲染的容器，parentComponent 表示父组件。
  function patch(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const shouldRender = !n2.props || n2.props['v-if'] == true 
    //调试部分
    // console.log('n2',n2)
    // console.log('before patch n2.props:', n2.props);
    // console.log('n2.props',n2.props)
    // console.log('after patch n2.props:', n2.props);
    // console.log('v-if',n2.props ? n2.props['v-if'] : undefined)
    if(n2.props && Object.keys(n2.props).length != 0 && !shouldRender){
      return 
    }


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
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 如果 vnode 是一个对象，则处理组件
          processComponent(n1, n2, container, parentComponent, anchor);
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
    anchor: any
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1: any, n2: any) {
    const instance = (n2.component = n1.component);

    // 判断是否需要更新组件
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      // **组件不需要更新**
      // 直接复用旧的 `el`
      n2.el = n1.el;
      // 更新组件实例的 vnode，保证 next 不是 undefined
      instance.vnode = n2;
    }
  }

  // mountComponent 函数用于挂载组件
  function mountComponent(
    initialVNode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    // 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));
    // 设置组件实例
    setupComponent(instance);
    // 设置渲染效果
    setupRenderEffect(initialVNode, instance, initialVNode, container, anchor);
  }
  // setupRenderEffect 函数用于设置渲染效果
  function setupRenderEffect(
    n1: any,
    instance: any,
    n2: any,
    container: any,
    anchor: any
  ) {
    instance.update = effect(
      () => {
        //首次渲染
        if (!instance.isMounted) {
          const { proxy } = instance;
          // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
          let subTree = {} as any;
          if (typeof instance.render === "function") {
            //调用render函数

            // 第一个 proxy 传给 render 作为 _ctx，这样 render(_ctx) 里 _ctx.xxx 也能访问到数据。
            // 第二个 proxy 传给 render 作为 _ctx，这样 render(_ctx) 里 _ctx.xxx 也能访问到数据。
            // _ctx 在 Vue 3 的 render 函数中，代表的是 组件的渲染上下文，它本质上就是 组件实例的 proxy，也就是 setupState、props、data、computed 等的代理对象。
            subTree = instance.subTree = instance.render.call(proxy, proxy);
          }

          // 通过 patch 函数将虚拟节点渲染到 DOM 中
          patch(null, subTree, container, instance, anchor);

          // 记录子树元素（el）：将渲染后的 DOM 元素与虚拟节点绑定，这样后续更新时可以比较虚拟节点与真实 DOM 的对应关系。
          n2.el = subTree.el;
          instance.isMounted = true;
        }
        //更新渲染
        else {
          console.log("update");
          //需要一个更新完成之后的虚拟节点
          const { next, vnode } = instance;
          if (next) {
            // next.el = vnode.el; 保留旧 vnode 对应的 el，确保新旧 vnode 之间的对比能够顺利进行。
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          } 

          const { proxy } = instance;
          // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
          let subTree = {} as any;
          // 重新调用 render 函数，生成新的虚拟 DOM
          if (typeof instance.render === "function") {
            subTree = instance.render.call(proxy, proxy);
          }
          const preSubTree = instance.subTree;
          instance.subTree = subTree;
          // 记录更新前的虚拟 DOM，后续 patch 需要基于它进行 Diff 算法计算。
          patch(preSubTree, subTree, container, instance, anchor);

          // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
        }
      },
      {
        scheduler() {
          console.log("update-scheduler");
          queneJobs(instance.update);
        },
      }
    );
  }
  //更新实例对象上的props
  function updateComponentPreRender(instance: any, nextVNode: any) {
    instance.vnode = nextVNode;
    instance.next = null;

    instance.props = nextVNode.props;
  }
  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
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

  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c2 = n2.children;
    const c1 = n1.children;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // **新 children 是文本**
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // **旧 children 是数组（即旧 vnode 是多个子节点）**
        //1.把老的child清空
        unmountChildren(n1.children);
      }
      // 2. 更新文本内容（如果文本内容发生变化）
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    }
    // **新 children 不是文本（即新的 children 是数组或空）**
    else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // **旧 children 是文本**
        hostSetElementText(container, "");
        // 2. 再挂载新的子节点（新的子节点是数组）
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // **新旧 children 都是数组**
        // 进行 **diff**，通过 `patchKeyedChildren` 对比新旧子节点并更新
        //array diff array
        patchKeyedChildren(
          n1.children,
          n2.children,
          container,
          parentComponent,
          anchor
        );
      }
    }
  }
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSomeVNodeType(n1: any, n2: any) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 从头开始比较两个子节点数组
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      // 如果两个节点类型相同，则递归调用 patch 函数进行更新
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
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
      } else {
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
    } else {
      //中间对比
      let s1 = i;
      let s2 = i;
      //需要比对的节点数量
      const toBePatched = e2 - s2 + 1;
      // 记录已经处理的节点数
      let hasPatched = 0;
      let moved = false;
      // 记录最大的新节点索引
      let maxNewIndexSofar = 0;
      // key 到索引的映射
      const keyToIndexMap = new Map();
      // 初始化映射数组
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0); //初始化数组

      //建立映射表
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];

        keyToIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        // 说明所有新节点都已经处理完毕，剩下的旧节点可以直接移除。
        if (hasPatched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        //查哦找两种方法，遍历和映射表取决于用户是否设置key
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          //判断是否移动
          // 新节点的索引总是递增的，则说明这些节点已经在正确的位置，无需移动。
          if (newIndex >= maxNewIndexSofar) {
            maxNewIndexSofar = newIndex;
          } else {
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

        // 最长递增子序列（LIS, Longest Increasing Subsequence）**来减少不必要的 DOM 操作，从而提高性能
        // 最长递增子序列的作用是找到一组已经在正确位置的节点（即不需要移动的节点）。通过找到这些节点，我们可以避免对它们进行不必要的 DOM 移动操作，从而提高性能。
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      console.log(increasingNewIndexSequence);
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];

        // 计算锚点（anchor）来决定 DOM 操作的插入位置
        //锚点等于当前节点的下一个
        // 插入操作会将节点放置在锚点之前。如果锚点为 null，则节点会被插入到容器的最后。
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        // 前新节点在旧节点列表中不存在，属于新增节点。
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // 如果当前索引 i 不在最长递增子序列中，说明该节点需要移动。
          if (i != increasingNewIndexSequence[j]) {
            console.log("移动位置");
            // 调用 hostInsert 将节点插入到正确的位置
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
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
  function mountElement(
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    // 创建元素节点
    const el = (n2.el = hostCreateElement(n2.type));
    const { shapeFlag } = n2;
    const { children } = n2;
    // 处理元素的子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerHTML = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
  function mountChildren(
    children: any,
    el: any,
    parentComponent: any,
    anchor: any
  ) {
    children.forEach((v: any) => {
      patch(null, v, el, parentComponent, anchor);
    });
  }
  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    //注释?
    const testNode = (n2.el = document.createTextNode(children));

    container.append(testNode);
  }
  return { createApp: createAppApi(render) };
}
function getSequence(arr: any) {
  if (arr.length === 0) return [];

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
    if (prev[i] === -1) break;
  }
  lisIndices.reverse();
  return lisIndices;
}
