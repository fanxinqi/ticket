const BrowerPage = require("./browser-page");
const singleBrower = (orgs) => {
  let instance;
  const createInstance = () => {
    return new BrowerPage(
      Object.assign(
        {
          headless: false,
          args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
          ],
        },
        orgs
      )
    );
  };

  return {
    getInstance(type) {
      if (type === 'restart') {
        return this.restart
      }
      return instance || (instance = createInstance()); // 如果instance 变量是有值的就直接返回，如果是没有值的就调用生成对象返回并赋值给instance
    },
    restart: async () => {
      if (instance && instance.destroy) {
        await instance.destroy();
      }
      instance = createInstance();
      return instance;
    },
  };
};

module.exports = singleBrower;
