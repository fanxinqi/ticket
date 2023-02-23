const { program } = require("commander");

const getOpts = () => {
  program
    .option("-p, --proxy <type>", "proxy server address", "")
    .option(
      "-u, --ua <type>",
      "The User-Agent request header is a characteristic string that lets servers and network peers identify the application, operating system, vendor, and/or version of the requesting user agent",
      ""
    )
    .option(
      "-i, --instance <type>",
      "proxy ip change server instance and change task type",
      ""
    )
    .option(
      "-s, --sleep  <type>",
      "how long to wait after switching ip, in milliseconds",
      0
    )
    .option("-r, --retry  <type>", " number of retry error task", 0)
    .option(
      "-n, --number  <type>",
      "number of  retry get selector form page",
      0
    )
    .option("-h, --headless  <type>", "headless", 1)
    .option("-w, --waittime  <type>", "轮训一次元素时间间隔", 200)
    .option("-l, --localChangeIp  <type>", "是否开关adb链接手机的移动网络", 0)
    .option("-m, --isChangeMacNet  <type>", "是否开关mac网络", 0)
    .option("-c, --changeIp  <type>", "切换ip", "1")
    .option(
      "-sh, --saveHtmlLocal  <type>",
      "是否保存html到本地，路径～/storage/<date>/<url>, url:url.split('/').join('___')",
      "1"
    );

  program.parse();

  return program.opts();
};
module.exports = getOpts;
