export function shouldUpdateComponent(n1: any, n2: any): boolean {
  // 如果组件类型不同，一定更新（ComponentA → ComponentB）
  if (n1.type !== n2.type) {
    return true;
  }

  const prevProps = n1.props || {};
  const nextProps = n2.props || {};

  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  for (const key of nextKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  // 如果 type 相同、props 内容也一样 → 不需要更新
  return false;
}


