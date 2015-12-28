var Promise = require('promise'),
http = require('follow-redirects').http,
firstdate = require('./firstdate'),
cheerio = require('cheerio');

//Get and parse a page with a press release. Allows for a slight delay to prevent
//excessive calls to city servers. 
module.exports = function(url, sleepBy, queries) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			http.get(url, function(res) {
				var data = '';
				res.on('data', function(chunk) {
					data += chunk;
				});
				res.on('end', function() {
					resolve(processBody(data, queries, url));
				});
			}).on('error', function(err) {
				console.log("Error:" + err);
				resolve(null);
			});
		}, sleepBy);
	});
};

var processBody = function(data, queries, url) {
	$ = cheerio.load(data, {
		normalizeWhitespace: true
	});
	var content = $(queries.content);
	if (content.text().length == 0) {
		return null;
	};
	var date = firstdate(content.text());
	if (date == '') {
		console.log("Undefined date");
		return null;
	}
	var body = '';
	content.find(queries.body).each(function(i, elem) {
		body += $(elem).text() + "\n";
	})
	return {
		'title':content.find(queries.title).text(),
		'body':body,
		'date':date.toISOString(),
		'url':url
	};					
}