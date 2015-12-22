var cheerio = require('cheerio'),
http = require('http');

var url = "http://www.lamayor.org/press_release";

http.get(url, function(res) {

	//todo: consider making this a promise functionin utils for efficiency;
	var body = '';
	res.on('data', function(chunk) {
		body += chunk;
	});
	res.on('end', function() {
		console.log("stuff");
		$ = cheerio.load(body, {
    		normalizeWhitespace: true
		});
		console.log("STuff");
		// console.log($('.page_excerpt').contents());

	})
}).on('error', function(err) {
	console.log(err);
})