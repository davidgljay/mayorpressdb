var http = require('http'),
Promise = require('promise'),
getPage = require('../utils/getPage');

//Dallas stores an archive of press releases in a JSON file. Pull the links from this JSON file and get each press release.
var dallas_url = 'http://content.govdelivery.com/accounts/TXDALLAS/widgets/TXDALLAS_WIDGET_4.json';

module.exports = function() {
	var press_releases = [],
	sleepBy = 0;
	return new Promise(function(resolve, reject) {
		http.get(dallas_url, function(res) {
      if (res.statusCode==404) {
       	resolve('done');
      }
  		var body = '';
  		res.on('data', function (chunk) {
      		body += chunk;
    	});
  		res.on('end', function() {
  			var data = JSON.parse(body),
  			promise_array = [];
  			for (var i = data.length - 1; i >= 0; i--) {
  				promise_array.push(getPage(data[i].href, sleepBy,
  				{
  					content: '#bulletin_content',
    				body: '#bulletin_body',
    				title: '.bulletin_subject'
  				}));
  				sleepBy += 100;
  			};
  			Promise.all(promise_array).then(function(press_releases) {
  				resolve(press_releases);
  			});
			});
	  });
  });
}
