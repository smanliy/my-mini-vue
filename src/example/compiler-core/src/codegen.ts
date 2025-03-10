import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast: any): any {
  const context = createCodegenContext();
  const { push } = context;
  const { functionName, signature } = getFunctionPreamble(ast, context);

  push(`function ${functionName}(${signature}){`);
  push(`return `);
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}
function getFunctionPreamble(ast: any, context: any) {
    const {push,helper} = context
    const VueBinging = "Vue";
    const aliasHelper = (s: any) => `${helperMapName[s]}:${helper(s)}`;
    if(ast.helpers.length > 0){
        push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`);
    }
    
    push("\n");
    push("return ");
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    return { functionName, signature };
}

function genNode(node: any, context: any) {
  
  switch(node.type) {
    case NodeTypes.TEXT:
        genText(node, context);
    break;

    case NodeTypes.INTERPOLATION:
        genInterpolation(node,context)
        break;
    case NodeTypes.SIMPLE_EXPRESSION:
        getExpression(node,context)
        break;
  }
}
function getExpression(node:any,context:any){
    const {push} = context
    push(`${node.content}`)
}
function genInterpolation(node: any, context: any){
    const {push,helper} = context;
    push(`${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content,context)
    push(")")
}

function genText(node: any, context: any) {
    const { push } = context;
    push(`'${node.content}'`);
}

function createCodegenContext(): any {
  const context = {
    code: "",
    push(source: string) {
      context.code += source;
    },
    helper(key:any){
        return `_${helperMapName[key]}`
    }
  };
  return context;
}
