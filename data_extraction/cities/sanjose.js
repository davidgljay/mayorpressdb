
var http = require('follow-redirects').http,
fs = require('fs'),
path = require('path'),
firstdate = require('../utils/firstdate'),
getLinks = require('../utils/getlinks'),
extract = require('pdf-text-extract');;

//SPECIAL
var base_url = 'http://www.sanjoseinfo.org',
main_url = base_url + '/go/doctype/1914/47735/?offset={n}0';

module.exports = function() {
	return new Promise(function(resolve, reject) {
		//Iterate through pages with lists of press releases
		var press_release_promises = [];

		//Move through all of the pages with lists, creating an array of promises which return and parse PDFs.
		var nextListPage = function(n) {
			console.log(main_url.replace("{n}",n));
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
					console.log(links);
					if (links.length > 0) {
						//Push a promise to an array
						press_release_promises.push(getPDFsFromList(links, n));
						nextListPage(n+1);
					} else {
						console.log("Done adding to promise_array:" + press_release_promises.length);
						//When all promises are returned, flatten them into a 1d array and return.
						Promise.all(press_release_promises).then(
							function(results) {
								console.log("All results returned:" + results.length);
								var press_releases = [];
								for (var i = results.length - 1; i >= 0; i--) {
									press_releases = press_releases.concat(results[i]);
								};
								console.log(press_releases.length);
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
		nextListPage(0);
	});
}

var getPDFsFromList = function(links, n) {
	var promise_array = [];

	for (var i = links.length - 1; i >= 0; i--) {
		promise_array.push(getPDF(links[i], i, n));
	};
	return Promise.all(promise_array).then(function(press_releases) {
		var result_array = [];
		console.log("Got PDFs from list: " + press_releases.length);
		for (var i = press_releases.length - 1; i >= 0; i--) {
			var date = firstdate(press_releases[i]);
			if (date=='') {
				continue;
			}
			result_array.push({
					title: "Press Release: PDF",
					date: date.toISOString(),
					body: press_releases[i],
					url: links[i]
			});				
		};
		return result_array;		
	});		
};

var getPDF = function(url, i, n) {
	return new Promise(function(resolve, reject) {
		var file = fs.createWriteStream("./pdfs/pressrelease" + i + "-" + n + ".pdf");
		http.get(url, function(response) {
			console.log(response.statusCode);
			if (response.statusCode == 404) {
				resolve(null);
			} else {
				response.pipe(file);
				response.on('end', function() {
					var filePath = path.join(__dirname, '../pdfs/pressrelease' + i + '-' + n + '.pdf');
					console.log("About to extract at:" + filePath);
					extract(filePath, function (err, pages) {
						if (err) {
							console.log("PDF Extraction: " + err);
							resolve(null);
					  	} else {
					  		console.log("PDF read successful");
					  		resolve(pages.join('\n'));
					  	};
					});
			  	});
		  	};		
		});
	});
};