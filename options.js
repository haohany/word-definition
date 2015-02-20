bg = chrome.extension.getBackgroundPage();
document.addEventListener("DOMContentLoaded", init);

function init() {
  var lpc = document.getElementById("link-popup-checkbox");
  if (bg.getLinkPopupStatus() === "enabled") {
    lpc.checked = true;
  }
  lpc.onchanged = function() {
    bg.setLinkPopupStatus(lpc.checked ? "enabled" : "disabled");
  }
  
  var dpc = document.getElementById("definition-popup-checkbox");
  if (bg.getDefPopupStatus() === "enabled") {
    dpc.checked = true;
  }
  dpc.onchanged = function() {
    bg.setDefPopupStatus(dpc.checked ? "enabled" : "disabled");
  }
  
  var ldl = document.getElementById("link-dict-list");
  var ldlData = bg.getLinkDictList();
  populateDictList(ldl, ldlData);
  
  var ddl = document.getElementById("definition-dict-list");
  var ddlData = bg.getDefDictList();
  populateDictList(ddl, ddlData);
  
  var ldh = document.getElementById("link-dict-hint");
  ldh.style.width = (ldl.offsetWidth > 250 ? ldl.offsetWidth : 250) + "px";
  
  var ddh = document.getElementById("definition-dict-hint");
  ddh.style.width = (ddl.offsetWidth > 250 ? ddl.offsetWidth : 250) + "px";
}

function populateDictList(list, data) {
  for (var i = 0; i < data.length; i++) {
    var datum = data[i];
    var dict = bg.dictMap[datum.name];
    
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    if (datum.status === "enabled") {
      checkbox.checked = true;
    }
    
    var icon = document.createElement("img");
    icon.src = "chrome://favicon/" + dict.iconSrc;
    
    var title = document.createElement("span");
    title.textContent = dict.title;
    
    var li = document.createElement("li");
    li.setAttribute("class", "dict-list-item");
    li.appendChild(checkbox);
    li.appendChild(icon);
    li.appendChild(title);
    
    list.appendChild(li);
  }
}

function save() {
}

function validUrl(url) {
  var pattern = /^(https?):\/\/[a-z0-9-]+(\.[a-z0-9-]+)*(:\d+)?\/$/;
  return pattern.test(url);
}

function showError(message) {
  clearTimeout(window.errorTimeout);
  var errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = message;
  document.getElementById("error").style.display = "block";
  window.errorTimeout = setTimeout(clearError, 3000);
}
function clearError() {
  clearTimeout(window.errorTimeout);
  document.getElementById("errorMsg").textContent = "";
  document.getElementById("error").style.display = "none";
}

function showSavedPrompt() {
  var prompt = document.getElementById("saved-prompt");
  prompt.style.display = "block";
  setTimeout(function() {
    prompt.style.display = "none";
  }, 3000);
}
