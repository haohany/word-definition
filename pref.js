var dictMap = {
  "youdao": {
    name: "youdao",
    title: "有道词典 (youdao dictionary)",
    iconSrc: "http://dict.youdao.com/favicon.ico",
    query: "http://dict.youdao.com/search?le=eng&q={word}&keyfrom=dict.index"
  },
  "oaad": {
    name: "oaad",
    title: "Oxford Advanced American Dictionary",
    iconSrc: "http://oaadonline.oxfordlearnersdictionaries.com/favicon.ico",
    query: "http://oaadonline.oxfordlearnersdictionaries.com/search/?q={word}"
  }
};

var defaultOptions = {
  linkPopupStatus: "enabled",
  defPopupStatus: "enabled",
  linkDictNameList: ["youdao", "oaad"],
  defDictName: "youdao"
};

function getLinkPopupStatus() {
  return localStorage.linkPopupStatus || defaultOptions.linkPopupStatus;
}
function setLinkPopupStatus(status) {
  localStorage.linkPopupStatus = status;
}

function getDefPopupStatus() {
  return localStorage.defPopupStatus || defaultOptions.defPopupStatus;
}
function setDefPopupStatus(status) {
  localStorage.defPopupStatus = status;
}

function getLinkDictNameList() {
  return localStorage.linkDictNameList ? JSON.parse(localStorage.linkDictNameList) : defaultOptions.linkDictNameList;
}
function setLinkDictNameList(list) {
  localStorage.linkDictNameList = JSON.stringify(list);
}

function getDefDictName() {
  return localStorage.defDictName ? JSON.parse(localStorage.defDictName) : defaultOptions.defDictName;
}
function setDefDictName(dictName) {
  localStorage.defDictName = dictName;
}
