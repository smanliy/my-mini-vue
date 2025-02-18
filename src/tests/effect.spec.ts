import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happpy path", () => {
    const user = reactive({ age: 10 });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    // //update
    user.age++;
    expect(nextAge).toBe(12);
  });
  // 实现effect返回runner
  // effect返回一个函数(runner),执行这个函数，返回fn的返回值
  it("should return runner when call effect", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(r).toBe("foo");
  });
  //   effect的scheduler
  //功能:
  //1.当effect第一次执行时，fn执行，scheduler不执行
  //2.当第二次执行effect时，fn不执行，scheduler执行
  //3.当调用runner时，fn执行
  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });

    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);

    run();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3;
    obj.prop++
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
    // 为什么会出现重新收集依赖？
    // track 执行一次 是指在 getter 访问时，会将副作用添加到依赖集合中。只执行一次 是指，同一属性的 getter 只会触发一次依赖收集（而不是每次访问时都重新收集）。
    obj.prop = 4;
    expect(dummy).toBe(4);
  });
  it("onStop",()=>{
    const obj= reactive({foo:1,});
    const onStop = jest.fn();
    let dummy;
    const runner = effect(()=>{ 
    dummy = obj.foo
  },
  {  onStop,
  })
  stop(runner);
  expect(onStop).toHaveBeenCalledTimes(1);

});



})
