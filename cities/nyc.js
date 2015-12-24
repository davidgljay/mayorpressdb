// Should return items of the format:
// Headline, body, tags, image, postdate.

//SPECIAL

var http = require('http');

//TODO: remove start and endate;
var nyc_url = "http://www1.nyc.gov/home/lscs/NewsFilterService.page?category=all&contentType=press_release,statement,executive_order,public_schedule&language=english&pageNumber=1";
var press_releases = [];

//TODO: iterate through page numbers with a short sleep until I recieve a 404.

http.get(nyc_url, function(res) {
	console.log(res.statusCode);
	var body = '';
	res.on('data', function (chunk) {
    	body += chunk;
  	});
  	res.on('end', function() {
  		body = /(.+-->)(.+)(<!-.+)/.exec(body)[2];
  		var response = JSON.parse(body).results.assets,
  		for (var i in response) {
  			press_releases.push({
  				"title": response[i].metadata['TeamSite/Metadata/Title'],
  				"body":  response[i].metadata['TeamSite/Metadata/Description'],
  				"date":  new Date(response[i].metadata['TeamSite/Metadata/Date'],
  				"image": response[i].metadata['TeamSite/Metadata/ImagePath'],
  				"url": 'http://www1.nyc.gov' + response[i].metadata['TeamSite/Metadata/URL']
  			});
    		}
  	})
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});;