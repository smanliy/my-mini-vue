import { ref, h } from "../../../lib/guide-mini-vue.esm.js"
import { ComponentA } from "./A.js"
import { ComponentB } from "./B.js"

const componentsMap = {
    ComponentA,
    ComponentB
}

export const App = {
    name: "App",
    setup() {
        const currentComponent = ref("ComponentA")

        const toggle = () => {
            console.log("toggle clicked, before:", currentComponent.value)
            currentComponent.value = currentComponent.value === "ComponentA"
                ? "ComponentB"
                : "ComponentA"
            console.log("toggle clicked, after:", currentComponent.value)
        }

        return {
            currentComponent,
            toggle
        }
    },
    render() {
        const compName = this.currentComponent
        const Comp = componentsMap[compName]

        console.log("当前组件：", compName, "对应组件为：", Comp)

        return h("div", {}, [
            h("button", { onClick: this.toggle }, `切换组件 (当前: ${compName})`),
            h(Comp)
        ])
    }
}
