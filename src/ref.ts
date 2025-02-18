import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "./shared";
import { isTracking } from "./effect";
import { reactive } from "./reactive";
class RefIml{
    private _value:any;
    public dep:Set<ReactiveEffect>
    public _rawvalue:any
    constructor(value:any){
        this._rawvalue = value
        this._value = convert(value)
        this.dep = new Set()
    }
    get value(){
       
        tarckRefValue(this)
       
        return this._value
    }
    set value(newValue){
        if(!hasChanged(newValue,this._rawvalue)) return
        this._rawvalue = newValue
        this._value = convert(newValue)
        triggerEffects(this.dep)
    }
}

export function ref(raw:any):RefIml{
    return new RefIml(raw)
}
//收集ref相关的依赖
function tarckRefValue(target:RefIml){
    if(isTracking())
        {
            trackEffects(target.dep)
        }
}
//防止value是嵌套对象(暗含递归)
function convert(value:any){
    return  isObject(value) ? reactive(value) : value;
}


