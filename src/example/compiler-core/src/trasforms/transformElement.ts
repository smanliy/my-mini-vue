import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";
// 将 AST（抽象语法树）转换成 CodegenNode（代码生成树），它是 Vue 编译器 transform 过程的一部分。在 Vue 编译器中，这一步的作用是 为后续的代码生成阶段（generate）创建一个 codegenNode，确保编译后的代码能正确地创建虚拟节点（VNode）。
export function transformElement(node:any,context:any){
    if(node.type === NodeTypes.ELEMENT){
        return ()=>{
            context.helper(CREATE_ELEMENT_VNODE)
            //中间处理层
            //tag
            const vnodeTag = `'${node.tag}'`
            //props
            let vnodeProps 
            //children
    
            const children = node.children;
            // console.log("transformElement——>",children[1])
            // let vnodeChildren = children[0]
            let vnodeChildren = children.length === 1 ? children[0] : children; 
            const vnodeElement = {
                type :NodeTypes.ELEMENT,
                tag:vnodeTag,
                props:vnodeProps,
                children:vnodeChildren
            }
            node.codegenNode = vnodeElement
            // console.log("transformElement——>node.codegenNode——>",node.codegenNode)
            // console.log("transformElement——>node.children——>",node.children)
        }
        
    }
}