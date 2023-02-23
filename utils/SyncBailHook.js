const log = require("./log.js");
class SyncBailHook {
  //钩子是同步的
  constructor(args) {
    //args => ['name']
    this.tasks = [];
  }
  // call(...args) {
  //   let ret //ret代表当前函数的返回值
  //   let index = 0 //index表示当前是第几个函数
  //   do {
  //     ret = this.tasks[index].fn(...args)
  //     index++
  //   } while (ret === undefined && this.tasks.length > index)
  // }
  async callAsync(...args) {
    let ret; //ret代表当前函数的返回值
    let index = 0; //index表示当前是第几个函数
    do {
      log.info(`*******正在执行任务:${this.tasks[index].name}*******`);
      ret = await this.tasks[index].fn(...args);
      log.info(`*******任务执行结束:${this.tasks[index].name}*******`);
      index++;
    } while (ret === undefined && this.tasks.length > index);
  }
  
  tap(name, fn) {
    this.tasks.push({
      name,
      fn,
    });
  }
}

module.exports = SyncBailHook;
// test
// const hook = new SyncBailHook(['arg1', 'arg2'])

// // // 完整task 搜索页面 => 公司页面 =>

// hook.tap('search-page', (arg1, arg2) => {
//   console.log('flag1:', arg1, arg2)
//   arg1.xxx = 1
//   // 存在返回值 阻断flag2事件的调用
//   //   return undefined
// })

// hook.tap('result', (arg1) => {
//   console.log('result:', arg1)
// })

// const content = { id: 1 }

// hook.call(content, { name: 1 })

// hook.call(content, { name: 2 })
