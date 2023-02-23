const request = require("request");
const fs = require("fs");
const qs = require("querystring");
const cheerio = require("cheerio");
module.exports.post = function (url, data, options) {
  const opts = Object.assign(
    {
      uri: url,
      method: "POST",
      "content-type": "application/json",
      body: JSON.stringify(data),
      timeout: 5000,
    },
    options
  );
  console.log("post request:", url);
  const p = new Promise((resolve, reject) => {
    request(opts, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        resolve(info);
      } else {
        reject(error);
      }
    });
  });

  return p;
};

module.exports.get = function (url, query = {}, options = {}) {
  const p = new Promise((resolve, reject) => {
    let targetUrl = url;
    if (Object.keys(query).length > 0) {
      targetUrl = url + "?" + qs.stringify(query);
    }
    console.log("get request:", targetUrl);
    request
      .get(
        targetUrl,
        {
          timeout: 5000,
          ...options,
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            resolve(info);
          } else {
            reject(error);
          }
        }
      )
      .on("error", function (error) {
        reject(error);
      });
  });
  return p;
};

module.exports.getHtml = function (url, query = {}, options = {
  isJquery:true
}) {
  const p = new Promise((resolve, reject) => {
    let targetUrl = url;
    if (Object.keys(query).length > 0) {
      targetUrl = url + "?" + qs.stringify(query);
    }
    console.log("get request:", targetUrl);
    request
      .get(
        targetUrl,
        {
          timeout: 5000,
          ...options,
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (options.isJquery) {
              resolve(cheerio.load(body));
            } else {
              resolve(body);
            }
          } else {
            reject(error);
          }
        }
      )
      .on("error", function (error) {
        reject(error);
      });
  });
  return p;
};
