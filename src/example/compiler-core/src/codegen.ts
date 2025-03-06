export function generate(ast: any): any {
    const context = createCodegenContext()
    const {push} = context
  let code = "";
  push("return ") ;
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");

  push(`function ${functionName}(${signature}){`);
  push(`return `) 
  getNode(ast.codegenNode, context);
  push("}") ;
  return {
    code:context.code
  };
}
function getNode(node: any, context: any) {
    const {push} = context
    push(`'${node.content}'`) ;
}

function createCodegenContext():any{
    const context = {
        code:"",
        push(source:string){
            context.code += source
        }
    }
    return context
}