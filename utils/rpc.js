/* eslint-disable no-param-reassign */
// import { request } from './get_json'
const request = require("request");

/**
 * MaiMai RPC Client SDK
 *
 * 目前使用JSON格式传递数据，后续可能会换其他格式
 *
 * 注意事项：
 *  1. rpc返回值不能包含的类型: http://wiki.mm.taou.com/doku.php?id=service:fred:json
 *
 * @param       {string}    name        RPC名称，例如 maimai_share.info.v3.usrinfo2.get_server_options，
 *                                      对应了python method maimai_share.info.v3.usrinfo2.get_server_options
 *
 * @param       {int}       uid         当前请求对应的uid，一般填写this.session.u，后续RPC网关可能根据uid做灰度策略
 *
 * @param       {{uids: [*]}}       kwargs      对应python method 参数集合，function (manager,uid) => {uid: 11111}
 *
 * @param       {{rpc_timeout: number}}       [options]     有关rpc调用的配置参数：
 *                                          - rpc_host: 可以指定提供rpc调用的服务器地址，测试时可使用
 *                                          - rpc_timeout: rpc请求超时时间，默认2000ms
 *                                          - manager_position: 如果对应的python接口的第一个参数不是mananger，需要设置成-2
 *
 * @return      {promise}
 */
function rpc(name, uid, kwargs, options) {
  let start = new Date();

  return new Promise(function (resolve, reject) {
    name =
      "rpc/" +
      name
        .replace(/\./g, "/")
        .replace(/^maimai_share\//, "")
        .replace(/^mmsdk\//, "");
    uid = uid || 0;
    kwargs = kwargs || {};
    options = options || {};

    const headers = {
      "Content-Type": "application/json",
    };
    // const reqid = requestContext.get('reqid')
    let manager_position = options.manager_position || -1;
    // let rpc_host = "/";
    let rpc_host = options.rpc_host || "http://rpc:8540/";
    let svtype = "node";
    let url =
      rpc_host + name + "?u=" + uid + "&serialize=json&svtype=" + svtype;
    let data = {
      manager_position: manager_position,
      args: [],
      kwargs: kwargs || {},
      svtype: svtype,
    };

    // if (reqid) headers['X-Maimai-Reqid'] = reqid

    // debug('--> ' + url);
    request(
      {
        uri: url,
        method: "POST",
        body: JSON.stringify(data),
        headers,
        timeout: options.rpc_timeout || 5000,
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const info = JSON.parse(body);
          resolve(info);
        } else {
          reject(error);
        }
      }
    );
  });
}

module.exports = rpc;
