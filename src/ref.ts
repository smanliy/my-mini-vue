import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { hasChanged, isObject } from "./shared/index";
import { isTracking } from "./effect";
import { reactive } from "./reactive";
class RefIml{
    private _value:any;
    public dep:Set<ReactiveEffect>
    public _rawvalue:any;
    public __v_isRef:boolean= true
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
//判断是否是ref对象
export function isRef(ref:any){
    return !!ref.__v_isRef
}
//拿取ref（在不知道ref是不是响应式对象的时候用）的值
export function unRef(ref:any){
    return isRef(ref)?ref.value :ref
}
//proxyRefs
export function proxyRefs(objectsWithRefs:Record<string | symbol, any>){
    return new Proxy(objectsWithRefs,{
        get:(target,key)=>{
            return unRef(Reflect.get(target,key))
        },
        set:(target,key,value)=>{
            if(isRef(target[key]) && !isRef(value)){
               return Reflect.get(target,key).value = value
            }else{
                return Reflect.set(target,key,value) 
            }
        }
    })
}

