var Promise = require('promise'),
http = require('follow-redirects').http,
firstdate = require('./firstdate'),
cheerio = require('cheerio'),
logger = require('../utils/logger');

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
					logger.info("Successfully got: " + url);
					resolve(processBody(data, queries, url));
				});
			}).on('error', function(err) {
				logger.error("Error loading page:" + url +"\n" + err);
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
		logger.info("Undefined date");
		return null;
	}
	var body = '';
	content.find(queries.body).each(function(i, elem) {
		body += $(elem).text() + "\n";
	})
	var title = content.find(queries.title).text();
	if (title=='') {
		logger.error("Failed to find title in " + url);
		title='Press Release from ' + queries.city;
	}
	return {
		'title':title,
		'body':body,
		'date':date.toISOString(),
		'url':url,
		'city':queries.city
	};					
}