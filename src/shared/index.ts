export const extend = Object.assign

export const isObject = (obj:any)=>{
    return obj != null && typeof obj =='object'
}

export const hasChanged = <T>(oldVal: T, newVal: T): boolean => {
    return !Object.is(oldVal, newVal);
  }

export const hasOwn = (val:any,key:any
  )=>Object.prototype.hasOwnProperty.call(val,key)
      // capitalize 函数用于将字符串的首字母大写
      const capitalize = (str:string) =>{
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

export const camelize = (str:string) =>{
        return str.replace(/-(\w)/g,(_,c)=>{
            return c ? c.toUpperCase() : ""
        })
    }
    // toHandlerKey 函数用于将事件名称转换为事件处理函数的键名 
export const toHandlerKey = (str:string)=>{
        return str? "on"+ capitalize(str) :""
    }