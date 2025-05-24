import { h ,createTextVNode} from "../../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
    name: "App",
    render() {
        window.self = this
        //返回虚拟节点
        const app = h("div", {}, "App")
        //具名插槽
        const foo = h(Foo, {},
            {
                header: ({age})=>[h("p", {}, "header" + age),createTextVNode("你好呀")],
                footer: ()=>h("p", {}, "footer")
            }
        )

        return h("div", {}, [app, foo])
    },
    setup() {
        return {

        }
    }
}