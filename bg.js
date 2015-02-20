var WD = WD || {}; // word definition global namespace

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg === "dict") {
    
    var dictInfo = {};

    if (getLinkPopupStatus() === "enabled") {
      var linkDicts = [];
      var linkDictList = getLinkDictList();
      for (var i = 0; i < linkDictList.length; i++) {
	var dict = linkDictList[i];
	if (dict.status === "enabled") {
	  linkDicts.push(dictMap[dict.name]);
	}
      }
      if (linkDicts.length > 0) {
	dictInfo.linkDicts = linkDicts;
      }
    }
    
    if (getDefPopupStatus() === "enabled") {
      var defDicts = [];
      var defDictList = getDefDictList();
      for (var i = 0; i < defDictList.length; i++) {
	var dict = defDictList[i];
	if (dict.status === "enabled") {
	  defDicts.push(dictMap[dict.name]);
	}
      }
      if (defDicts.length > 0) {
	dictInfo.defDicts = defDicts;
      }
    }
    
    sendResponse(dictInfo);
  }
});

/*
function wrapHtmlTags(elem, textToWrap, tagName, className) {
  var wrappedElem = document.createElement(tagName);
  wrappedElem.setAttribute("class", className);
  wrappedElem.textContent = "$1";
  
  var regs = [];
  textToWrap.forEach(function(text) {
    regs.push(new RegExp("(\\b" + text + "\\b)", "gi"));
  });
  
  for (var i = 0; i < elem.childNodes.length; i++) {
    var textNode = elem.childNodes[i];
    if (textNode.nodeType !== 3) {
      continue;
    }
    regs.forEach(function(reg) {
      textNode.nodeValue = textNode.nodeValue.replace(reg, wrappedElem.outerHTML);
    });
  }
  
  return elem;
}

function removeHtmlTags(elem) {
  for (var i = 0; i < elem.children.length; i++) {
    var childElem = elem.children[i];
    var newChild = document.createTextNode(removeHtmlTags(childElem).textContent);
    elem.replaceChild(newChild, childElem);
  }
  return elem;
}
*/
