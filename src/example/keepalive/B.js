import { ref , h } from "../../../lib/guide-mini-vue.esm.js"
export const ComponentB = {
  name: 'ComponentB',
  setup() {
    const count = ref(0)
    return { count }
  },
  render() {
    return h('div', {},[
      h('h2', {},'组件B'),
      h('input', {
        type: 'number',
        value: this.count,
        onInput: (e) => { this.count = e.target.value }
      }),
      h('p',{}, `当前数值: ${this.count}`)
    ])
  }
}