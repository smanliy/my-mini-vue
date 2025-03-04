import { NodeTypes } from "./ast";
const enum TagType{
    Start,
    End
}
/**
 * 解析模板字符串的入口函数
 * @param content 需要解析的模板字符串
 * @returns 解析后的 AST 根节点
 */
export function baseParse(content: string) {
  //创建全局上下文对象
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}
/**
 * 创建 AST 的根节点
 * @param children AST 子节点数组
 * @returns 包含 children 的根节点对象
 */
function createRoot(children: any) {
  return {
    children,
  };
}
/**
 * 解析模板的子节点
 * @param context 解析上下文
 * @returns 解析出的 AST 节点数组
 */
function parseChildren(context: any) {
  // 用于存储解析出的 AST 节点
  const nodes = [];
  let node;
  let s = context.source
  // 如果当前 source 以 "{{" 开头，说明是插值表达式
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  }else if(s[0] ==="<"){
    if(/[a-z]/i.test(s[1])){
        node = parseElement(context)
    }
  }
  // 将解析出来的节点添加到数组中
  nodes.push(node);
  // 返回解析出的子节点
  return nodes;
}

function parseElement(context:any){
    //解析tag
    const element =  parseTag(context,TagType.Start)
    console.log("_____",context.source)
    parseTag(context,TagType.End)
    console.log("_____",context.source)
    return element
}
function parseTag(context:any,type:TagType){
    const match = /^<\/?([a-z]*)/i.exec(context.source)
    console.log(match)
    let tag;
    if(match){
        tag = match[1]
        advanceBy(context,match[0].length)
        advanceBy(context,1)
        console.log(context)
    }
    if(type === TagType.End) return
    return {
        type:NodeTypes.ELEMENT,
        tag:tag,
    }
}
/**
 * 创建解析上下文
 * @param content 模板字符串
 * @returns 解析上下文对象
 */
function createParserContext(content: string) {
  return {
    source: content,
  };
}

function parseInterpolation(context: any) {
  //{{message}}
  // 定义插值表达式的起始和结束标志
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 找到插值表达式的结束位置
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    closeDelimiter.length
  );
  // 跳过 "{{"
  advanceBy(context, openDelimiter.length);
  // 计算插值表达式的内容长度
  const rawContentLength = closeIndex - openDelimiter.length;
  // 获取插值表达式的内容
  const rawContent = context.source.slice(0, rawContentLength);
  // 去除前后空格
  const content = rawContent.trim();
  // 跳过 `rawContentLength + closeDelimiter.length` 长度，移动解析位置
  advanceBy(context, rawContentLength + closeDelimiter.length);
  // 返回解析出的 AST 节点
  return {
    type: NodeTypes.INTERPOLATION,

    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

/**
 * 跳过指定长度的字符
 * @param context 解析上下文
 * @param length 需要跳过的字符数量
 */

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
