import { ReactiveEffect } from "./effect";

class ComputedImpl<T>{
    private  _getter:()=>T
    private _value: T | undefined;
    private _dirty:boolean = true
    private _effect :ReactiveEffect
    constructor(getter:()=>T){
        this._getter = getter;
        
        // 当 getter 中访问的依赖项（如某个 reactive 或 ref）发生变化时，ReactiveEffect 会执行其第二个参数（scheduler 函数）。
        // effect 的第二个参数中的 scheduler 确实可以控制第一个参数（即副作用函数）的执行时机，并且可以在这里做一些额外操作，比如设置变量、批量调度、任务排队
        this._effect = new ReactiveEffect(this._getter,()=>{
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