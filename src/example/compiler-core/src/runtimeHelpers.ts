export const TO_DISPLAY_STRING = Symbol("toDisplayString")


export const CREATE_ELEMENT_VNODE= Symbol("createElementVNode")

export const helperMapName : Record<string | symbol, string>= {
  [TO_DISPLAY_STRING]: "toDisplayString" ,
  [CREATE_ELEMENT_VNODE]:"createElementVNode"
}

