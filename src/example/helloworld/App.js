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
            onClick(){
                console.log("click")
            },
            onMousedown(){
                console.log("mousedown")
            }
            }, 
        // "hi," + this.msg
        // [h("p",{class:"red"},"hi"),h("p",{class:"blue"},"mini-vue")]

        [h('div',{}, "hi," +this.msg),h(Foo,{
            onAdd(a,b){
                console.log("onAdd",a,b)
            },
            onAddFoo(){
                console.log("onAddFoo")
            }
        })]
     )
    },
    setup() {                                                   
        return {
            msg: "my-mini-vue"
        }
    }
}