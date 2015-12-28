module.exports = function(items) {
	for (var i = items.length - 1; i >= 0; i--) {
		items[i]
		console.log(i);
		if (items[i] != null) {
			items[i].body = items[i].body.replace(/\s+/g,' ');
		};
	};
	return items;
}