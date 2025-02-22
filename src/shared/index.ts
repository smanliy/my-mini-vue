export const extend = Object.assign

export const isObject = (obj:any)=>{
    return obj != null && typeof obj =='object'
}

export const hasChanged = <T>(oldVal: T, newVal: T): boolean => {
    return !Object.is(oldVal, newVal);
  }

export const hasOwn = (val:any,key:any
  )=>Object.prototype.hasOwnProperty.call(val,key)
  