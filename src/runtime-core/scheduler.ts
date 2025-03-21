// 定义一个任务队列，存储需要执行的任务
const quene: any = [];
let isFlushPending = false;
/**
 * 将任务添加到队列中，并保证不重复
 * @param job 需要执行的任务（函数）
 */
const p = Promise.resolve()
// nextTick 本质上是 手动执行微任务，它的作用是 在下一个微任务队列中执行回调，确保 DOM 更新后再运行某些逻辑
// 响应式数据更新后，DOM 不是立即更新的，而是异步批量更新，如果想在数据更新后立即获取最新的 DOM 结构，就需要使用 nextTick。
export function nextTick(fn:any){
    return fn ? p.then (fn) : p
}
export function queneJobs(job: any) {
  // 只有当任务不在队列中时，才添加
  if (!quene.includes(job)) {
    quene.push(job);
  }
  // 打印当前任务队列（用于调试）
  console.log(quene);
  // 触发异步任务调度
  queueFlush();
}

/**
 * 任务调度函数，使用微任务机制异步执行队列中的任务
 */
function queueFlush() {
  if (isFlushPending) {
    return;
  } else {
    isFlushPending = true
    // 使用 Promise.then() 创建微任务，在下一轮事件循环中执行
    nextTick(FlushJobs)

  }

}
function FlushJobs() {
    let job;
    // 循环执行队列中的任务，直到队列为空
    while ((job = quene.shift())) {
        //执行任务
        job && job();
    }
}

