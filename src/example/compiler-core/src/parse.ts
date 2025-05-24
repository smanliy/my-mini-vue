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
  return createRoot(parseChildren(context,[]));
}
/**
 * 创建 AST 的根节点
 * @param children AST 子节点数组
 * @returns 包含 children 的根节点对象
 */
function createRoot(children: any) {
  return {
    children,
    type:NodeTypes.ROOT
  };
}
/**
 * 解析模板的子节点
 * @param context 解析上下文
 * @returns 解析出的 AST 节点数组
 */
function parseChildren(context: any,ancestors:any) {
  // 用于存储解析出的 AST 节点
  const nodes = [];
  while(!isEnd(context,ancestors)){
    let node;
    let s = context.source
    // 如果当前 source 以 "{{" 开头，说明是插值表达式
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    }else if(s[0] ==="<"){
      if(/[a-z]/i.test(s[1])){
          node = parseElement(context,ancestors)
      }
    }
    if(!node){
      node = parseText(context)
    }
    // 将解析出来的节点添加到数组中
    nodes.push(node);
  }
 
  // 返回解析出的子节点
  return nodes;
}
//用于判断是否结束了当前模板的解析，它根据两个条件来决定是否停止解析：
function isEnd(context:any,ancestors:any){
    //1.source有值的时候
    //2.当遇到结束标签的时候
    let s = context.source
    // 判断是否已经遇到了一个结束标签，并且判断当前标签是否与祖先标签匹配。
    if( s.startsWith("</")){
        for(let i = ancestors.length - 1;i >= 0;i--){
            const tag =ancestors[i].tag
            if(startsWithTagOpen(context.source,tag)){
                return true
            }
        }
    }
    // 如果 context.source 已经为空，表示没有更多的内容了，因此应该结束解析，返回 true
    return !context.source
}
//解析元素节点
function parseElement(context:any,ancestors:any){
    //解析tag
    const element :any =  parseTag(context,TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context,ancestors)
    ancestors.pop()
    if(startsWithTagOpen(context.source,element.tag)){
        parseTag(context,TagType.End)
    }else{
        throw new Error(`缺少结束标签${element.tag}`)
    }
    return element
}
//解析纯文本
function parseText(context:any){
    let endIndex = context.source.length
    let endTokens = ["<","{{"]
    for(let i = 0; i < endTokens.length;i++){
        const index = context.source.indexOf(endTokens[i])
        if(index != -1 && endIndex > index){
            endIndex = index
        }
    }


    
    //1.获取context.2.text
    const content = parseTextData(context,endIndex);

    return{
        type:NodeTypes.TEXT,
        content:content,
    }

    
}
function parseTextData(context:any,length:number) {
    const content = context.source.slice(0, length);

    advanceBy(context, length);
    return content;
}
//提取标签名
function parseTag(context:any,type:TagType){
    const match = /^<\/?([a-z]*)/i.exec(context.source)
    let tag;
    if(match){
        tag = match[1]
        advanceBy(context,match[0].length)
        advanceBy(context,1)
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
    source: content,//当前还未处理的字符串模版,维护解析进度，即字符串指针
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
function startsWithTagOpen(source:any,tag:any){
    return source.startsWith("</") && source.slice(2,2 + tag.length).toLowerCase() === tag.toLowerCase()
}