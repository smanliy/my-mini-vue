import { ref, h, KeepAlive } from "../../../lib/guide-mini-vue.esm.js"
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
        console.log("App render 当前组件:", currentComponent.value);
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
        return h("div", {}, [
            h("button", { onClick: this.toggle }, `切换组件 (当前: ${compName})`),
            h(KeepAlive, {}, {
                default: () => {
                    const compName = this.currentComponent; // 重新获取
                    const Comp = componentsMap[compName];   // 动态获取组件
                    console.log("KeepAlive slot default 渲染函数执行了，组件是:", Comp.name);
                    return [h(Comp, { key: compName },{})];
                }
            })
            
        ])
    }
}
