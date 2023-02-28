const sleep = require("./utils/sleep");
const log = require("./utils/log.js");
const singleBrower = require("./utils/single-brower")({
  headless: false,
});
const fs = require("fs");
const path = require("path");
// 购票机
class TicketMachine {
  constructor() {
    this._brower = singleBrower.getInstance();
  }
  async _verificate() {
    log.info("正在校验验证码~");
    try {
      // 模拟滚动验证码
      await this._brower.await("#nc_1_wrapper", 10);
      const scaleText = await this._brower.page.waitForSelector(
        "#nc_1_wrapper"
      );
      const scaleTextBoundingBox = await scaleText.boundingBox();
      const moveWidth = scaleTextBoundingBox.width;

      const box = await this._brower.page.waitForSelector("#nc_1_n1z");

      const bounding_box = await box.boundingBox();

      await this._brower.page.mouse.move(
        Math.floor(bounding_box.x + bounding_box.width / 2),
        Math.floor(bounding_box.y + bounding_box.height / 2)
      );
      await this._brower.page.waitForTimeout(100);
      await this._brower.page.mouse.down();
      await this._brower.page.waitForTimeout(100);
      await this._brower.page.mouse.move(
        Math.floor(bounding_box.x + moveWidth),
        Math.floor(bounding_box.y + bounding_box.height / 2)
      );
      await this._brower.page.waitForTimeout(100);
      await this._brower.page.mouse.up();
      await this._brower.page.waitForTimeout(200);
      log.info("加速进行中~");
      //刷新验证码
      let $ = await this._brower.await("#nc_1_refresh1");
      if ($ && $("#nc_1_refresh1").length) {
        await this._brower.page.click("#nc_1_refresh1");
        // retry
        await this._verificate();
      }

      log.info("验证码校验成功~");
    } catch (error) {
      log.error(`验证码失败:${error}`);
    }
  }

  // 登陆
  async _login(email, password) {
    log.info("正在登陆~");
    try {
      // 输入账密
      await this._brower.await("#J-userName", 20);
      await this._brower.page.type("#J-userName", email || "610583102@qq.com");
      await this._brower.page.type("#J-password", password || "fanxinqi123");
      await sleep(100);
      // 点击登录
      await this._brower.page.click("#J-login");

      await this._verificate();
      log.info("登陆成功~");
      return true;
    } catch (error) {
      log.error(`登陆失败:${error}`);
    }
  }

  // 订单
  async _orderPage() {
    let $ = await this._brower.await(
      ["#content_defaultwarningAlert_hearder", "#normal_passenger_id"],
      20
    );

    // 提示用户未登陆，像是12306的bug，手动操作也会触发
    if ($("#content_defaultwarningAlert_hearder").length) {
      throw `用户未登陆成功`;
    }

    if ($("#normal_passenger_id li").length === 0) {
      throw `找不到任何乘车人`;
    }

    let passengerIndex = 0;
    $("#normal_passenger_id li").each((i, item) => {
      const passengerName = $(item).find("label").text();
      if (passengerName === "范新旗") {
        passengerIndex = i + 1;
        return;
      }
    });

    if (passengerIndex === 0) {
      throw "没找到指定乘车人";
    }
    await this._brower.await(
      `#normal_passenger_id li:nth-child(${passengerIndex}) input`
    );
    await this._brower.page.click(
      `#normal_passenger_id li:nth-child(${passengerIndex}) input`
    );
    await this._brower.page.click("#submitOrder_id");
    await this._brower.await("#qr_submit_id");
    await this._brower.page.click("#qr_submit_id");
    log.info("抢票成功～");

    // Return object that you want to get event listeners from e.g. the window object or any other DOM element

    // const jsHandle = await this._brower.page.evaluate(() => {
    //   const addEvent = document.querySelector("#qr_submit_id").addEventListener;
    //   document.querySelector("#qr_submit_id").addEventListener = (...parms) => {
    //     alert(1);
    //     addEvent(...parms);
    //   };
    // });
  }
  // 预定车票
  async reserve() {
    //{ train = "K401", email, password }
    // 打开车次列表页面
    log.info("正在查询车次列表~");
    let $ = await this._brower.open(
      "https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=%E5%8C%97%E4%BA%AC%E8%A5%BF,BXP&ts=%E5%91%A8%E5%8F%A3%E4%B8%9C,ZKF&date=2023-03-14&flag=N,N,Y",
      "#queryLeftTable"
    );

    const $tr = $(`#queryLeftTable tr`);
    let index = -1;
    $tr.each((i, e) => {
      let trainNumber = $(e).find(".train a").text();
      if (trainNumber === "K401") {
        console.log(i, trainNumber);
        index = i + 1;
      }
    });

    if (index === -1) throw "没有找到你要的车次";

    this._brower.page.addScriptTag({
      content:
        `let reserveButton = "#queryLeftTable tr:nth-child(${index}) .no-br .btn72";` +
        fs.readFileSync(
          path.join(__dirname, "./injectedScript/mutation-observer.js"),
          {
            encoding: "utf-8",
          }
        ),
    });

    await this._brower.page.exposeFunction("emit", (event, data) =>
      console.log(event, data)
    );

    await this._brower.page.click(`#query_ticket`);

    // 点击预订
    await this._brower.await(`#queryLeftTable tr:nth-child(${index}) .no-br a`);
    await this._brower.page.click(
      `#queryLeftTable tr:nth-child(${index}) .no-br a`
    );

    log.info("正在预定北京-周口的K401列车～");

    // 登陆
    await this._login();

    // 进入订单页面
    await this._orderPage();
  }

  // 取消预定
  cancel() {}

  // 发送消息
  send() {}
}

(async () => {
  const tm = new TicketMachine();

  const buy = async () => {
    try {
      await tm.reserve();
    } catch (error) {
      buy();
    }
  };

  buy();
})();
