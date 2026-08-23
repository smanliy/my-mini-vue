import { ShapeFlags } from "../shared/shapeFlags";
import { getCurrentInstance } from "./component";
let _patch: any;
const cache = new Map<any, any>(); // 缓存放到组件外部，确保长期保存

export const KeepAlive = {
  __isKeepAlive: true,
  name: "KeepAlive",
  __injectPatch__(patchFn: any) {
    _patch = patchFn;
  },
  setup() {
    // console.log("keep-alive的setup执行");
    const curInstance = getCurrentInstance();
    const parentComponent = curInstance.parent;

    curInstance.activate = (vnode: any, container: any, anchor: any) => {
      // 恢复被 deactivate 隐藏的 DOM 显示（deactivate 仅设置 display:none，节点仍在 DOM 树中）
      if (
        vnode.component &&
        vnode.component.subTree &&
        vnode.component.subTree.el
      ) {
        vnode.component.subTree.el.style.display = "";
      }
      // 让 vnode.el 指向已缓存的真实 DOM，保证后续 patch 流程正常
      if (vnode.component && vnode.component.subTree) {
        vnode.el = vnode.component.subTree.el;
      }
    };

    curInstance.deactivate = (vnode: any) => {
      // console.log("调用keepalive组件实例的deactive方法");
      vnode.component.subTree.el.style.display = "none";
    };

    return () => {
      // console.log("keep-alive的返回函数执行了");
      const slots = curInstance.slots;
      const vnode = slots.default && slots.default()[0];
      if (!vnode) return null;
      // console.log("[KeepAlive] 当前渲染组件:", vnode.type.name);

      const type = vnode.type;
      if (!cache.has(type)) {
        vnode.shapeFlag |= ShapeFlags.KEEP_ALIVE_COMPONENT;
        vnode.KeepAliveInstance = curInstance;
        cache.set(type, vnode);
        return vnode;
      } else {
        const cachedVnode = cache.get(type);
        vnode.component = cachedVnode.component;
        vnode.shapeFlag |= ShapeFlags.KEEP_ALIVE_COMPONENT;
        cachedVnode.KeepAliveInstance = curInstance;
        return cachedVnode;
      }
      console.log("现在的cache____", cache);
      for (let [key, value] of cache) {
        console.log("key——————", key, "value——————", value);
      }
      vnode.KeepAliveInstance = curInstance;

      return vnode;
    };
  },
};
