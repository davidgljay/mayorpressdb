module.exports = function(items) {
	var clean_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		if (items[i]==null) {
			continue;
		}
		items[i].body = items[i].body.replace(/\s+/g,' ');
		validate(items[i]);
		clean_items.push(items[i]);
	};
	return clean_items;
}

var validate = function(item) {
	for (key in item) {
		if (item[key]==null || item[key].length == 0) {
			logger.error(key + " missing in \n" + JSON.stringify(item));
		}
	}
}