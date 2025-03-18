// import { template } from "@babel/core"
// import { h, ref, getCurrentInstance, nextTick } from "../../lib/guide-mini-vue.esm.js"
// import { createElementVNode } from "../../lib/guide-mini-vue.esm.js"
//将Template字符串编译成render函数
import { ref } from "../../../lib/guide-mini-vue.esm.js"
export const App = {
    name: "App",
    template: `<div>hi,{{count}}</div>`,
    setup() {
        const count = (window.count = ref(1))
        return {
            count,
            // message: "mini-vue"
        }
    }
}