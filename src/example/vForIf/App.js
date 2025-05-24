import { h} from "../../../lib/guide-mini-vue.esm.js"
export const App = {
    setup() {
        const isShow = true
        const list  = ['html','css','vue','react']
        return {
            isShow,
            list
        }
    },
    render() {
        return h('div',{},

            [
                h('p',{'v-if':this.isShow },'hello!我现在可以被显示'),
            ]
        )
    }

}


            //     h('ul',{},
            //     [
            //         h('li',{'v-for':'(item,index) in list'},({item,index})=>`索引:${index} + 值${item}`)
            //     ]
            // )