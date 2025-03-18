import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

//transform函数作用：遍历AST，修改AST
export function transform(root: any, options: any = {}) {
  const context: any = createTransformContext(root, options);
  //1.遍历——深度优先搜索
  traverseNode(root, context);
  // 2. 生成codegenNode，作为最终代码生成的入口
  createRootCodegen(root);
  // 3. 收集所有使用的helpers
  root.helpers = [...context.helpers.keys()];
}
// 创建转换的上下文对象
function createTransformContext(root: any, options: any) {
    if (options) {
      const context = {
        root,
        nodeTransforms: options.nodeTransforms || [], // AST转换插件
        helpers: new Map(),// 存储需要的运行时工具函数
        helper(key: any) {
          context.helpers.set(key, 1);
        },
      };
      return context;
    }
  }
// 根据根节点的类型，生成相应的codegenNode
function createRootCodegen(root: any) {
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}
//深度优先遍历dom树，递归,( 深度优先遍历AST节点)
function traverseNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms;
  const exitFns: any = [];
    // 应用transform插件
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    const onExit = transform(node, context);
    if (onExit) {
      exitFns.push(onExit);
    }
  }
  // console.log("traverseNode——>",node)
  // console.log("traverseNode.type——>",node.type)
   // 根据节点类型处理
  switch (node.type) {
     // 处理插值表达式，标记需要使用TO_DISPLAY_STRING helper函数
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:

    case NodeTypes.ELEMENT:
        // 继续遍历子节点
      traverseChildren(node, context);
      break;
    default:
      break;
  }
  // 执行退出时的回调函数（用于处理一些收尾逻辑）
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }         
}
// 遍历子节点
function traverseChildren(node: any, context: any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      traverseNode(node, context);
    }
  }
}

