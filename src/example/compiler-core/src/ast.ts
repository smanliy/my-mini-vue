export const enum NodeTypes{
    INTERPOLATION,// 插值表达式，例如 {{ message }}
    SIMPLE_EXPRESSION,// 简单表达式，通常是插值里的表达式，如 message、user.name 等
    ELEMENT,// 元素节点，例如 <div>、<span>
    TEXT,// 文本节点，纯文本，不含表达式
    ROOT,// 根节点，代表整个模板的根
    COMPOUND_EXPRESSION // 复合表达式，比如多个字符串拼接 'hello ' + user.name
}