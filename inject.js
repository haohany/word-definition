var cache = {};
var inPopup = false;
var currentPopup;
var dict;

chrome.runtime.sendMessage({action: "dict"}, function(dictInfo) {
	dict = dictInfo.defDict;
});

document.addEventListener("mouseup", function(e) {
	if (inPopup) {
		clearPopupAfter(currentPopup);
	}
	else {
		clearAllPopup();
	}
	inPopup = false;

	var selection = window.getSelection();

	if (selection.rangeCount > 0) {
		getDefinition(selection.getRangeAt(0));
		// getDefinition(selection.getRangeAt(0).cloneRange());
	}
});

function clearAllPopup() {
	var popups = document.querySelectorAll(".word-def-popup");
	[].forEach.call(popups, function(popup) {
		popup.parentNode.removeChild(popup);
	});
}

function clearPopupAfter(thisPopup) {
	var popups = document.querySelectorAll(".word-def-popup");
	for (var i = popups.length - 1; i >= 0; i--) {
		var popup = popups[i];
		if (popup === thisPopup) {
			break;
		}
		popup.parentNode.removeChild(popup);
	}
}

function isEnglishWord(s) {
	// Can't be a word if empty or longer than "supercalifragilisticexpialidocious"
	if (s === "" || s.length > 34) {
		return false;
	}

	var reg = /^[A-Za-z]+$/;
	return reg.test(s);
}

function getDefinition(range) {
	var word = range.toString().trim();

	if (isEnglishWord(word)) {
		chrome.runtime.sendMessage(
			{
				action: "definition",
				word: word,
			},
			function(definition) {
				if (definition) {
					showDefinition(definition, range);
				}
			}
		);
	}
}

function showDefinition(definition, range) {
	var $definition = $(definition);
	var popup = createPopup();
	$(popup).append($definition);

	var offset = getRangeOffset(range);
	popup.style.top = offset.top + "px";
	popup.style.left = offset.left + "px";

	var height = $(window).height() - (offset.top - window.scrollY) - 10;
	if (height < 400) {
		height = 400;
	}
	$definition.css("max-height", height + "px");

	document.body.appendChild(popup);

	adjustPopupPosition(popup);
}

function createPopup() {
	var popup = document.createElement("div");
	popup.setAttribute("class", "word-def-popup");

	var tip = document.createElement("div");
	tip.setAttribute("class", "word-def-popup-tip");
	popup.appendChild(tip);

	// popup.onmouseenter = function() {
	// 	this.classList.remove("word-def-fade");
	// };

	// popup.onmouseleave = function() {
	// 	$(this).addClass("word-def-fade");
	// };

	popup.onmousedown = function() {
		// remove current selection
		window.getSelection().removeAllRanges();
	};

	popup.onmouseup = function() {
		inPopup = true;
		currentPopup = popup;
	};
	
	return popup;
}

function getRangeOffset(range) {
	var rect = range.getBoundingClientRect();
	var offset = {};
	offset.top = rect.bottom + window.scrollY + 10;
	offset.left = rect.left + window.scrollX + (rect.right-rect.left)/2;
	return offset;
}

function adjustPopupPosition(popup) {
	// var seqNum = popup.getAttribute("data-word-def-popup-seq-num");
	// var pairedPopup = document.querySelector("[data-word-def-popup-seq-num='" + seqNum + "']");
	// if (pairedPopup !== popup) {
	// 	popup.style.marginTop = pairedPopup.offsetHeight + "px";
	// }
	
	var popupLeft = $(popup).offset().left;
	var popupWidth = $(popup).outerWidth();
	var windowWidth = $(window).width();
	var pml;
	var tml;
	
	var shift = -popupWidth / 2;

	var pullLeft = popupLeft + popupWidth + shift - windowWidth;
	if (pullLeft > 0) {
		shift -= pullLeft;
	}

	var pullRight = -(popupLeft + shift);
	if (pullRight > 0) {
		shift += pullRight;
	}

	popup.style.marginLeft = shift + "px";
	$(popup).children(".word-def-popup-tip").css("left", -shift + "px");
}
