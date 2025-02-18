import { isProxy, isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
  });

  // 嵌套对象转换功能
  it("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
        nested1:{
            noo:9
        }
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
    expect(isReactive(observed.nested.nested1)).toBe(true);
    expect(isProxy(observed)).toBe(true);
  });
});
