import { getCurrentInstance } from "../component";

export function provide(key: string, value: any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { providers } = currentInstance;
    // 获取父组件的 providers 对象
    const parentProvides = currentInstance.parent.providers;
    // 如果当前组件实例的 providers 对象与父组件的 providers 对象相同
    if (providers === parentProvides) {
      // 创建一个新的 providers 对象，并将其原型设置为父组件的 providers 对象
      providers = currentInstance.providers = Object.create(parentProvides);
    }

    providers[key] = value;
  }
}
export function inject(key: string, defaultValue: any) {
  const currentInstance = getCurrentInstance();

  if (currentInstance) {
    // 获取父组件的 providers 对象
    const parentProvides = currentInstance.parent.providers;
    if (key in parentProvides) {
      // 返回父组件的 providers 对象中的值
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
    } else {
      // 如果没有找到该键，则返回默认值
      return defaultValue;
    }
  }
}
