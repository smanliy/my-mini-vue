import { h,ref } from "../../../lib/guide-mini-vue.esm.js"
import Child from './Child.js'

export const App = {
    name: "App",
    setup() {
        const msg = ref("123");
        const count = ref(1);

        window.msg = msg

        const changeChildProps = () => {
            msg.value = "456"
        }

        const changeCount = () => {
            count.value++
        }

        return { msg, changeChildProps, changeCount, count }
    },

    render() {
        console.log('this',this.msg)
        return h("div", {}, [
            h("div", {}, "你好" + this.msg),
            h("button", {
                onClick: this.changeChildProps,
            },
                "改变子组件的msg"
            ),
            h(Child, { msg: this.msg }),
            h("button",
                {
                    onClick: this.changeCount,
                },
                "改变自己组件的count"
            ),
            h("p", {}, "count:" + this.count)

        ])
    }
}