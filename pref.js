var WD = WD || {}; // word definition global namespace

var dictMap = {
  "youdao": {
    name: "youdao",
    title: "有道词典 (youdao dictionary)",
    iconSrc: "http://dict.youdao.com/favicon.ico",
    href: "http://dict.youdao.com/search?le=eng&q={searchTerm}&keyfrom=dict.index"
  },
  "oaad": {
    name: "oaad",
    title: "Oxford Advanced American Dictionary",
    iconSrc: "http://oaadonline.oxfordlearnersdictionaries.com/favicon.ico",
    href: "http://oaadonline.oxfordlearnersdictionaries.com/search/?q={searchTerm}"
  }
}

var defaultOptions = {
  linkPopupStatus: "enabled",
  defPopupStatus: "enabled",
  linkDictList: [
    {name: "youdao", status: "enabled"},
    {name: "oaad", status: "enabled"}
  ],
  defDictList: [
    {name: "youdao", status: "enabled"},
    {name: "oaad", status: "enabled"}
  ]
}

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

function getLinkDictList() {
  return localStorage.linkDictList ? JSON.parse(localStorage.linkDictList) : defaultOptions.linkDictList;
}
function setLinkDictList(list) {
  localStorage.linkDictList = JSON.stringify(list);
}

function getDefDictList() {
  return localStorage.defDictList ? JSON.parse(localStorage.defDictList) : defaultOptions.defDictList;
}
function setDefDictList(list) {
  localStorage.defDictList = JSON.stringify(list);
}
