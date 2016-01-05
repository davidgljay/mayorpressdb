module.exports = function(items) {
	var clean_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		if (items[i]===null) {
			continue;
		}
		items[i].body = items[i].body.replace(/\s+/g,' ');
		validate(items[i]);
		clean_items.push(items[i]);
	}
	items = remove_duplicate_urls(items);
	return clean_items;
};

var validate = function(item) {
	for (var key in item) {
		if (item[key]===null || item[key].length === 0) {
			logger.error(key + " missing in \n" + JSON.stringify(item));
		}
	}
};

var remove_duplicate_urls = function(items) {
	var urls = new Set();
	var deduped_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		if (!urls.has(items[i].url)) {
			deduped_items.push(items[i]);
			urls.add(items[i]);
		} 
	}
	return deduped_items;
};