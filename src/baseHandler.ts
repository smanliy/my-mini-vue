import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "./shared/index";
//重构优化，避免每次都要创建get
const get = createGetter(false);
const set = createSetter()
const readonlyGet = createGetter(true)
const readonlySet = function (target:object, key:string |symbol, value:any){
    console.warn(`${target}的${String(key)}属性被设置为只读属性`)
    return true
}
// shallowReadonly 是一种浅层只读的响应式处理器。它的作用是将对象的顶层属性设置为只读，但不递归地将嵌套的对象属性设置为只读。这意味着只有对象的第一层属性是只读的，而嵌套的对象属性仍然是可变的。
const shallowReadonlyGet = createGetter(true,true)
//isreadyonly -----> 决定是否收集依赖
function createGetter(isreadonly:boolean,shallow:boolean = false){
    return function get(target:object, key:string | symbol){
      const res = Reflect.get(target,key);
      if(shallow) return res
      //readonly 和reactive嵌套对象转换功能
      if(isObject(res))
      return isreadonly ? readonly(res):reactive(res)
      if(key === ReactiveFlags.IS_REACTIVE){
        return !isreadonly
      }else if( key === ReactiveFlags.IS_READONLY){
        return isreadonly
      }
      if(!isreadonly){
      //依赖收集
      track(target,key)
      }
    return res
    }
  }
  //创建setter
  function createSetter(){
    return function (target:object, key:string |symbol, value:any) {
      const res =  Reflect.set(target, key, value);
      //触发依赖
      trigger(target,key)
      return res
    }
  }
//reactive的proxy处理器
  export const mutableHandlers:ProxyHandler<object> = {
    get:get,
    set:set
  }
//readonly的proxy处理器
  export const readonlyHandlers:ProxyHandler<object> = {
    get:readonlyGet,
    set:readonlySet
  }
//shallowReadonlyHanslers的处理器
export const shallowReadonlyBaseHandlers:ProxyHandler<object> = extend({},readonlyHandlers,
  {
    get:shallowReadonlyGet
  }
)

