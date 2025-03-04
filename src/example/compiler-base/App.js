// import { template } from "@babel/core"
// import { h, ref, getCurrentInstance, nextTick } from "../../lib/guide-mini-vue.esm.js"
// import { createElementVNode } from "../../lib/guide-mini-vue.esm.js"
//将Template字符串编译成render函数
export const App = {
    name: "App",
    template: `<div>hi,{{message}}</div>`,
    setup() {
        return {
            message: "mini-vue"
        }
    }
}