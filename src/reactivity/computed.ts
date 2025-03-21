import { ReactiveEffect } from "./effect";

class ComputedImpl<T>{
    private  _getter:()=>T
    private _value: T | undefined;
    private _dirty:boolean = true
    private _effect :ReactiveEffect
    constructor(getter:()=>T){
        this._getter = getter;
        this._effect = new ReactiveEffect(this._getter,()=>{
            // dirty 用于标记计算属性（computed）是否需要重新计算，如果依赖的响应式对象发生改变，dirty 变为 true，表示需要重新计算。
            // 依赖变更时，标记 dirty 需要重新计算
            // this._dirty = true 会在下一次 getter 执行之前设置，标记计算属性值已经过期，需要重新计算。
            this._dirty = true
        })
    }
    get value():T {
        //当依赖的的响应式的对象发生改变时，dirty变为true
        if(this._dirty){
            // 表示计算属性的值已经缓存，不需要重新计算，直接返回上次的值。
            this._dirty = false;
            // 这里的 ReactiveEffect 通过 run 方法执行计算，并在执行时触发依赖收集。
            this._value =this._effect.run()
            return this._value as T
        }
        return this._value!
    }
}


export function computed<T>(getter:()=>T):ComputedImpl<T> {
    return new ComputedImpl(getter)
}