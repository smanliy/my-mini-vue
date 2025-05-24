import { h, renderSlots } from "../../../lib/guide-mini-vue.esm.js"

// 定义一个名为 Foo 的组件
export const Foo = {
    name: "Foo:",
    // setup 函数用于组件的初始化
    setup() {
        return {
        }
    },
    render() {
        const foo = h("p", {}, "foo")
        const age = 18

        console.log(this.$slots)
        //this.$slots返回虚拟节点的children
        return h("div", {},
            [
            renderSlots(this.$slots, "header",{age}),
                foo,
            renderSlots(this.$slots, "footer")
            ])
    }
}