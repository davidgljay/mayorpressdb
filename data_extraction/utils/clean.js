module.exports = function(items) {
	var clean_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		if (items[i]==null) {
			continue;
		}
		items[i].body = items[i].body.replace(/\s+/g,' ');
		clean_items.push(items[i]);
	};
	return clean_items;
}