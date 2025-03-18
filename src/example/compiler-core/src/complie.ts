import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./trasforms/transformElement";
import { transformExpression } from "./trasforms/transformExpression";
import { transformText } from "./trasforms/transformText";

//将template编译成render函数
export function baseCompile(template:any){
      const ast:any = baseParse(template);
            transform(ast,{
              nodeTransforms:[
                transformExpression,
                transformText,
                transformElement,
    
                ]
            });
            return  generate(ast);
}