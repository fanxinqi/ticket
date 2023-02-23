const sleep = require("./utils/sleep");
const singleBrower = require("./utils/single-brower")({
  headless: false,
});
// 购票机
class TicketMachine {
  constructor() {
    this._brower = singleBrower.getInstance();
  }
  async _verificate() {
    try {
      // 模拟滚动验证码
      await this._brower.page.waitForSelector("#nc_1__scale_text");
      const scaleText = await this._brower.page.waitForSelector(
        "#nc_1__scale_text"
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

      //刷新验证码
      let $ = await this._brower.await("#nc_1_refresh1");
      if ($ && $("#nc_1_refresh1").length) {
        await this._brower.page.click("#nc_1_refresh1");
        // retry
        await this._verificate();
      }
    } catch (error) {
      log.error(`验证码失败:${error}`);
    }
  }

  // 登陆
  async _login(email, password) {
    try {
      // 输入账密
      await this._brower.await("#J-userName", 20);
      await this._brower.page.type("#J-userName", email || "610583102@qq.com");
      await this._brower.page.type("#J-password", password || "fanxinqi123");

      // 点击登录
      await this._brower.page.click("#J-login");

      await this._verificate();

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
    await this._brower.page.click(
      `#normal_passenger_id li:nth-child(${passengerIndex}) input`
    );
    await this._brower.page.click("#submitOrder_id");
    // await this._brower.page.waitForSelector("#qr_submit_id");
    await this._brower.page.waitForTimeout(100);
  }
  // 预定车票
  async reserve() {
    //{ train = "K401", email, password }
    // 打开车次列表页面
    let $ = await this._brower.open(
      "https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=%E5%8C%97%E4%BA%AC%E8%A5%BF,BXP&ts=%E5%91%A8%E5%8F%A3%E4%B8%9C,ZKF&date=2023-02-25&flag=N,N,Y",
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

    // 点击预订
    await this._brower.page.click(
      `#queryLeftTable tr:nth-child(${index}) .no-br a`
    );

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
