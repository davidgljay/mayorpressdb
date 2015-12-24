var cheerio = require('cheerio'),
http = require('http');

var url = "http://www.lamayor.org/press_release?page=1",
base_url = "http://www.lamayor.org";

//GetWithlist

//TODO: iterate through pages.

http.get(url, function(res) {
	var press_releases = [];
	//todo: consider making this a promise functionin utils for efficiency;
	var body = '';
	res.on('data', function(chunk) {
		body += chunk;
	});
	res.on('end', function() {
		$ = cheerio.load(body, {
    		normalizeWhitespace: true
		});
		$('#content .page_excerpt').each(function(i, elem) {
			var img_url = $(elem).find('img').attr('src')[0] == "/" ? base_url + $(elem).find('img').attr('src') : $(elem).find('img').attr('src');
			var date = new Date(/(·\s)(.+)/.exec($(elem).find('.byline').text())[2]);
			console.log(date.toISOString());
			// var date = 
  			press_releases.push({
  				"title": $(elem).find('h3').text(),
  				"body":  $(elem).find('.excerpt span').text(),
  				 "date":  date.toISOString(),
  				"image": img_url,
  				"url": base_url + $(elem).find('h3 a').attr('href')	
  			});
		});

	})
}).on('error', function(err) {
	console.log(err);
})

//TODO:Save to central db.