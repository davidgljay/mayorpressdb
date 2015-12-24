var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage');

//GetWithList

var base_url = "http://cityofphiladelphia.wordpress.com",
main_url = base_url + "/category/press-release/mayors-press-releases/page/1";

http.get(main_url, function(res) {
	var body = '';
	res.on('data', function(chunk) {
		body += chunk;
	});
	res.on('end', function() {
		var links = getLinks(body, base_url, 'h1.post-title a');
		var promise_array = [];
		for (var i=0; i<links.length; i++) {
			promise_array.push(getPage(links[i], '#content', '.post-entry', '.post-title'))
		}
		Promise.all(promise_array).then(function(results) {
			console.log(results);
		}, function(err) {
			console.log("Error in philly:" + err);
		})
	})
}).on('error', function(err) {
	console.log(err);
});