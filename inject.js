var WD = WD || {}; // word definition global namespace
debugger;

var popupOffset;
var popupSeqNum = 0;
var resultMap = {};
var fadeTimeout;
var isInPopup = false;
var currentPopup;
var pendingRequests = [];

document.body.addEventListener("mouseup", function(e) {
  if (!isInPopup) {
    clearAllPopup();
  }
  else {
    clearPopupAfter(currentPopup);
  }
  isInPopup = false;

  var searchTerm = window.getSelection().toString();
  // The selection is too long. I guess it can't be a word or phrase.
  if (searchTerm.length > 50) {
    return;
  }
  searchTerm = searchTerm.trim();
  if (searchTerm === "" || !isEnglish(searchTerm)) {
    return;
  }
  popupOffset = getPopupOffset(e);
  popupSeqNum++;
  chrome.runtime.sendMessage("dict", function(dictInfo) {
    /*
    if (dictInfo.linkDicts) {
      showLinkPopup(searchTerm, dictInfo.linkDicts);
    }
    */
    if (dictInfo.defDicts) {
      requestDetailedResult(searchTerm, dictInfo.defDicts, showDetailedPopup);
    }
    (function (seqNum) {
      fadeTimeout = setTimeout(function() {
	fadeOutPopup(seqNum);
      }, 5000);
    })(popupSeqNum);
  });
});

function fadeOutPopup(seqNum) {
  var popups = document.querySelectorAll("[data-worddefinition-popup-seq-num='" + seqNum + "']");
  [].forEach.call(popups, function(popup) {
    popup.style.opacity = 0.25;
  });
}

function fadeInPopup(seqNum) {
  var popups = document.querySelectorAll("[data-worddefinition-popup-seq-num='" + seqNum + "']");
  [].forEach.call(popups, function(popup) {
    popup.style.opacity = 1;
  });
}

function clearAllPopup() {
  var popups = document.querySelectorAll(".worddefinition-popup");
  [].forEach.call(popups, function(popup) {
    popup.parentNode.removeChild(popup);
  });
}

