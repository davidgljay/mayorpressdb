var extract = require('pdf-text-extract'),
http = require('follow-redirects').http,
fs = require('fs'),
path = require('path'),
firstdate = require('./firstdate');

module.exports=function(url, city, i, n) {
	return new Promise(function(resolve, reject) {
		fs.mkdir('./pdfs', function() {
			var file = fs.createWriteStream("./pdfs/pressrelease" + i + "-" + n + ".pdf");
			logger.info('Getting pdf');
			logger.info(url);
			http.get(url, function(response) {
				if (response.statusCode == 404) {
					resolve(null);
				} else {
					response.pipe(file);
					response.on('end', function() {
						var filePath = path.join(__dirname, '../pdfs/pressrelease' + i + '-' + n + '.pdf');
						extract(filePath, function (err, pages) {
							if (err) {
								logger.info("PDF Extraction: " + err);
								resolve(null);
						  	} else {
						  		var body = pages.join('\n');
								var date = firstdate(body);
								if (date=='') {
									resolve(null);
									return
								}
								resolve({
										title: "Press Release: PDF",
										date: date.toISOString(),
										body: body,
										url: url,
										city: city
								});
						  	};
						});
				  	});
			  	};		
			}, function(err) {
				reject('Error getting PDF:' + err );
			});
		})
	});
};