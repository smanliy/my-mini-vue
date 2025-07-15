import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i: any) => i.vnode.el,
  $slots: (i: any) => i.slots,
  $props: (i: any) => i.props,
};
export const publicInstanceProxyHandlers = {
  get: ({ _: instance }: { _: any }, key: any) => {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter =
      publicPropertiesMap[key as keyof typeof publicPropertiesMap];

    if (publicGetter) {
      return publicGetter(instance);
    }
  },

  set: ({ _: instance }: { _: any }, key: any, value: any) => {
    const { setupState, props } = instance;
    console.log(`Proxy set: key=${key}, value=`, value);
    console.log("setupState:", setupState);
    console.log("props:", props);

    if (hasOwn(setupState, key)) {
      const val = setupState[key];
      if (val && val.__v_isRef) {
        val.value = value; 
      } else {
        setupState[key] = value;
      }
      console.log(`Set on setupState: ${key} =`, value);
      return true;
    }

    if (hasOwn(props, key)) {
      console.warn(`Attempting to mutate prop "${key}". Props are readonly.`);
      return false;
    }

    return false;
  },
};
