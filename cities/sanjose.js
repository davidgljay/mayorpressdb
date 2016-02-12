
var http = require('follow-redirects').http,
fs = require('fs'),
path = require('path'),
firstdate = require('../utils/firstdate'),
getLinks = require('../utils/getlinks'),
extract = require('pdf-text-extract'),
logger = require('../utils/logger'),
getPDF = require('../utils/getPDF'),
urlcheck = require('../utils/urlcheck');

//SPECIAL
var base_url = 'http://www.sanjoseinfo.org',
main_url = base_url + '/go/doctype/1914/47735/?offset={n}0',
already_checked_urls;

module.exports = function() {
	return new Promise(function(resolve, reject) {
		//Iterate through pages with lists of press releases
		var press_release_promises = [];

		//Move through all of the pages with lists, creating an array of promises which return and parse PDFs.
		var nextListPage = function(n) {
			http.get(main_url.replace("{n}",n), function(res) {
				var body = '';
				if (res.statusCode==404) {
					reject(res);
				}
				res.on('data', function(chunk) {
					body += chunk;
				})
				res.on('end', function() {
					var links = getLinks(body, base_url, '#documentList .headline a');
					if (links.length > 0) {
						//Push a promise to an array
						press_release_promises.push(getPDFsFromList(links, n));
						nextListPage(n+1);
					} else {
						//When all promises are returned, flatten them into a 1d array and return.
						Promise.all(press_release_promises).then(
							function(results) {
								var press_releases = [];
								for (var i = results.length - 1; i >= 0; i--) {
									press_releases = press_releases.concat(results[i]);
								};
								resolve(press_releases);
							},
							function(err) {
								reject(err);
							}
						)		
					}

				})
			});
		};

		urlcheck('San Jose')(null,[]).then(function(checked_urls) {
			already_checked_urls = checked_urls
			nextListPage(0);
		});
	});
}

var getPDFsFromList = function(links, n) {
	var promise_array = [];

	for (var i = links.length - 1; i >= 0; i--) {
		if (already_checked_urls[links[i]]===undefined) {
			promise_array.push(getPDF(links[i], 'San Jose', i, n));
		}
	};
	return Promise.all(promise_array);
};

