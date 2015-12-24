var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage');

module.exports = function(url, queries) {
	var splitUrl = /(http:\/\/[^\/]+)(\/.+)/.exec(url);
	console.log(splitUrl);
	http.get(url, function(res) {
		var body ='';
		res.on("data", function(chunk) {
			body += chunk;
		});
		res.on("end", function() {
			var links = getLinks(body, splitUrl[1], queries.links),
			promise_array = [];
			console.log(links);
			for (var i=0; i<links.length; i++) {
				promise_array.push(getPage(links[i], queries.content, queries.body, queries.title))
			}
			Promise.all(promise_array).then(function(results) {
				console.log(results);
			}, function(err) {
				console.log("Error fetching url" +  err);
			})
		})
	})
};


//TODO: iterate though all pages.
