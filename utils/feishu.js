const request = require("request");
const dayjs = require("dayjs");

function post(url, data) {
  request(
    {
      url: url,
      method: "POST",
      json: true,
      headers: {
        "content-type": "application/json",
      },
      body: data,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // console.log(body); // 请求成功的处理逻辑
      }
    }
  );
}
/*
 *id:机器人id
 */
const sendMsg = (id, msgArray, title) => {
  const day = dayjs().format("YYYY-MM-DD");
  const msg = {
    msg_type: "post",
    content: {
      post: {
        zh_cn: {
          title: `${day}-${title}`,
          content: msgArray,
        },
      },
    },
  };
  //   console.log(JSON.stringify(msg));
  post(`https://open.feishu.cn/open-apis/bot/v2/hook/${id}`, msg);
};

const sendErrorTaskMsg = (
  feishuBotId,
  msgStr,
  task,
  title = "错误任务情况"
) => {
  sendMsg(
    feishuBotId,
    [
      [
        {
          tag: "text",
          un_escape: true,
          text: msgStr,
        },
      ],
      [
        {
          tag: "text",
          un_escape: true,
          text: `task_id:${task.id},task_type:${task.type},task_keyworkd:${task.keyword}`,
        },
      ],
    ],
    title
  );
};

module.exports = {
  sendMsg,
  sendErrorTaskMsg,
};
