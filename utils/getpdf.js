var extract = require('pdf-text-extract'),
http=require('http');

module.exports=function(url, city, i, n) {
	return new Promise(function(resolve, reject) {
		fs.mkdir('./pdfs', function() {
			var file = fs.createWriteStream("./pdfs/pressrelease" + i + "-" + n + ".pdf");
			http.get(url, function(response) {
				if (response.statusCode == 404) {
					resolve(null);
				} else {
					response.pipe(file);
					response.on('end', function() {
						var filePath = path.join(__dirname, '../pdfs/pressrelease' + i + '-' + n + '.pdf');
						extract(filePath, function (err, pages) {
							if (err) {
								logger.error("PDF Extraction: " + err);
								resolve(null);
						  	} else {
						  		var body = pages.join('\n');
								var date = firstdate(body);
								if (date=='') {
									continue;
								}
								result_array.push({
										title: "Press Release: PDF",
										date: date.toISOString(),
										body: body,
										url: links[i],
										city: city
								});				
						  	};
						});
				  	});
			  	};		
			}, function(err) {
				logger.error('Error getting PDF:' + err );
			});
		})
	});
};