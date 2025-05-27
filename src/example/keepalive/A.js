import { ref , h } from "../../../lib/guide-mini-vue.esm.js"
export const ComponentA = {
  name: 'ComponentA',
  setup() {
    const message = ref('')
    return { message }
  },
  render() {
    return h('div', {},[
      h('h2', {},'组件A'),
      h('input', {
        value: this.message,
        onInput: (e) => { this.message = e.target.value }
      }),
      h('p', {},`输入内容: ${this.message}`)
    ])
  }
}