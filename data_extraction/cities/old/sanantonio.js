var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage');

//GetWithList

var base_url = "http://www.sanantonio.gov/Commpa/News/TabId/317/PgrID/1970/PageID/1/PID/1970/evl/0/CategoryID/5/CategoryName/Mayor-Council/Default.aspx";

//TODO: iterate though all pages.
console.log(main_url);
http.get(main_url, function(res) {
	var body ='';
	res.on("data", function(chunk) {
		body += chunk;
	});
	res.on("end", function() {
		var links = getLinks(body, base_url, '.article .title a'),
		promise_array = [];
		console.log(links);
		for (var i=0; i<links.length; i++) {
			promise_array.push(getPage(links[i], '.article', '.content', 'h1'))
		}
		Promise.all(promise_array).then(function(results) {
			console.log(results);
		}, function(err) {
			console.log("Error in San Antonio:" + err);
		})
	})
})