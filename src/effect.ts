import { extend } from "./shared/index";
let activeEffect:ReactiveEffect | null = null;
let shouldTrack:boolean | null ;
export class ReactiveEffect{
    private _fn:Function
    public scheduler:Function |undefined
    public deps :Array<Set<ReactiveEffect>>= [];
    private active:boolean = true
    public onStop?:()=>void
    constructor(fn:Function,scheduler?:Function){
        this._fn = fn,
        this.scheduler = scheduler;  // 保存 scheduler

    }
    run(){
        let result;
        // active控制是否需要收集依赖
        if(!this.active){
        result = this._fn()
        }else{
            shouldTrack = true
            activeEffect = this
            result = this._fn()
        }
        // shouldTrack 是一个全局标志，控制是否收集依赖。在副作用函数执行结束后，设置 shouldTrack = false 是为了避免后续的代码（例如副作用函数外的代码）无意中触发依赖收集。如果不把它设置为 false，可能会导致后续的代码不必要地收集依赖，造成不必要的性能开销。
        shouldTrack = false
        return result;

    }
    stop(){
        if(this.active){
            this.cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
        }


    }
    cleanupEffect(effect:ReactiveEffect) {
        effect.deps.forEach((dep:any) => {
            dep.delete(effect)
        });
        effect.deps.length = 0
    }
}
export function isTracking(){
    return shouldTrack && activeEffect !=undefined
}

//收集依赖
const targetMap = new Map<object,Map<string |symbol,Set<ReactiveEffect>>>();
export function track(target:object,key:symbol|string){
if(!isTracking()) return 
    let depsMap:Map<string |symbol,Set<ReactiveEffect>> |undefined= targetMap.get(target)
    if(!depsMap){
        depsMap = new Map<string |symbol,Set<ReactiveEffect>> ();
        targetMap.set(target,depsMap)
    }
    let dep:Set<ReactiveEffect> |undefined = depsMap.get(key);
    if(!dep){
        dep = new Set<ReactiveEffect>();
        depsMap.set(key,dep)
    }
    trackEffects(dep)

}
export function trackEffects(dep:Set<ReactiveEffect> |undefined){
    if(activeEffect){
        //看dep之前有没有添加过，没有添加过就不添加了
        if(dep){
            if(dep.has(activeEffect))
                return
            dep.add(activeEffect!)
            activeEffect!.deps.push(dep)
        }

        }
}
//触发依赖
export function trigger(target:object,key:symbol|string){
   let depsMap = targetMap.get(target);
   if(!depsMap) return

   let dep = depsMap.get(key);
   if(!dep) return
    triggerEffects(dep)
}
export function triggerEffects(dep:Set<ReactiveEffect> |undefined){
    if(dep){
        for(const effect of dep){
            if(effect.scheduler){
                effect.scheduler()
            }else{
                effect.run()
            }
        
           }
    }

}
export function effect<T extends Function>(fn:T,options:any = {}){
    // scheduler 是在数据变化时触发的调度器，用来控制副作用函数何时执行。
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn,scheduler);
    //extend
    extend(_effect,options)
    //fn
    _effect.run();
    const runner :any= _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner:any){
    runner.effect.stop()
}