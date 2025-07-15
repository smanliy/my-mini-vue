import { ShapeFlags } from "../shared/shapeFlags";
import { getCurrentInstance } from "./component";
let _patch: any;
const cache = new Map(); // 缓存放到组件外部，确保长期保存

export const KeepAlive = {
  __isKeepAlive: true,
  name: "KeepAlive",
  __injectPatch__(patchFn: any) {
    _patch = patchFn;
  },
  setup() {
    console.log("keep-alive的setup执行");
    const curInstance = getCurrentInstance();
    const parentComponent = curInstance.parent;

    curInstance.activate = (vnode: any, container: any, anchor: any) => {
      _patch(vnode, vnode, container, parentComponent, anchor);
    };

    curInstance.deactivate = (vnode: any) => {
      console.log("调用keepalive组件实例的deactive方法");
      vnode.component.subTree.el.style.display = "none";
    };

   return () => {
  console.log("keep-alive的返回函数执行了");
  const slots = curInstance.slots;
  const vnode = slots.default && slots.default()[0];
  if (!vnode) return null;
  console.log("[KeepAlive] 当前渲染组件:", vnode.type.name);

  const type = vnode.type;
  if (!cache.has(type)) {
  
    cache.set(type, vnode);
  } else {
    const cachedVnode = cache.get(type);
    vnode.component = cachedVnode.component;
    vnode.shapeFlag |= ShapeFlags.KEEP_ALIVE_COMPONENT;
    return cachedVnode;
  }

  vnode.KeepAliveInstance = curInstance;

  return vnode;
};

  },
};

