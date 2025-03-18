import { isString } from "../../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";
//代码生成器的主函数，接收AST并返回渲染函数的代码
export function generate(ast: any): any {
  const context = createCodegenContext(); //创建代码生成上下文
  const { push } = context;
  const { functionName, signature } = getFunctionPreamble(ast, context);

  push(`function ${functionName}(${signature}){`); //生成函数定义
  push(`return `);
  //   for(const child of ast.children[0]){
  //     console.log("generate——>ast.children",child)
  //   }
  //   console.log("generate——>ast.children",ast.children[0],ast.children[1])
  genNode(ast.codegenNode, context); //生成代码节点
  //   console.log("mmmmm",ast.codegenNode); // 打印生成的代码
  push("}"); //生成结束
  //   console.log("context.code",context.code); // 打印生成的代码
  return {
    code: context.code,
  };
}
// 创建代码生成的上下文
function createCodegenContext(): any {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
    helper(key: any) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
//生成代码的前置部分,头部,（前面的导入什么的）
function getFunctionPreamble(ast: any, context: any) {
  const { push, helper } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s: any) => `${helperMapName[s]}:${helper(s)}`;
  if (ast.helpers.length > 0) {
    // console.log("ast",ast)
    // console.log("ast.helpers",ast.helpers)
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`
    );
  }

  push("\n");
  push("return ");
  const functionName = "render"; // 生成的渲染函数名
  const args = ["_ctx", "_cache"]; // 传递给渲染函数的参数
  const signature = args.join(", ");
  console.log("signature——>", signature);
  return { functionName, signature };
}
// 生成代码节点
function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;

    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      getExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      // console.log("genNode——>switch-case——>node.children——>",node.children)
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

// 处理复合表达式
function genCompoundExpression(node: any, context: any) {
    // 从 `context` 中解构出 `push` 方法，用于生成最终的代码
  const { push } = context;
   // 获取 `node`（复合表达式节点）的子节点数组
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // 如果当前子节点是字符串（即运算符 " + " 之类的）
    if (isString(children[i])) {
    // 直接推入最终代码字符串
      push(child);
    } else {
        // 如果是 AST 节点，递归调用 `genNode` 继续处理
      genNode(child, context);
    }
  }
}
// 处理 HTML 元素节点
function genElement(node: any, context: any) {
  const { push, helper } = context;
  const { tag, children ,props} = node;
  console.log("props——>", props);
  console.log("genElement.children——>", children);
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag,props,children]),context)
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    genNode(child, context);
  }
  // genNode(children,context)
  push(")");
}
function genNullable(args:any){
    return args.map((arg:any)=> arg || "null")
}
function genNodeList(nodes:any,context:any){
   const {push} = context
    for(let i = 0 ;i < nodes.length;i++){
        const node = nodes[i];
        if(isString(node)){
            push(node)
        }else{
            genNode(node,context)
        }
        if(i < nodes.length - 1){
            push(",")
        }
    }
}
// 处理表达式
function getExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
// 处理插值（{{ }}）
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}
// 处理纯文本节点
function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
