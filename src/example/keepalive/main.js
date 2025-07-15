import {  createApp,KeepAlive,createRender } from '../../../lib/guide-mini-vue.esm.js'
import { App } from './App.js'
import { createElement,pathProp,insert, remove,setElement} from '../../../lib/guide-mini-vue.esm.js'
const rootContainer = document.querySelector("#app")

createApp(App).mount(rootContainer)
const { _, _internal } = createRender({
    createElement,
    pathProp,
    insert,
    remove,
    setElement
})
KeepAlive.__injectPatch__(_internal.getPatch()) 