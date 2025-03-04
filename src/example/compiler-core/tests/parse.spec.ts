import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"




describe('parse', () => {
    
    describe('插值', () => {
        test('简单需求', () => {
            const ast = baseParse("{{message   }}")

            expect(ast.children[0]).toStrictEqual({
                type:NodeTypes.INTERPOLATION,

                content:{
                    type:NodeTypes.SIMPLE_EXPRESSION,
                    content:"message"
                }
            })
        })
    })
})