import { camelize, toHandlerKey } from "../shared/index";

// emit 函数用于触发组件实例上的事件
export function emit(instance:any,e:any,...args:any){
    console.log("emit",e)
    const {props} = instance


    //TPP
    //先去写一个特定的行为，重构成通用的行为


    // 将事件名称转换为事件处理函数的键名
    const handlerName = toHandlerKey(camelize(e))
    // 从组件实例的 props 中获取对应的事件处理函数
    const handler = props[ handlerName];
     // 如果事件处理函数存在，则调用该函数
    handler & handler(...args)
}