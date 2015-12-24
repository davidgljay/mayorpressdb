var cheerio = require('cheerio');

module.exports = function(body, base_url, linkQuery) {
	$ = cheerio.load(body);
	var links = [];
	$(linkQuery).each(function(i, elem) {
		if ($(elem).attr('href')[0]==".") {
			return;
		}
		var url;
		var href = $(elem).attr('href');
		if (href[0] == "/") {
			url = base_url + href;
		} else if (href.slice(0,7)=="http://") {
			url = href;
		} else {
			url = base_url + "/" + href;
		}
		links.push(url);
	});
	return links;
};