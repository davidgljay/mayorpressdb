/*
* @author David Jay 
* Many cities seem to store press releases in paginated lists. This module is designed to move through those paginated lists,
* extract the text of press releases, and return them in the proper format.  
*/

var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage'),
Promise = require('promise'),
logger = require('./logger');

var sleepcount;


module.exports = function(url, queries) {
	return function() {
		//Space calls by 50ms to be gentle to city servers.

		return new Promise(function(resolve, reject) {
		//Iterate through pages with lists of press releases
			var press_releases = [];
			var nextListPage = function(n) {
				sleepcount = 0;
			 	logger.info("Getting " + queries.city + " page " + n);
			 	// if (n>5) {
			 	// 	resolve(press_releases);
			 	// 	return;
			 	// }
				getListPage(url.replace("{n}", n), queries)
					.then(
						//On success
						function(results) {
							if (results == "done") {
								resolve(press_releases);
							} else if (!url.includes('{n}')) {
								resolve(results);
							}else {
								press_releases = press_releases.concat(results);
								nextListPage(n+1);
							};
						}, 
						//On error.
						function(err) {
							logger.error("Error in getCityWithList");
							reject(err);
						}
					);		
			};
			nextListPage(1);
		});		
	}

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
				if (links.length == 0) {
					resolve("done");
				}
				for (var i=0; i<links.length; i++) {
					if (i%100==0) {
						logger.info("Processed 100 pages from " + queries.city + " at " + new Date());
					}
					var sleep = sleepBy();
					promise_array.push(getPage(links[i], sleep, queries))
				}
				Promise.all(promise_array).then(function(results) {
					resolve(results);
				}, function(err) {
					logger.error("Error fetching URL");
					reject("Error fetching url" +  err);
				})
			})
		});		
	});
};

var sleepBy = function() {
	sleepcount += 250;
	return sleepcount;
}
