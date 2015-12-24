var http = require('follow-redirects').http,
Promise = require('promise'),
cheerio = require('cheerio');

var base_url = "http://www.cityofchicago.org/",
main_url = base_url + "city/en/depts/mayor/press_room/press_releases.1.html?numPerPage=100"

//GetWithList

//Need to collect links, get each of them, and then extract. 
//TODO: implement iteration through pages.
var press_releases = [];

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
	$('.pressReleaseList .content a').each(function(i, elem) {
		links.push(base_url + $(elem).attr('href'));
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
				var content = $('#content-content');
				var date = new Date(content.find('.black-medium-high-title').text());
				var body = '';
				content.find('p').each(function(i, elem) {
					body += $(elem).text() + "\n";
				})
				console.log("Resolving promise");
				resolve({
					'title':content.find('h1').text(),
					'body':body,
					'date':date.toISOString(),
					'img':'',
					'url':url
				});
			})
		}).on('error', function(err) {
			reject(err);
		})
	});
};