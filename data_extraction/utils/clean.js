var logger = require('./logger');

module.exports = function(items) {
	var clean_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		if (items[i]===null || !validate(items[i])) {
			continue;
		}
		items[i].body = items[i].body.replace(/\s+/g,' ');
		clean_items.push(items[i]);
	}
	items = remove_duplicate_urls(items);
	return clean_items;
};

var validate = module.exports.validate = function(item) {
	var valid = true;
	for (var key in item) {
		if (item[key]===null || item[key]===undefined || item[key].length === 0) {
			valid = false;
		}
	}
	return valid;
};

var remove_duplicate_urls = module.exports.remove_duplicate_urls = function(items) {
	var urls = new Set();
	var deduped_items = [];
	for (var i = 0; i < items.length; i++) {
		if (!urls.has(items[i].url)) {
			deduped_items.push(items[i]);
			urls.add(items[i].url);
		}
	}
	return deduped_items;
};