import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Text, Fragment } from "./createVNode";
// render 函数用于渲染虚拟节点到指定的容器中
export function render(vnode: any, container: any) {
  patch(vnode, container);
}
// patch 函数用于判断虚拟节点的类型，并调用相应的处理函数
function patch(vnode: any, container: any) {
// 判断 vnode 是否是一个元素节点，如果是，则处理元素节点
const { type ,shapeFlag } = vnode;
switch(type){
  case Fragment:
    processFragment(vnode,container)
    break;
  case Text:
   processText(vnode,container)
   break;
    default  : if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
       // 如果 vnode 是一个对象，则处理组件
      processComponent(vnode, container);
  }
  break;
}

}
// processComponent 函数用于处理组件节点
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
// mountComponent 函数用于挂载组件
function mountComponent(initVnode: any, container: any) {
    // 创建组件实例
  const instance = createComponentInstance(initVnode);
    // 设置组件实例
  setupComponent(instance);
  // 设置渲染效果
  setupRenderEffect(instance, initVnode,container);
}
// setupRenderEffect 函数用于设置渲染效果
function setupRenderEffect(instance: any,initVnode:any, container: any) {
  const {proxy} = instance
  // 调用 render 函数生成子树（subTree），子树是一个虚拟节点
  let subTree = {} as any;
  if(typeof instance.render === 'function'){
    subTree = instance.render.call(proxy);
  }



   // 通过 patch 函数将虚拟节点渲染到 DOM 中
  patch(subTree, container);


  // 将 vnode 与渲染后的 DOM 元素绑定，方便后续更新
  initVnode.el = subTree.el
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
// mountElement 函数用于挂载元素节点
function mountElement(vnode: any, container: any) {
    // 创建元素节点
  const el =(vnode.el = document.createElement(vnode.type));
    const {shapeFlag} = vnode;
  const { children } = vnode;
  // 处理元素的子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.innerHTML = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  const { props } = vnode;
  //props
    // 处理元素的属性
  for (const key in props) {
    const val = props[key];
    const isOn = (key:any) => /^on[A-Z]/.test(key)

    if(isOn(key)){
      const event = key.slice(2).toLowerCase()
      console.log(key)
      el.addEventListener(event,val)
    }else{
      el.setAttribute(key, val);
    }
   
  }
    // 将元素添加到容器中
  container.append(el);
}
// mountChildren 函数用于挂载子节点
function mountChildren(vnode: any, el: any) {
  vnode.children.forEach((v: any) => {
    patch(v, el);
  });
}
function processFragment(vnode: any, container: any) {
  mountChildren(vnode,container)
}

function processText(vnode:any,container:any) {
 const {children} = vnode;
 //注释?
 const testNode = (vnode.el = document.createTextNode(children));

 container.append(testNode)
}

