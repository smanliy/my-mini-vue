import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
   //判断vnode是不是element ，若是，则处理element  TODO
   debugger;
   if(typeof vnode.type == "string"){
    processElement(vnode,container)
   }else if(isObject(vnode.type))
  //处理组件
  processComponent(vnode, container);
}

function processComponent(vnode: any, container: any) {
  debugger;
  mountComponent(vnode, container);
}
function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);

  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();

  //vnode  ——>进一步调用patch

  //vnode  ——> patch ——>element ——>mountElement
  patch(subTree, container);
}
function processElement(vnode: any, container: any) {
  mountElement(vnode,container)
}
function mountElement(vnode:any,container:any){
  const el = document.createElement(vnode.type)

  const {children} = vnode


  if(typeof children === "string"){
    el.innerHTML = children
  }else if(Array.isArray(children)){
    mountChildren(vnode,el)
  }

  const {props} = vnode
  //props
  for(const key in props){
    const val = props[key]
    el.setAttribute(key,val)
  }
  container.append(el)
}

function mountChildren(vnode:any,el:any){
  vnode.children.forEach((v:any) => {
    patch(v,el)
  });
}