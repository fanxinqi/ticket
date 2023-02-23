/**
 * 休眠
 * @param time 毫秒
 */
async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = sleep;
