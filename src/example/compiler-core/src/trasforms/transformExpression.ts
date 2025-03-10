import { NodeTypes } from "../ast";

export function transformExpression(node:any){
    if(node.type === NodeTypes.INTERPOLATION){
        // 处理插值
       node.content = processExpression(node.content)
    }
}
function processExpression(node:any){
    node.content = `_ctx.${node.content}`
    return node
}