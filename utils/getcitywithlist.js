/*
* @author David Jay 
* Many cities seem to store press releases in paginated lists. This module is designed to move through those paginated lists,
* extract the text of press releases, and return them in the proper format.  
*/

var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage'),
Promise = require('promise'),
urlcheck = require('./urlcheck'),
getPDF = require('./getpdf')
logger = require('./logger');

var sleepcount, already_checked_urls;


module.exports = function(url, queries) {
	return function() {
		return urlcheck(queries.city)(null,[]).then(function(checked_urls) {
			already_checked_urls = checked_urls;
			//Iterate through pages with lists of press releases
			return browseCityIndex(url, queries, already_checked_urls);
		});		
	};

};

//Browse the index pages of each city, getting urls of press releases and retreiving them if we haven't already.
var browseCityIndex = function(url, queries) {
	return new Promise(function(resolve, reject) {
		var press_releases = [];
		var nextListPage = function(n, lastresults) {
			//Space calls by 50ms to be gentle to city servers.
			var sleepcount = 0;
		 	logger.info("Getting " + queries.city + " page " + n);
			getListPage(url.replace("{n}", n), queries)
				.then(
					//On success
					function(results) {
						if (results.length === 0 || (lastresults && lastresults[0].url == results[0].url)) {
							logger.info('Ready to resolve');
							resolve(press_releases);
						} else if (!url.includes('{n}')) {
							resolve(results);
						} else {
							press_releases = press_releases.concat(results);
							nextListPage(n+1, results);
						}
					}, 
					//On error.\
					function(err) {
						logger.error("Error in getCityWithList");
						reject(err);
					}
				);		
		};
		nextListPage(1, null);		
	})

}

//Get the links from a page of press releases, get each of those pages, and return them in the proper format.
var getListPage = function(url, queries) {
	return new Promise(function(resolve, reject) {
		var splitUrl = /(http:\/\/[^\/]+)(\/.+)/.exec(url);
		http.get(url, function(res) {
			var body ='';
			if (res.statusCode==404) {
				resolve([]);
			}
			res.on("data", function(chunk) {
				body += chunk;
			});
			res.on("end", function() {
				var links = getLinks(body, splitUrl[1], queries.links),
				promise_array = [];
				if (links.length === 0) {
					resolve([]);
				}
				for (var i=0; i<links.length; i++) {
					if (i%100===0 && i>0) {
						logger.info("Processed 100 pages from " + queries.city + " at " + new Date());
					}
					//Confirm that the URL hasn't already been crawled.
					if (already_checked_urls[links[i]]===undefined) {
						if (links[i].slice(-4)=='.pdf') {
							promise_array.push(getPDF(data[i].href,queries.city,i,0))
						} else {
							promise_array.push(getPage(links[i], sleepBy(), queries));
						}
					}
				}
				Promise.all(promise_array).then(function(pages) {
					resolve(pages);
				}, function(err) {
					logger.error("Error fetching URL");
					reject("Error fetching url" +  err);
				});
			});
		});		
	});
};

var sleepBy = function() {
	sleepcount += 250;
	return sleepcount;
};
