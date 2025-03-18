import { NodeTypes } from "../ast";
// 文本合并转换函数
export function transformText(node: any) {
    //  判断是否是文本类型的节点（文本或插值）
  function isText(node: any) {
    return (
      node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
    );
  }
    // 只有 ELEMENT 类型的节点才进行处理
  if (node.type == NodeTypes.ELEMENT) {
    return () => {
      // 只有 ELEMENT 类型的节点才进行处理  
      const { children } = node;
    //  存储当前的复合表达式容器
      let currentContainer;
      // 遍历子节点
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // 如果当前子节点是文本或插值
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            // 如果下一个节点也是文本或插值
            if (isText(next)) {
            // 如果 currentContainer 为空，则创建一个 COMPOUND_EXPRESSION 作为容器
              if (!currentContainer) {

                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],// 以当前文本作为初始子节点
                };
              }
            }
             // 如果 currentContainer 存在（说明当前是在合并多个文本）
            if (currentContainer) {
                console.log("currentContainer", currentContainer);
              // 插入拼接符 `+`

              currentContainer.children.push(" + ");
              // 添加下一个文本节点
              currentContainer.children.push(next);
              

              // 删除原来的 `next` 节点（已合并进容器）
              children.splice(j, 1);
              
              // 因为 `splice` 删除了元素，索引要回退一位
              j--;
            } else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
}
