



keepalive 开发日志：

patch:

```ts
  function patch(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {

    if (n1 && n2) {
      // 更新阶段
      n2.el = n1.el;  // 关键：让新 vnode 复用旧 vnode 的 el
    }
    //处理v-for
    if (n2.props && n2.props["v-for"]) {
      const { item, index, list } = parseVFor(n2.props["v-for"]);
      const listVal = parentComponent.proxy[list];
      const childNodes = [];
      for (let i = 0; i < listVal.length; i++) {
        const child = n2.children({ [item]: listVal[i], [index]: i });
        const vnode = {
          type: n2.type,
          props: {},
          children: child,
          shapeFlag:
            ShapeFlags.ELEMENT | // 标记为元素节点 [!code ++]
            (typeof child === "string"
              ? ShapeFlags.TEXT_CHILDREN // 文本子节点
              : ShapeFlags.ARRAY_CHILDREN), // 数组子节点
        };

        childNodes.push(vnode);
      }
      n2.children = childNodes;
      n2.shapeFlag = n2.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
      // mountChildren(childNodes, container, parentComponent, anchor);
    }
    //处理v-if
    if (n2.props && "v-if" in n2.props) {
      const shouldRender = n2.props["v-if"];
      if (!shouldRender) {
        return;
      }
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
        // console.log('patch 执行时 shapeFlag:', shapeFlag, 'type:', type?.name || type);
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //keepalive组件
          if(n2.shapeFlag & ShapeFlags.KEEP_ALIVE_COMPONENT){
            processKeepAliveComponent(n1, n2, container, parentComponent, anchor)
          }else{
          //其他组件
          processComponent(n1, n2, container, parentComponent, anchor);
          }
        }
        break;
    }

   
  }
```

keepalive.ts

```ts
import { ShapeFlags } from "../shared/shapeFlags";
import { getCurrentInstance } from "./component";
import { initSlots } from "./componentSlots";
let _patch: any;
export const KeepAlive = {
  __isKeepAlive: true,
  name: "KeepAlive",
  __injectPatch__(patchFn: any) {
    _patch = patchFn;
  },
  setup() {
    console.log("keep-alive的setup执行");
    const cache = new Map();
    const curInstance = getCurrentInstance();
    const parentComponent = curInstance.parent;
    
    curInstance.activate = (vnode: any, container: any, anchor: any) => {
      _patch(null, vnode, container, parentComponent, anchor);
    };

    curInstance.deactivate = (vnode: any) => {
      console.log("预计缓存");
    };

    return () => {
      console.log("keep-alive的返回函数执行了");
      const slots = curInstance.slots;
      const vnode = slots.default && slots.default()[0]; // 每次 render 都重新获取

      if (!vnode) return null;

      const name = vnode.type.name || "default";
      if (!cache.has(name)) {
        cache.set(name, vnode);
      }
      console.log("cache", cache);
      // curInstance.activate();
      
      vnode.KeepAliveInstance = curInstance;

      return vnode;
    };
  },
};
```

processKeepalive未执行，我怀疑是shapeFlags返回的return 函数中，这个函数只有创建了组件实例的时候才会被执行，而我现在是在实例之前判断shapeflags ,所以不会执行



二

```ts
guide-mini-vue.esm.js:703 
 Uncaught TypeError: Cannot destructure property 'activate' of 'n2.KeepAliveInstance' as it is null.
    at processKeepAliveComponent (guide-mini-vue.esm.js:703:17)
    at patch (guide-mini-vue.esm.js:677:25)
    at guide-mini-vue.esm.js:1051:13
    at Array.forEach (<anonymous>)
    at mountChildren (guide-mini-vue.esm.js:1050:18)
    at mountElement (guide-mini-vue.esm.js:1035:13)
    at processElement (guide-mini-vue.esm.js:803:13)
    at patch (guide-mini-vue.esm.js:671:21)
    at instance.update.effect.scheduler [as _fn] (guide-mini-vue.esm.js:759:17)
    at ReactiveEffect.run (guide-mini-vue.esm.js:108:27)
processKeepAliveComponent	@	guide-mini-vue.esm.js:703
patch	@	guide-mini-vue.esm.js:677
(匿名)	@	guide-mini-vue.esm.js:1051
mountChildren	@	guide-mini-vue.esm.js:1050
mountElement	@	guide-mini-vue.esm.js:1035
processElement	@	guide-mini-vue.esm.js:803
patch	@	guide-mini-vue.esm.js:671
instance.update.effect.scheduler	@	guide-mini-vue.esm.js:759
run	@	guide-mini-vue.esm.js:108
effect	@	guide-mini-vue.esm.js:192
setupRenderEffect	@	guide-mini-vue.esm.js:745
mountComponent	@	guide-mini-vue.esm.js:741
processComponent	@	guide-mini-vue.esm.js:713
patch	@	guide-mini-vue.esm.js:681
render	@	guide-mini-vue.esm.js:622
mount	@	guide-mini-vue.esm.js:522
(匿名)	@	main.js:6

```

正确的执行顺序

- processcComponent()
- setupComponent()
- Keepalive.setup()



```ts
Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'message'
    at Object.set (guide-mini-vue.esm.js:374:29)
    at HTMLInputElement.onInput (A.js:14:40)
```

报错就是 Proxy `set` 必须返回 `true` 表示赋值成功，返回假值才会报错。





![](https://typora----magic.oss-cn-beijing.aliyuncs.com/202506192026974.png)

不用name而用type map.has()是严格比较地址