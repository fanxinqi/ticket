const request = require("../utils/request");
const log = require("../utils/log.js");
const { ERROR_TYPE } = require("../config.js");
const openBossPage = async (browerPage, url, selecters) => {
  //boss 403 selecter
  const selecter403 = ".error-content .text h1";
  //boss verify code selecter
  const selecterverifySlider = ".wrap-verify-slider";

  const jobListNone = "#main  div.job-list.job-list-none";
  const $ = await browerPage.open(url, [
    ...selecters,
    selecter403,
    selecterverifySlider,
    jobListNone,
  ]);

  // page get error
  if (!$) {
    throw ERROR_TYPE.PAGE_TIME_OUT;
  }

  // if has 403
  if ($(selecter403).text() == "403") {
    log.warn(`ip被封了,查看链接：${url}`);
    throw ERROR_TYPE.PAGE_BLOCKED;
  }

  // if has verify code
  if ($(selecterverifySlider).length > 0) {
    log.warn(`需要验证码登陆,查看链接：${url}`);
    throw ERROR_TYPE.PAGE_BLOCKED;
  }

  if ($(jobListNone).length > 0) {
    log.warn(`没有搜到符合条件的职位：${url}`);
    // throw "没有搜到符合条件的职位";
  }

  return $;
};

const openliepinPage = async (browerPage, url, selecters, requestType) => {
  const errorDomSeletor = ".error-main-container";
  const stopJobDomSeletor = "body .stop-apply-header";
  const noPublishSeletor =
    "body > div.main > div.common-page-container .recommend-jobs-alert";
  let $;
  if (requestType == "request") {
    $ = request.getHtml(url);
  } else {
    $ = await browerPage.open(url, [
      ...selecters,
      errorDomSeletor,
      stopJobDomSeletor,
      noPublishSeletor,
    ]);
  }
  const $errorDom = $(errorDomSeletor);
  const $stopJobDom = $(stopJobDomSeletor);
  const $noPublishSeletor = $(noPublishSeletor);
  if ($errorDom.length) {
    throw "此页面似乎不存在";
  }
  if ($stopJobDom.length) {
    throw "该职位已暂停招聘";
  }

  if ($noPublishSeletor.length) {
    throw "未发布职位";
  }

  return $;
};

const wrapBossCheck = (browerPage) => {
  return async (url, selecters) => {
    return await openBossPage(browerPage, url, selecters);
  };
};
const wrapLiepinCheck = (browerPage) => {
  return async (url, selecters, requestType) => {
    return await openliepinPage(browerPage, url, selecters, requestType);
  };
};

module.exports = {
  openBossPage,
  openliepinPage,
  wrapBossCheck,
  wrapLiepinCheck,
};
