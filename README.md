# my-mini-vue

一个仿 Vue 3 核心源码的迷你实现，用于学习 Vue 3 响应式、编译、运行时三大核心模块的原理。使用 TypeScript 编写，Rollup 打包，支持 ESM / CJS 双格式产物。

## 项目基本信息

| 项           | 值                                          |
| ------------ | ------------------------------------------- |
| 名称         | myvue                                       |
| 版本         | 1.0.0                                       |
| 语言         | TypeScript (target: ES2016, module: ESNext) |
| 构建工具     | Rollup 4 + @rollup/plugin-typescript        |
| 测试框架     | Jest 29 + Babel                             |
| 包管理器     | pnpm                                        |
| 入口（源码） | `src/index.ts`                              |
| 产物（ESM）  | `lib/guide-mini-vue.esm.js`                 |
| 产物（CJS）  | `lib/guide-mini-vue.cjs.js`                 |

## 已实现的功能

### 1. 响应式系统（reactivity）

- `reactive` / `readonly` / `shallowReadonly`：基于 Proxy 的深浅响应式
- `ref`：基本类型/对象类型的 ref 包装
- `effect`：依赖收集与触发，支持嵌套、调度器（scheduler）
- `computed`：基于 effect + 缓存的计算属性
- 依赖收集使用 WeakMap → Map → Set 三层结构

### 2. 编译系统（compiler-core）

- `parse`：模板字符串 → AST（基于有限状态机）
- `transform`：AST → JavaScript AST（含 `transformExpression` / `transformElement` / `transformText`）
- `codegen`：JavaScript AST → 渲染函数代码字符串
- `baseCompile`：完整编译流程入口
- 含 Snapshot 测试（`codegen.spec.ts` / `parse.spec.ts` / `transform.spec.ts`）

### 3. 运行时核心（runtime-core）

- 虚拟 DOM：`createVNode` / `h` / `patch` / `diff`（双端对比）
- 组件系统：`createApp` / `mountComponent` / `updateComponent` / `shouldUpdateComponent`
- 组件实例：`setup` / `setupState` / `render` 渲染 effect
- Props：`componentProps`（含 emit 事件名 → props.key 转换）
- Slots：`componentSlots`（默认/具名/作用域插槽）
- Provide / Inject：跨层级依赖注入
- 生命周期：`onMounted` / `onUpdated` 等
- `getCurrentInstance`：组件实例获取
- Scheduler：异步更新队列，支持 `nextTick`
- **KeepAlive**：组件缓存与激活/失活（activate / deactivate）

### 4. 运行时 DOM（runtime-dom）

- 节点操作：`createElement` / `insert` / `remove` / `setElement`
- 属性操作：`pathProp`（class/style/事件/普通属性）
- `createRender`：可定制的渲染器工厂
- `registerRuntimeCompiler`：把编译器与运行时绑定

### 5. 编译+运行时整合

- `compileToFunction`：模板 → 渲染函数（通过 `new Function("Vue", code)(runtimeDom)`）
- 支持运行时编译：未传 render 时自动编译 template

## 使用方法

### 安装依赖

```bash
pnpm install
```

### 构建产物

```bash
pnpm build
```

构建完成后会在 `lib/` 目录下生成：

- `lib/guide-mini-vue.cjs.js`（CommonJS 格式）
- `lib/guide-mini-vue.esm.js`（ESM 格式，浏览器示例使用此文件）

### 运行测试

```bash
pnpm test
```

测试覆盖响应式系统与编译器核心。

### 运行示例

示例位于 `src/example/` 下，使用浏览器原生 ES Modules，需要通过 HTTP 服务器访问（不能直接双击 `file://` 打开）：

```bash
# 在项目根目录启动静态服务器
python -m http.server 8080

# 浏览器访问任一示例
# http://localhost:8080/src/example/keepalive/index.html
# http://localhost:8080/src/example/componentEmits/index.html
# http://localhost:8080/src/example/componentSlots/index.html
# ...
```

#### 示例代码示例（以 KeepAlive 为例）

`src/example/keepalive/main.js`：

```js
import {
  createApp,
  KeepAlive,
  createRender,
} from "../../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
import {
  createElement,
  pathProp,
  insert,
  remove,
  setElement,
} from "../../../lib/guide-mini-vue.esm.js";

const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);

const { _, _internal } = createRender({
  createElement,
  pathProp,
  insert,
  remove,
  setElement,
});
KeepAlive.__injectPatch__(_internal.getPatch());
```

## 文件架构

