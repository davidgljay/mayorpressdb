var http = require('follow-redirects').http,
Promise = require('promise'),
cheerio = require('cheerio'),
firstdate = require('../utils/firstdate');

var base_url = "http://www.houstontx.gov/",
main_url = base_url + "/mayor/press/"

//Nice, Houston has everything in one page. How thoughtful.
//SPECIAL


http.get(main_url, function(res) {
	var body = '';
	res.on('data', function(chunk) {
		body += chunk;
	});
	res.on('end', function() {
		processBody(body);
	})
}).on('error', function(err) {
	console.log(err);
});

var processBody = function(body) {
	$ = cheerio.load(body);
	var links = [],
	promise_array = [];
	$('ul.bullets li a').each(function(i, elem) {
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
	for (var i = 0; i < links.length; i++) {
		promise_array.push(getPage(links[i]))
	};
	Promise.all(promise_array).then(function(releases) {
		console.log("Promise array resolved");
		console.log(releases);
	});
};

var getPage = function(url) {
	return new Promise(function(resolve, reject) {
		http.get(url, function(res) {
			var data = '';
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on('end', function() {
				$ = cheerio.load(data, {
		    		normalizeWhitespace: true
				});
				var content = $('#mainContent');
				if (content.text().length == 0) {
					resolve(null);
				} else {
					var date = firstdate(content.text());
					console.log("Date: " + date);
					var body = '';
					content.find('p').each(function(i, elem) {
						body += $(elem).text() + "\n";
					})
					resolve({
						'title':content.find('.pageTitle').text(),
						'body':body,
						'date':date.toISOString(),
						'img':'',
						'url':url
					});					
				};
			})
		}).on('error', function(err) {
			reject(err);
		})
	});
};