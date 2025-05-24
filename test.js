import { types } from "@babel/core";

const ast = {
    type: Root,
    children: [
        {
            type: Element,
            tag: 'div',
            children: [
                {
                    type: Element,
                    tag: 'p',
                    children: [
                        {
                            type: Text,
                            content: 'Age:'
                        },
                        {
                            type: INTERPOLATION,
                            content: {
                                type: Simple,
                                content: 'message'
                            }
                        }
                    ]
                }
            ]
        }
    ]

}