import { h } from "../../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
window.self = null
export const App = {
    name:"App",
    render() {
        window.self = this
        //返回虚拟节点
        return h("div", 
            {
            id:"root",
            class:['red',"hard"],
            }, 
        // "hi," + this.msg
        [h("p",{class:"red"},[h("p",{class:"red"},"newhi")]),h("p",{class:"blue"},"mini-vue")]

       
     )
    },
    setup() {                                                   
        return {
            msg: "my-mini-vue"
        }
    }
}