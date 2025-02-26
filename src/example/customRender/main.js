
import { createRender } from "../../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";

// 创建一个新的 PIXI 应用实例
const game = new PIXI.Application();

// 初始化 Pixi 应用，传入配置
await game.init({ width: 500, height: 500 });
console.log(game);  // 查看 game 对象是否包含 canvas 属性

// 使用 game.view 将 canvas 添加到页面
document.body.appendChild(game.canvas);

// 自定义渲染函数
const render = createRender({
    createElement(type) {
        if (type === "rect") {
            const rect = new PIXI.Graphics();
            rect.fill(0xFF0000);
            rect.rect(0, 0, 100, 100);
            rect.fill();
            return rect;
        }
    },
    patchProp(el, key, val) {
        el[key] = val;
    },
    insert(el, container) {
        container.addChild(el);
    }
});

render.createApp(App).mount(game.stage);