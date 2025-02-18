import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { hasChanged } from "./shared";

class RefIml{
    private _value:any;
    public dep:Set<ReactiveEffect>
    constructor(value:any){
        this._value = value
        this.dep = new Set()
    }
    get value(){
        trackEffects(this.dep)
        return this._value
    }
    set value(newValue){
        if(!hasChanged(newValue,this._value)) return
        this._value = newValue;
        triggerEffects(this.dep)
    }
}

export function ref(raw:any):RefIml{
    return new RefIml(raw)
}