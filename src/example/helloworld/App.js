import { h } from "../../../lib/guide-mini-vue.esm.js"
import { Foo } from "../Foo.js"
window.self = null
export const App = {
    render() {
        window.self = this
        //返回虚拟节点
        return h("div", 
            {
            id:"root",
            class:['red',"hard"],
            onClick(){
                console.log("click")
            },
            onMousedown(){
                console.log("mousedown")
            }
            }, 
        // "hi," + this.msg
        // [h("p",{class:"red"},"hi"),h("p",{class:"blue"},"mini-vue")]

        [h('div',{}, "hi," +this.msg),h(Foo,{count:1})]
     )
    },
    setup() {                                                   
        return {
            msg: "my-mini-vue"
        }
    }
}