const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const log = require("./log.js");
const sleep = require("./sleep");
const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");

/**
 * 浏览器页面类
 * @class BrowerPage
 * @param {
 *    proxyServer: 代理地址,
 *    ua:浏览器ua,
 *    loadPageOpiton = {
 *      waitTime: 500,
 *      retryTime: 20,
 *      n: 0
 *    },
 *    headless = true 是否启动无头浏览器,
 *    saveHtmlLocal = false
 * }
 */
class BrowerPage {
  constructor({
    proxyServer,
    ua,
    loadPageOpiton,
    headless = true,
    saveHtmlLocal = false,
  } = {}) {
    this.ua = ua;
    this.headless = headless;
    this.args = ["--no-sandbox"];
    if (proxyServer) {
      this.args.push(`--proxy-server=${proxyServer}`);
    }
    log.info(this.args);
    this.defaultLoadPageOption = Object.assign(
      { waitTime: 500, retryTime: 20, n: 0 },
      loadPageOpiton
    );
    this.saveHtmlLocal = saveHtmlLocal;
  }

  /**
   * 初始化浏览器对象
   */
  async initBrower() {
    const params = {
      headless: this.headless,
    };
    if (this.args) {
      params["args"] = this.args;
    }
    const browser = await puppeteer.launch(params);
    this.browser = browser;
  }

  /**
   * 初始化页面对象
   */
  async initPage() {
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    if (this.ua) {
      await page.setUserAgent(this.ua);
    }

    // webdriver pass
    await page.evaluateOnNewDocument(() => {
      const newProto = navigator.__proto__;
      delete newProto.webdriver; //删除 navigator.webdriver字段
      navigator.__proto__ = newProto;
    });

    // hook request
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.isInterceptResolutionHandled()) return;
      if (
        // request.url().endsWith(".css") ||
        // request.url().endsWith(".png") ||
        // request.url().endsWith(".jpg") ||
        request.url().startsWith("https://res.zhipin.com") ||
        request.url().startsWith("https://arms-retcode.aliyuncs.com") ||
        request.url().startsWith("https://img.bosszhipin.com") ||
        request.url().startsWith("https://img.bosszhipin.com")
      ) {
        request.abort();
      } else request.continue();
    });

    this.page = page;
  }

  /**
   * 销毁页面对象
   */
  async destroy() {
    if (this.page && this.page.close) {
      await this.page.close();
    }

    if (this.browser && this.browser.disconnect) {
      this.browser.disconnect();
    }
    if (this.browse && this.browser.close) {
      await this.browser.close();
    }

    this.browser = null;
    this.page = null;
    log.info(`brower destroy`);
  }

  /**
   * 获取页面文档Jquery对象
   */
  async getPageHtml(n = 0) {
    let html;
    try {
      html = await this.page.content({
        waitUntil: "networkidle0",
      });
      return html;
    } catch (error) {
      n++;
      if (n > 3) {
        log.error("获取网页上下文错误" + error);
        return null;
        // throw new Error('retry time out')
      } else {
        await sleep(1000);
        return await this.getPageHtml(n);
      }
    }
  }

  /*
   * 等待元素出现
   * @desc 自己简单利用waitForTimeout 实现了一下对应功能, why this function?
   * 背景：puppeteer issues https://github.com/puppeteer/puppeteer/issues/8716，各种亲自实验，不好用
   * @param {string | Array<string>} selecters 单选择器或多个选择器，选择器命中一个说明加载完毕
   * @param {object} options 参数描述
   * @param {number} option.waitTime 页面加载时间,毫秒
   * @param {number} option.retryTime 页面重试次数
   * @param {n} option.n 当前次数
   * @return {object} result 参数描述
   * @return {object} result.$ 当前页面jquery 对象
   * @return {object} result.page 当前页面对象
   */
  async waitForSelecter(selecters, options) {
    log.info(`正在获取${selecters}`);
    let { waitTime, retryTime, n } = Object.assign(
      this.defaultLoadPageOption,
      options || {}
    );

    await this.page.waitForTimeout(waitTime);
    let html = await this.getPageHtml();
    const $ = cheerio.load(html);
    // no selecter
    if (!selecters) {
      const pathName = this.getCurrentPagePath();
      if (pathName && this.saveHtmlLocal) {
        this.saveHtml(pathName, html);
      }
      return $;
    }
    if (n > retryTime - 1) {
      log.warn("retry time out");
      return null;
      // throw new Error('retry time out')
    }
    // log.info(`第${n + 1}次尝试获取目标元素`);

    const loadEnd = Array.isArray(selecters)
      ? selecters.some((selecter) => $(selecter).length > 0)
      : $(selecters).length > 0;
    // 目标元素存在
    if (loadEnd) {
      log.info(`获取到${selecters}`);
      const pathName = this.getCurrentPagePath();
      if (pathName && this.saveHtmlLocal) {
        this.saveHtml(pathName, html);
      }
      return $;
    } else {
      n++;
      // retry
      const target = await this.waitForSelecter(selecters, {
        waitTime,
        retryTime,
        n,
      });
      return target;
    }
  }

  /**
   *
   * @param {string} url
   * @param {number} waitTime
   * @returns  {object} {
   *   $， // jquery 对象
   *   page // 无头浏览器页面对象
   * }
   */
  async open(url, selecters, options) {
    if (!this.browser) {
      await this.initBrower();
    }
    if (!this.page) {
      await this.initPage();
    }

    try {
      // fix error: fyi => https://github.com/puppeteer/puppeteer/issues/3323 & https://blog.csdn.net/lwdfzr/article/details/106471976
      await this.page.goto(url, { waitUntil: "networkidle0" });
    } catch (error) {
      log.error(error);
      return null;
    }
    //
    let result;
    try {
      result = await this.waitForSelecter(selecters, { n: 0 });
    } catch (error) {
      log.error(error);
      return null;
    }
    return result;
  }

  async getPageJqueryForSelecter(selecters, options = { n: 0 }) {
    const result = await this.waitForSelecter(selecters, options);
    return result;
  }

  saveHtml(name, html) {
    const day = dayjs().format("YYYY-MM-DD");
    const filePath = path.join(__dirname, `../storage/${day}`);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    const pathName = path.join(filePath, name.split("/").join("___"));
    try {
      fs.writeFileSync(pathName, html, {
        encoding: "utf8",
      });
      log.info(`save html:${pathName}`);
    } catch (error) {
      log.error(error);
    }
  }

  getCurrentPagePath() {
    let pathName;
    try {
      pathName = new URL(this.page.url()).pathname;
    } catch (error) {}
    return pathName;
  }
  async await(selecters, retryTime = 3) {
    return await this.waitForSelecter(selecters, { n: 0, retryTime });
  }
}

module.exports = BrowerPage;