function clearPopupAfter(somePopup) {
  var seqNum = somePopup.getAttribute("data-worddefinition-popup-seq-num");
  var popups = document.querySelectorAll(".worddefinition-popup");
  for (var i = popups.length - 1; i >= 0; i--) {
    var popup = popups[i];
    if (seqNum !== popup.getAttribute("data-worddefinition-popup-seq-num")) {
      popup.parentNode.removeChild(popup);
    }
    else {
      break;
    }
  }
}
/*
function increasePopupZIndex(seqNum) {
  var popups = document.querySelectorAll("[data-worddefinition-popup-seq-num='" + seqNum + "']");
  [].forEach.call(popups, function(popup) {
    popup.style.zIndex += 1;
  });
}
*/
function isEnglish(s) {
  for (var i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}
/*
function showLinkPopup(searchTerm, dicts) {
  var popup = generatePopup();
  var popupBody = popup.getElementsByClassName("worddefinition-popup-body")[0];

  var rows = Math.floor(Math.sqrt(dicts.length));
  var cols = Math.ceil(dicts.length / rows);

  for (var i = 0; i < rows; i++) {
    var linksRow = document.createElement("div");
    linksRow.setAttribute("class", "worddefinition-popup-links-row");
    
    for (var j = 0; j < cols; j++) {
      var dict = dicts[i * cols + j];
      
      var icon = document.createElement("img");
      icon.setAttribute("class", "worddefinition-popup-link-icon");
      icon.src = dict.iconSrc;
      
      var link = document.createElement("a");
      link.setAttribute("class", "worddefinition-popup-link");
      link.href = dict.href.replace("{searchTerm}", searchTerm);
      link.target = "_blank";
      link.appendChild(icon);

      linksRow.appendChild(link);
    }
    
    popupBody.appendChild(linksRow);
  }
  
  document.body.appendChild(popup);
  
  adjustPopupPosition(popup);
}
*/
function showDetailedPopup(result) {
  var popup = generatePopup();
  popup.classList.add("worddefinition-detailed-popup");
  var popupBody = popup.getElementsByClassName("worddefinition-popup-body")[0];
  
  var source = document.createElement("a");
  source.setAttribute("class", "worddefinition-detailed-popup-source");
  source.title = "More";
  source.href = result.source;
  source.target = "_blank";
  source.style.background = "url(" + result.iconSrc + ")";
  popupBody.appendChild(source);
  
  result.interpretations.forEach(function(ipt) {
    var iptElem = document.createElement("div");
    iptElem.id = "worddefinition-detailed-popup-interpretation" + ipt.index;
    iptElem.setAttribute("class", "worddefinition-detailed-popup-interpretation");
    if (ipt.index > 1) {
      iptElem.style.display = "none";
    }
    
    var title = document.createElement("span");
    title.setAttribute("class", "worddefinition-detailed-popup-title");
    title.textContent = ipt.title;
    if (result.interpretations.length > 1) {
      var sup = document.createElement("sup");
      sup.textContent = ipt.index;
      title.appendChild(sup);
    }
    iptElem.appendChild(title);

    if (ipt.phonetic) {
      var phonetic = document.createElement("span");
      phonetic.setAttribute("class", "worddefinition-detailed-popup-phonetic worddefinition-detailed-popup-additional");
      phonetic.textContent = ipt.phonetic;
      iptElem.appendChild(phonetic);
    }
    
    var refIndices = [];
    result.interpretations.forEach(function(otherIpt) {
      if (otherIpt.index !== ipt.index) {
	refIndices.push(otherIpt.index);
      }
    });
    
    if (refIndices.length > 0) {
      var refContainer = document.createElement("span");
      refContainer.setAttribute("class", "worddefinition-detailed-popup-ref-container");
      
      refIndices.forEach(function(index) {
	var sup = document.createElement("sup");
	sup.textContent = index;
	
	var refElem = document.createElement("span");
	refElem.setAttribute("class", "worddefinition-detailed-popup-ref");
	refElem.appendChild(document.createTextNode(ipt.title));
	refElem.appendChild(sup);
	refElem.onclick = function() {
	  iptElem.style.display = "none";
	  var refIptElem = popupBody.querySelector("#worddefinition-detailed-popup-interpretation" + index);
	  refIptElem.style.display = "";
	};
	
	refContainer.appendChild(refElem);
      });
      
      iptElem.appendChild(refContainer);
    }

    
    if (ipt.pattern) {
      var pattern = document.createElement("div");
      pattern.setAttribute("class", "worddefinition-detailed-popup-pattern worddefinition-detailed-popup-additional");
      pattern.textContent = ipt.pattern;
      iptElem.appendChild(pattern);
    }
    
    var items = ipt.items;
    var showIndex = false;
    if (items.length > 1) {
      showIndex = true;
    }
    var firstItemElem = buildItemElem(items[0], showIndex);
    iptElem.appendChild(firstItemElem);
    
    if (items.length > 1) {
      var restItemsContainer = document.createElement("div");
      restItemsContainer.setAttribute("class", "worddefinition-detailed-popup-rest-items");
      restItemsContainer.style.display = "none";
      for (var i = 1; i < items.length; i++) {
	var itemElem = buildItemElem(items[i], showIndex);
	restItemsContainer.appendChild(itemElem);
      }
      iptElem.appendChild(restItemsContainer);
      
      var raquoElem = document.createElement("span");
      raquoElem.setAttribute("class", "worddefinition-detailed-popup-raquo-down");
      raquoElem.textContent = "»"; // &raquo;
      
      var footer = document.createElement("div");
      footer.setAttribute("class", "worddefinition-detailed-popup-footer");
      footer.appendChild(raquoElem);
      footer.onclick = function() {
	if (restItemsContainer.style.display === "none") {
	  restItemsContainer.style.display = "";
	  raquoElem.setAttribute("class", "worddefinition-detailed-popup-raquo-up");
	}
	else {
	  restItemsContainer.style.display = "none";
	  raquoElem.setAttribute("class", "worddefinition-detailed-popup-raquo-down");
	}
      };
      iptElem.appendChild(footer);
    }
    
    
    popupBody.appendChild(iptElem);
  });

  document.body.appendChild(popup);
  adjustPopupPosition(popup);
  
  return popup;
}

function buildItemElem(item, showIndex) {
  var itemElem = document.createElement("div");
  itemElem.setAttribute("class", "worddefinition-detailed-popup-item");
  
  var itemDefElem = document.createElement("div");
  itemDefElem.setAttribute("class", "worddefinition-detailed-popup-def");
  itemDefElem.innerHTML = item.definition;
  itemElem.appendChild(itemDefElem);
  
  if (showIndex) {
    var itemIndexElem = document.createElement("span");
    itemIndexElem.setAttribute("class", "worddefinition-detailed-popup-def-index");
    itemIndexElem.textContent = item.index + ".";
    itemDefElem.innerHTML = itemIndexElem.outerHTML + itemDefElem.innerHTML;
    itemDefElem.classList.add("worddefinition-detailed-popup-def-with-index");
  }
  
  var itemEgContainer = document.createElement("div");
  itemEgContainer.setAttribute("class", "worddefinition-detailed-popup-examples");
  for (var i = 0; i < item.examples.length; i++) {
    if (i > 2) {
      break;
    }
    var example = item.examples[i];
    
    var itemEg = document.createElement("div");
    itemEg.setAttribute("class", "worddefinition-detailed-popup-example worddefinition-detailed-popup-additional");
    itemEgContainer.appendChild(itemEg);

    var sentence = document.createElement("div");
    sentence.setAttribute("class", "worddefinition-detailed-popup-example-sentence");
    sentence.innerHTML = example.sentence;
    itemEg.appendChild(sentence);
    
    if (example.translation) {
      var translation = document.createElement("div");
      translation.setAttribute("class", "worddefinition-detailed-popup-example-translation");
      translation.textContent = example.translation;
      itemEg.appendChild(translation);
    }
  }
  itemElem.appendChild(itemEgContainer);
  
  return itemElem;
}

function requestDetailedResult(searchTerm, dicts, callback) {
  if (dicts.length === 0) {
    return;
  }
  var dict = dicts.shift();
  resultMap[dict.name] = resultMap[dict.name] || {};
  var cache = resultMap[dict.name][searchTerm];
  
  if (cache) {
    process(cache);
  }
  else if (cache === null) {
    requestDetailedResult(searchTerm, dicts, callback);
  }
  else {
    var url = dict.href.replace("{searchTerm}", searchTerm);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = function() {
      if (xhr.status === 200) {
	var result = getParsedResult(searchTerm, dict, xhr.responseXML);
	resultMap[dict.name][searchTerm] = result;
	if (result) {
	  process(result);
	  return;
	}
      }
      requestDetailedResult(searchTerm, dicts, callback);
    };
    xhr.onerror = function() {
      console.log("Connection failed.");
      requestDetailedResult(searchTerm, dicts, callback);
    };
  }

  function process(result) {
    var popup = callback(result);
    if (popup) {
      dicts.forEach(function(dict) {
	requestDetailedResult(searchTerm, [dict], function() {
	  addDictIcon(dict, popup);
	});
      });
    }
  }
}

function addDictIcon(dict, popup) {
}

function getParsedResult(searchTerm, dict, doc) {
  var result = {};
  result.source = doc.URL;
  result.iconSrc = dict.iconSrc;
  result.interpretations = [];

  if (dict.name === "youdao") {
    var resultElem = doc.querySelector("#collinsResult"); // buggy, becaule it may be null
    if(!resultElem) {
      return null;
    }
    
    [].forEach.call(resultElem.querySelectorAll(".wt-container"), function(iptElem, index) {
      var ipt = {};
      
      ipt.index = index + 1;
      
      ipt.title = iptElem.querySelector("h4 span.title").textContent.trim();
      
      var phoneticElem = iptElem.querySelector(".phonetic");
      if (phoneticElem) {
	ipt.phonetic = phoneticElem.textContent.trim();
      }
      else {
	var pArray = [];
	[].forEach.call(doc.querySelectorAll(".collins-intro b"), function(p) {
	  pArray.push(p.textContent.trim());
	});
	if (pArray.length > 0) {
	  ipt.phonetic = "/" + pArray.join("; ") + "/";
	}
      }
      
      var patternElem = iptElem.querySelector(".pattern");
      ipt.pattern = patternElem && patternElem.textContent.replace(/\(|\)/g, "").trim();
      
      ipt.items = [];
      var itemList = [].slice.call(iptElem.querySelectorAll("li"));
      for (var i = 0; i < itemList.length; i++) {
	var item = {};
	var itemElem = itemList[i];
	item.index = i + 1;
	
	var defElem = itemElem.querySelector(".collinsMajorTrans p");
	if (!defElem) {
	  itemList.splice(i, 1);
	  i--;
	  continue;
	}
	
	if (defElem.querySelector("b")) {
	  [].forEach.call(defElem.querySelectorAll("b"), function(oldElem) {
	    var newElem = document.createElement("span");
	    newElem.setAttribute("class", "worddefinition-detailed-popup-search-term");
	    newElem.textContent = oldElem.textContent;
	    defElem.replaceChild(document.createTextNode(newElem.outerHTML), oldElem);
	  });
	}
	
	if (defElem.querySelector(".additional")) {
	  [].forEach.call(defElem.querySelectorAll(".additional"), function(oldElem) {
	    var newElem = document.createElement("span");
	    newElem.setAttribute("class", "worddefinition-detailed-popup-additional");
	    newElem.textContent = oldElem.textContent;
	    defElem.replaceChild(document.createTextNode(newElem.outerHTML), oldElem);
	  });
	}
	
	if (defElem.querySelector("a")) {
	  [].forEach.call(defElem.querySelectorAll("a"), function(oldElem) {
	    var newElem = document.createElement("a");
	    newElem.setAttribute("class", "worddefinition-detailed-popup-def-link");
	    newElem.textContent = oldElem.textContent;
	    newElem.href = oldElem.href;
	    newElem.target = "_blank";
	    defElem.replaceChild(document.createTextNode(newElem.outerHTML), oldElem);
	  });
	}

	//defElem.innerHTML = defElem.textContent;
	//wrapHtmlTags(defElem, textToWrap, "span", "worddefinition-detailed-popup-search-term");
	item.definition = defElem.textContent;
	
	item.examples = [];
	var exampleList = itemElem.querySelectorAll(".examples");
	for (var j = 0; j < exampleList.length; j++) {
	  var eg = {};
	  var egElem = exampleList[j];
	  eg.sentence = egElem.firstElementChild.textContent;
	  eg.translation = egElem.lastElementChild.textContent;
	  item.examples.push(eg);
	}
	
	ipt.items.push(item);
      }
      
      result.interpretations.push(ipt);
    });
  }
  
  else if (dict.name === "oaad") {
    return null;
  }
  
  return result;
}

function generatePopup() {
  var popup = document.createElement("div");
  popup.setAttribute("class", "worddefinition-popup");
  popup.setAttribute("data-worddefinition-popup-seq-num", popupSeqNum);
  popup.style.top = popupOffset.top + popupOffset.height + "px";
  popup.style.left = popupOffset.left + "px";
  (function (seqNum) {
    popup.onmouseover = function() {
      clearTimeout(fadeTimeout);
      fadeInPopup(seqNum);
    };
    popup.onmouseout = function() {
      clearTimeout(fadeTimeout);
      fadeOutPopup(seqNum);
    };
  })(popupSeqNum);
  popup.onclick = function() {
    //increasePopupZIndex(popupSeqNum);
  };
  popup.onmouseup = function() {
    isInPopup = true;
    currentPopup = popup;
  };
  
  var popupBody = document.createElement("div");
  popupBody.setAttribute("class", "worddefinition-popup-body");
  popup.appendChild(popupBody);

  var popupTip = document.createElement("div");
  popupTip.setAttribute("class", "worddefinition-popup-tip");
  popupTip.classList.add("worddefinition-popup-tip-up");
  popup.insertBefore(popupTip, popupBody);

  return popup;
}

function getPopupOffset(e) {
  var sel = window.getSelection();
  var range = sel.getRangeAt(0);
  range.collapse(false);
  var span = document.createElement("span");
  range.insertNode(span);
  var height = span.offsetHeight * 1.2;
  var currElem = span, top = 0, left = 0;
  while (currElem) {
    top += currElem.offsetTop;
    left += currElem.offsetLeft;
    currElem = currElem.offsetParent;
  }
  span.parentNode.removeChild(span);
  return {top: top, left: left, height: height};
}

function adjustPopupPosition(popup) {
  var seqNum = popup.getAttribute("data-worddefinition-popup-seq-num");
  var pairedPopup = document.querySelector("[data-worddefinition-popup-seq-num='" + seqNum + "']");
  if (pairedPopup !== popup) {
    popup.style.marginTop = pairedPopup.offsetHeight + "px";
  }
  
  var tip = popup.getElementsByClassName("worddefinition-popup-tip")[0];
  
  var left = popup.offsetLeft;
  var width = popup.offsetWidth;
  var tipWidth = tip.offsetWidth;
  var pml;
  var tml;
  
  var isDetailedPopup = popup.classList.contains("worddefinition-detailed-popup");
  var leftShift = isDetailedPopup ? width/2 : width;
  
  if (left > leftShift) {
    popup.style.marginLeft = -left + "px";
    var right = popup.offsetParent.offsetWidth - (popup.offsetLeft + width);
    if (right > left - leftShift) {
      right = left - leftShift;
    }
    pml = -(left - right);
    tml = left - right - tipWidth - 7;
  }
  else {
    pml = -left;
    if (left < 7) {
      tml = 7;
    }
    else {
      if (!isDetailedPopup) {
	tml = left > width - tipWidth - 7 ? width - tipWidth - 7 : left;
      }
      else {
	tml = left;
	if (pairedPopup !== popup) {
	  var pairedPopupWidth = pairedPopup.offsetWidth;
	  if (left > pairedPopupWidth - tipWidth - 7) {
	    tml -= 7 - (pairedPopupWidth - tipWidth - left);
	  }
	}
      }
    }
  }
  
  popup.style.marginLeft = pml + "px";
  tip.style.marginLeft = tml + "px";
}
