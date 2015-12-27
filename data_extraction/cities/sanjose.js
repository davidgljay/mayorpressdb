
var http = require('http'),
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
			http.get(main_url.replace("{n}",n), function(res) {
				var body = '';
				if (res.statusCode==404) {
					reject(res);
				}
				res.on('data', function(chunk) {
					body += chunk;
				})
				res.on('end', function() {
					var links = getLinks(body, '#documentlist .header a');
					if (links.length > 0) {
						//Push a promise to an array
						press_release_promises.push(getPDFsFromList(links, n));
						nextListPage(n++);
					} else {
						//When all promises are returned, flatten them into a 1d array and return.
						Promise.all(press_release_promises).then(
							function(results) {
								var press_releases = [];
								for (var i = results.length - 1; i >= 0; i--) {
									press_releases.concat(results[i]);
								};
								resolve(press_releases);
							}
						)		
					}

				})
			});
		};
		nextListPage(1);
	});
}

var getPDFsFromList = function(links, n) {
	var promise_array = [];

	for (var i = links.length - 1; i >= 0; i--) {
		promise_array.concat(getPDF(links[i], i, n));
	};
	return Promise.all(promise_array).then(function(press_releases) {
		var result_array = [];
		for (var i = press_releases.length - 1; i >= 0; i--) {
			result_array.push({
				{
					title: "Press Release- PDF",
					date: firstdate(press_releases[i]),
					body: press_releases[i],
					url: links[i]

				}
			});
		};		
	});		
};

var getPDF = function(url, n, l) {
	var file = fs.createWriteStream("file" + n + "-" + l + ".pdf");
	return new Promise(function(resolve, reject) {
		http.get(url, function(response) {
		  response.pipe(file);
		  response.on('end', function() {
		  	var filePath = path.join(__dirname, './file' + n '-' + l + '.pdf');
			extract(filePath, function (err, pages) {
			  if (err) {
			    reject("PDF Extraction: " + err);
			  } else {
			  	resolve(pages.join('\n'));
			  }
			})
		  });		
		});
});