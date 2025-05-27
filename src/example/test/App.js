import { h,ref } from "../../../lib/guide-mini-vue.esm.js"
export const App = {
    name:"App",
    render() {
         console.log('render this.count:', this.count);
        return h('button',{onClick:this.exe},'点我加一' + this.count)
    },
    setup() {
        const count = ref(1);
        const exe  = function(){
            count.value++
            console.log("count.value",count.value)
        }
        return {
            count,exe
        }
    }
}