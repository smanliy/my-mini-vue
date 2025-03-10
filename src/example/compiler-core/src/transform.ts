import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

//transform函数作用：遍历AST，修改AST
export function transform(root:any,options:any = {}){
    const context:any = createTransformContext(root,options)
    //1.遍历——深度优先搜索//2.修改text content
    traverseNode(root,context)
    //root.codegenNode
    createRootCodegen(root)
    root.helpers = [...context.helpers.keys()]
}
function createRootCodegen(root:any){
    const child = root.children[0];
    if(child.type === NodeTypes.ELEMENT ){
    root.codegenNode = child.codegenNode
}else{
    root.codegenNode = root.children[0]
}
}
//深度优先遍历dom树，递归
function traverseNode(node:any,context:any){
    

    const nodeTransforms = context.nodeTransforms
    const exitFns :any  = []
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node,context)
        if(onExit){
            exitFns.push(onExit)
        }
    }
    switch(node.type){
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break;
        case NodeTypes.ROOT:

        case NodeTypes.ELEMENT:
            traverseChildren(node,context)
            break
        default:
            break;
    }
    let i = exitFns.length
    while(i--){
        exitFns[i]()
    }
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
    if(options){
        const context = {
            root,
            nodeTransforms:options.nodeTransforms || [],
            helpers:new Map(),
            helper(key:any){
                context.helpers.set(key,1)
            }
        }
        return context
    }

}