```
my-mini-vue/
├── src/
│   ├── index.ts                    # 出口：导出 runtime-dom / runtime-core / reactivity，并注册运行时编译器
│   │
│   ├── reactivity/                 # 响应式系统
│   │   ├── reactive.ts             # reactive / readonly / shallowReadonly
│   │   ├── baseHandler.ts          # Proxy handlers（mutableHandlers / readonlyHandlers / shallowHandlers）
│   │   ├── ref.ts                 # ref 实现
│   │   ├── effect.ts              # effect / 依赖收集 / trigger / scheduler / nextTick
│   │   ├── computed.ts            # computed 实现
│   │   ├── index.ts               # 模块出口
│   │   └── tests/                 # Jest 测试（reactive/ref/effect/computed/readonly/shallowReadonly）
│   │
│   ├── runtime-core/               # 运行时核心（与平台无关）
│   │   ├── createApp.ts           # createApp / mount
│   │   ├── createVNode.ts         # createVNode / h
│   │   ├── render.ts              # createRender / patch / processComponent / mountComponent / updateComponent
│   │   ├── component.ts           # createComponentInstance / setupComponent / setupStatefulComponent / getCurrentInstance
│   │   ├── componentEmit.ts       # emit 实现
│   │   ├── componentProps.ts      # props 处理
│   │   ├── componentSlots.ts     # slots 处理
│   │   ├── componentPublicInstance.ts  # 公共实例代理（this.xxx 访问）
│   │   ├── componentUpdateUtils.ts# 组件更新工具
│   │   ├── keepalive.ts           # KeepAlive 组件（缓存 / activate / deactivate）
│   │   ├── scheduler.ts           # 异步更新调度队列
│   │   ├── helpers/
│   │   │   ├── apiInject.ts       # provide / inject
│   │   │   └── renderSlots.ts     # 插槽渲染辅助
│   │   └── index.ts               # 模块出口
│   │
│   ├── runtime-dom/                # 浏览器 DOM 平台层
│   │   └── index.ts               # createElement / pathProp / insert / remove / setElement / createRender / registerRuntimeCompiler
│   │
│   ├── shared/                     # 共享工具
│   │   ├── shapeFlags.ts          # ShapeFlags 位标记（ELEMENT/STATEFUL_COMPONENT/SLOTS/CHILDREN/KEEP_ALIVE_COMPONENT 等）
│   │   ├── toDisplayString.ts     # 模板字符串插值显示
│   │   └── index.ts
│   │
│   ├── component/                  # 复用组件（旧路径）
│   │   └── keepalive/
│   │       ├── index.ts
│   │       └── keepalive.ts
│   │
│   └── example/                    # 各功能示例（每个目录一个完整 demo）
│       ├── apiInject/              # provide / inject 示例
│       ├── compiler-base/          # 编译基础示例
│       ├── compiler-core/          # 完整编译器源码 + 测试
│       │   ├── src/
│       │   │   ├── ast.ts
│       │   │   ├── parse.ts        # 模板 → AST
│       │   │   ├── transform.ts    # AST 转换
│       │   │   ├── codegen.ts      # AST → 渲染函数代码
│       │   │   ├── complie.ts      # baseCompile 入口
│       │   │   ├── runtimeHelpers.ts
│       │   │   └── trasforms/      # 各类型节点的 transform
│       │   └── tests/              # 编译器单测 + 快照
│       ├── componentEmits/         # emit 示例
│       ├── componentSlots/         # 插槽示例
│       ├── componentUpdate/        # 组件更新示例
│       ├── currentInstance/        # getCurrentInstance 示例
│       ├── customRender/           # 自定义渲染器示例
│       ├── helloworld/             # 入门示例
│       ├── keepalive/              # KeepAlive 示例（A/B 组件状态保留）
│       ├── nextTicker/             # nextTick 示例
│       ├── patchChildren/          # 子节点 diff（Array/Text 互转）
│       ├── test/                   # 综合测试示例
│       ├── update/                 # 响应式更新示例
│       └── vForIf/                 # v-for / v-if 示例
│
├── lib/                            # 构建产物
│   ├── guide-mini-vue.cjs.js
│   └── guide-mini-vue.esm.js
│
├── 日志/                           # 开发日志
│   └── keepalive开发日志.md
│
├── rollup.config.mjs               # Rollup 构建配置
├── tsconfig.json                   # TypeScript 配置
├── babel.config.js                 # Babel 配置（Jest 用）
├── package.json
├── pnpm-lock.yaml
├── test.js
├── MYREADME.md                     # 笔记（emit / slot / patch 原理）
└── README.md
```

## 核心数据流

```
用户代码 (App.js)
   │  createApp(App).mount(rootContainer)
   ▼
runtime-dom: createRender({ createElement, pathProp, insert, ... })
   │  返回 patch / render
   ▼
runtime-core: patch(n1, n2, container)
   │  根据 ShapeFlags 分发
   ├──► processElement  → mountElement / patchElement（diff）
   ├──► processComponent → mountComponent → setupComponent → setupRenderEffect
   └──► processText    → setText
                │
                ▼
        响应式 effect 触发 → 重新执行 render → 生成新 vnode → patch 对比 → 最小化 DOM 更新
```

## KeepAlive 工作原理（本项目重点）

1. `KeepAlive` 是一个 `__isKeepAlive: true` 的特殊组件，`setup` 中给当前实例挂上 `activate` / `deactivate` 方法
2. 渲染时通过 `slots.default()` 拿到内部组件，按 `vnode.type` 缓存到外部 `Map` 中
3. 切换组件时：
   - 旧组件走 `deactivate`：`subTree.el.style.display = "none"`（DOM 保留，仅隐藏）
   - 新组件若已缓存：走 `activate`（恢复 display，复用 component 实例，保留状态）
   - 新组件未缓存：正常 `mountComponent`
4. 关键点：缓存复用时不能调用 `mountComponent`，否则会重建实例导致状态丢失
