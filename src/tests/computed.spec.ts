import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
    //ref
    //.value
    it("happy path", () => {
      const value = reactive({
        foo: 1,
      });
  
      const getter = computed(() => {
        return value.foo;
      });
  
      value.foo = 2;
      expect(getter.value).toBe(2);
    });
  //缓存
    it("should compute lazily", () => {
      const value = reactive({
        foo: 1,
      });
      // 是一个 Jest mock 函数，它会记录被调用的次数。最开始它还没有被调用。
      const getter = jest.fn(() => {
        return value.foo;
      });
      //使用 computed 函数将 getter 包装成一个计算属性 cValue。
      const cValue = computed(getter);
  
      // lazy
      //来验证 getter 是否在计算属性创建时被调用。
      expect(getter).not.toHaveBeenCalled();
  //计算属性是如何触发 getter 的：
    // 当你访问 cValue.value 时，getter 会被调用来计算并返回最新的值。第一次访问时，它会从 getter 返回 value.foo，并缓存结果。以后，除非 value.foo 改变，否则 getter 不会再次被调用，计算属性会直接返回缓存值。
      expect(cValue.value).toBe(1);
      expect(getter).toHaveBeenCalledTimes(1);
  
    //   // should not compute again
      cValue.value;
      expect(getter).toHaveBeenCalledTimes(1);
      
      // getter 只有在 访问计算属性 时才会被触发。如果你修改了 value.foo，但没有访问 cValue.value，计算属性会继续保持缓存的值，直到你访问它，才会重新计算。在你修改了 value.foo 后，getter 不会立即重新被调用，除非你再次访问 cValue.value。
      // should not compute until needed
      value.foo = 2;
      expect(getter).toHaveBeenCalledTimes(1);
  
    //   // now it should compute
      expect(cValue.value).toBe(2);
      expect(getter).toHaveBeenCalledTimes(2);
  
    //   // should not compute again
      cValue.value;
      expect(getter).toHaveBeenCalledTimes(2);
    // });
  });
})