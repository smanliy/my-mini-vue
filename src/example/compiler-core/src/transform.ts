import { NodeTypes } from "./ast";

//transform函数作用：遍历AST，修改AST
export function transform(root:any,options?:any){
    const context = createTransformContext(root,options)
    //1.遍历——深度优先搜索
    traverseNode(root,context)

    //2.修改text content
}
//深度优先遍历dom树，递归
function traverseNode(node:any,context:any){
    console.log(node)
    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node)
        
    }
    traverseChildren(node, context);
}
function traverseChildren(node: any, context: any) {
    const children = node.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];

            traverseNode(node, context);
        }
    }
}

function createTransformContext(root:any,options:any){
    const context = {
        root,
        nodeTransforms:options.nodeTransforms || []
    }
    return context
}