var Promise = require('promise'),
http = require('follow-redirects').http,
firstdate = require('./firstdate'),
cheerio = require('cheerio');

module.exports = function(url, contentQuery, bodyQuery, titleQuery) {
	return new Promise(function(resolve, reject) {
		http.get(url, function(res) {
			var data = '';
			console.log(res.statusCode);
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on('end', function() {
				$ = cheerio.load(data, {
		    		normalizeWhitespace: true
				});
				var content = $(contentQuery);
				if (content.text().length == 0) {
					resolve(null);
				} else {
					var date = firstdate(content.text());
					console.log(url + ":" + content.text());
					console.log(date);
					if (date == '') {
						console.log("Undefined date");
						resolve(null);
						return;
					}
					var body = '';
					content.find(bodyQuery).each(function(i, elem) {
						body += $(elem).text() + "\n";
					})
					resolve({
						'title':content.find(titleQuery).text(),
						'body':body,
						'date':date.toISOString(),
						'img':'',
						'url':url
					});					
				};
			})
		}).on('error', function(err) {
			console.log("Error:" + err);
			resolve(null);
		})
	});
};