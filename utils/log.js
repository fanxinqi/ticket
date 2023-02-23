const fs = require("fs");
// color原理:https://blog.csdn.net/weixin_45716124/article/details/126690394
// 需要转义str.replace(/[’"\/\b\f\n\r\t]/g, '')；严格模式没法执行https://www.w3cschool.cn/nwfchn/wv7u3ozt.html
const styles = {
  bold: ["\x1B[1m%s\x1B[22m"],
  italic: ["\x1B[3m%s\x1B[23m"],
  underline: ["\x1B[4m%s\x1B[24m"],
  inverse: ["\x1B[7m%s\x1B[27m"],
  strikethrough: ["\x1B[9m%s\x1B[29m"],
  white: ["\x1B[37m%s\x1B[39m"],
  grey: ["\x1B[90m%s\x1B[39m"],
  black: ["\x1B[30m%s\x1B[39m"],
  blue: ["\x1B[34m%s\x1B[39m"],
  cyan: ["\x1B[36m%s\x1B[39m"],
  green: ["\x1B[32m%s\x1B[39m"],
  magenta: ["\x1B[35m%s\x1B[39m"],
  red: ["\x1B[31m%s\x1B[39m"],
  yellow: ["\x1B[33m%s\x1B[39m"],
  whiteBG: ["\x1B[47m%s\x1B[49m"],
  greyBG: ["\x1B[49;5;8m%s\x1B[49m"],
  blackBG: ["\x1B[40m%s\x1B[49m"],
  blueBG: ["\x1B[44m%s\x1B[49m"],
  cyanBG: ["\x1B[46m%s\x1B[49m"],
  greenBG: ["\x1B[42m%s\x1B[49m"],
  magentaBG: ["\x1B[45m%s\x1B[49m"],
  redBG: ["\x1B[41m%s\x1B[49m"],
  yellowBG: ["\x1B[43m%s\x1B[49m"],
};

const info = (msg, color = "green", showtime = true) => {
  let time = "";
  if (showtime) {
    time = getNowTime();
  }
  console.log(styles[color][0].replace(/\%s/, `[${time} info]:`), msg);
};

const error = (msg, color = "red", showtime = true) => {
  let time = "";
  if (showtime) {
    time = getNowTime();
  }
  console.log(styles[color][0].replace(/\%s/, `[${time} error]:`), msg);
};
const warn = (msg, color = "yellow", showtime = true) => {
  let time = "";
  if (showtime) {
    time = getNowTime();
  }
  console.log(styles[color][0].replace(/\%s/, `[${time} warn]:`), msg);
};

const file = (msg, path) => {
  return fs.appendFileSync(path, JSON.stringify(msg), { encoding: "utf-8" });
};

const getNowTime = () => {
  return timeformat(new Date(), "yyyy-MM-dd hh:mm:ss");
};

const timeformat = (date, fmt) => {
  //author: meizz
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

module.exports = {
  info,
  error,
  warn,
  file,
};
