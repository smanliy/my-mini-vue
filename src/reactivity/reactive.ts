import { mutableHandlers, readonlyHandlers, shallowReadonlyBaseHandlers } from "./baseHandler";
import { isObject } from "../shared/index";


export const enum ReactiveFlags{
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}
export function reactive<T extends object>(raw:T):T{
  return createProxyObject(raw, mutableHandlers) as unknown as T;
}

//isreadonly
export function readonly<T extends object>(raw:T):T{
  return createProxyObject(raw, readonlyHandlers) as unknown as T;

}
//创建proxy对象
function createProxyObject<T extends object>(raw:T,handlers:ProxyHandler<T>):T{
  //加一层是不是对象的判断，防止传入基本类型
  if(!isObject(raw)){
    console.warn(`target ${raw} is not a object`)
    return raw
  }
  return new Proxy(raw,handlers) 
}
//判断是否是reactive对象
export function isReactive(value:any):boolean{
  return !!value[ReactiveFlags.IS_REACTIVE]
}
//判断是否是readonly对象
export function isReadonly(value:any){
  return !!value[ReactiveFlags.IS_READONLY]
}
export function shallowReadonly<T extends object>(raw:T):T{
  return createProxyObject(raw,shallowReadonlyBaseHandlers) as unknown as T
}
//判断是否是代理对象;
export function isProxy<T extends object>(raw:T):boolean{
  return isReactive(raw) || isReadonly(raw) 
}