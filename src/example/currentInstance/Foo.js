import { h, getCurrentInstance } from "../../../lib/guide-mini-vue.esm.js"

// 定义一个名为 Foo 的组件
export const Foo = {
    name: "Foo:",
    // setup 函数用于组件的初始化
    setup() {
        const instance = getCurrentInstance();
        console.log("Foo:", instance)
        return {
        }
    },
    render() {
        return h("div", {},
            "foo")
    }
}