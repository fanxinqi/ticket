const robot = require("robotjs");
const os = require("os");
const { macNetPosition } = require("../config");

function getMac() {
  let mac = "";
  const networkInterfaces = os.networkInterfaces();
  for (let i in networkInterfaces) {
    for (let j in networkInterfaces[i]) {
      if (
        networkInterfaces[i][j]["family"] === "IPv4" &&
        networkInterfaces[i][j]["mac"] !== "00:00:00:00:00:00" &&
        networkInterfaces[i][j]["address"] !== "127.0.0.1"
      ) {
        mac = networkInterfaces[i][j]["mac"];
      }
    }
  }
  return mac;
}

function getMacNetPosition(key) {
  return macNetPosition[key];
}

function startClick(mp) {
  var screenSize = robot.getScreenSize();
  var width = screenSize.width;

  robot.moveMouse(width + mp.moveSwitch.x, mp.moveSwitch.y);
  robot.setMouseDelay(100);
  robot.mouseClick();
  robot.setMouseDelay(100);
  robot.moveMouse(width + mp.clickSwitch.x, mp.clickSwitch.y);
  robot.mouseClick();
  robot.setMouseDelay(100);
}

function main(key = "6c2a75560b6bb031") {
  const mp = getMacNetPosition(key);
  console.log(mp);
  startClick(mp);
  robot.mouseClick();
  // reclick
  startClick(mp);
}

module.exports.changeMacNet = main;


// (async () => {
//   main();
// })();

// Speed up the mouse.
