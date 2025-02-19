export const App = {
    render(){
        //返回虚拟节点
        return h("div","hi," +this.msg)
    },
    setup(){
        return {
            msg:"mini-vue"
        }
    }
}