/*
* @author David Jay 
* Many cities seem to store press releases in paginated lists. This module is designed to move through those paginated lists,
* extract the text of press releases, and return them in the proper format.  
*/

var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage'),
Promise = require('promise');

var sleepcount;


module.exports = function(url, queries) {
	//Space calls by 50ms to be gentle to city servers.
	sleepcount = 0;

	return new Promise(function(resolve, reject) {
	//Iterate through pages with lists of press releases
		var press_releases = [];
		var nextListPage = function(n) {
			getListPage(url.replace("{n}", n), queries)
				.then(
					//On success
					function(results) {
						console.log("Returning results");
						resolve(results)
						// if (results == "done") {
						// 	resolve(press_releases);
						// } else {
						// 	press_releases.concat(results);
						// 	nextListPage(n++);					
						// };
					}, 
					//On error.
					function(err) {
						console.log("Error in getListPage");
						reject(err);
					}
				);		
		};
		nextListPage(1);
	});
};

//Get the links from a page of press releases, get each of those pages, and return them in the proper format.
var getListPage = function(url, queries) {
	return new Promise(function(resolve, reject) {
		var splitUrl = /(http:\/\/[^\/]+)(\/.+)/.exec(url);
		http.get(url, function(res) {
			var body ='';
			if (res.statusCode==404) {
				resolve("done");
			}
			res.on("data", function(chunk) {
				body += chunk;
			});
			res.on("end", function() {
				var links = getLinks(body, splitUrl[1], queries.links),
				promise_array = [];
				console.log("GotListPage:" + body);
				console.log(JSON.stringify(links));
				for (var i=0; i<links.length; i++) {
					promise_array.push(getPage(links[i], sleepBy(), queries))
				}
				Promise.all(promise_array).then(function(results) {
					resolve(results);
				}, function(err) {
					reject("Error fetching url" +  err);
				})
			})
		});		
	});
};

var sleepBy = function() {
	sleepcount += 50;
	return sleepcount;
}
