import { createRender } from '../runtime-core'

function createElement(type:any){
    return document.createElement(type)
}

function pathProp(el:any,key:any,preVal:any,nextVal:any){
        const isOn = (key:any) => /^on[A-Z]/.test(key)

    if(isOn(key)){
      const event = key.slice(2).toLowerCase()
      console.log(key)
      el.addEventListener(event,nextVal)
    }else{
        if(nextVal === undefined || nextVal === null
        ){
            el.removeAttribute(key)
        }
      el.setAttribute(key, nextVal);
    }
}


function insert(el:any,container:any){
    container.append(el)
}
function setElement(el:any,text:any){
    el.textContent = text
}
const render:any = createRender({
    createElement,
    pathProp,
    insert,
    remove,
    setElement
})

export function createApp(...args:any){
    return render.createApp(...args)
}

function remove(child:any){
    const parent = child.parentNode;
    if(parent){
        parent.removeChild(child)
    }
}
export * from '../runtime-core'