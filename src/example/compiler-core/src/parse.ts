import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  //创建全局上下文对象
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function createRoot(children: any) {
  return {
    children,
  };
}

function parseChildren(context: any) {
  const nodes = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }

  nodes.push(node);

  return nodes;
}
function createParserContext(content: string) {
  return {
    source: content,
  };
}

function parseInterpolation(context: any) {
  //{{message}}

  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    closeDelimiter.length
  );
  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = context.source.slice(0, rawContentLength);

  const content = rawContent.trim()
  console.log(context.source);
  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,

    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
