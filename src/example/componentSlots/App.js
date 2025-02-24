import { h } from "../../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
    name: "App",
    render() {
        window.self = this
        //返回虚拟节点
        const app = h("div", {}, "App")

        const foo = h(Foo,{},[h("p",{},"123"),h("p",{},"456")])

        return h("div",{},[app,foo])
    },
    setup() {
        return {

        }
    }
}