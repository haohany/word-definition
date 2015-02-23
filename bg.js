var cache = {};
var dict = dictMap[getDefDictName()];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "dict") {
		var dictInfo = {};

		if (getLinkPopupStatus() === "enabled") {
			dictInfo.linkDictList = [];
			getLinkDictNameList().forEach(function(name) {
				dictInfo.linkDictList.push(dictMap[name]);
			});
		}

		if (getDefPopupStatus() === "enabled") {
			dictInfo.defDict = dictMap[getDefDictName()];
		}

		sendResponse(dictInfo);
	}
	else if (request.action === "definition") {
		var word = request.word;
		var definition = cache[word];
		if (definition) {
			sendResponse(definition);
		}
		else {
			var xhr = new XMLHttpRequest();
			var url = dict.query.replace("{word}", word);
			xhr.open("GET", url);
			xhr.responseType = "document";
			xhr.send();
			xhr.onload = function() {
				definition = getDefinition(xhr.response);
				cache[word] = definition;
				sendResponse(definition);
			};
			xhr.onerror = function() {
				sendResponse(null);
			};
			// keep the message channel open until sendResponse is called
			return true; 
		}
	}
});

function getDefinition(doc) {
	if (dict.name === "youdao") {
		return youdaoDefinition(doc);
	}
}

function youdaoDefinition(doc) {
	$result = $(doc).find("#collinsResult");
	$result.attr("data-word-def-class", "word-def-youdao");

	// remove stars and ranks
	$result.find(".star").remove();
	$result.find(".rank").remove();

	// change the title to a link
	var $title = $result.find("h4 .title");
	$title.each(function() {
		var $link = $("<a/>").attr("href", doc.URL).attr("target", "_blank");
		$link.html(this.outerHTML);
		$(this).replaceWith($link);
	});

	// show collapsed content
	$result.find(".collapse-content").removeClass("collapse-content");

	// remove links pointing to "#"
	$result.find("a[href='#']").remove();

	// remove "例："
	$result.find(".exampleLists .collinsOrder").remove();

	return $result[0] && $result[0].outerHTML;
}