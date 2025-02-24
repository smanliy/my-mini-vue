import { h } from "../../../lib/guide-mini-vue.esm.js"
// 定义一个名为 Foo 的组件
export const Foo ={
    name:"Foo:",
    // setup 函数用于组件的初始化
    setup(props,{emit}){
        // 输出传入的 props，便于调试
        // console.log(props)

        props.count++
// 定义一个 emitAdd 函数，用于触发 "add" 事件
        const emitAdd = (e)=>{
            console.log("emitAdd")
            e.stopPropagation()
            emit("add",1,2)
            emit("add-foo")
        }
        
        return {
            emitAdd
        }
    },
    render(){
        const btn = h('button',{
            onClick:(e)=>{
                this.emitAdd(e)
            }
        },"emitAdd")
         // 创建一个段落元素，内容为 "foo"
        const foo = h("p",{},"foo")
        // 返回一个 div 元素，包含 foo 和 btn 两个子元素
        return h('div',{}, [foo,btn])
    }
}