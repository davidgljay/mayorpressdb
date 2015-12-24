//Seems like Pheonix is just a set of sequential ids going up like so:

//SPECIAL

//https://www.phoenix.gov/news/mayor/125
//Not sure when they start, seem so go up sequentially from 111
//They also seem to jump, hooboy. I'll get them in batches of 50. If there are none in a span of 30 I'll call it a day. 
//Calls of 50 will happen sequentially to avoid breaking their server.

var http = require('follow-redirects').http,
getPage = require('../utils/getpage'),
promise = require('promise');

var base_url = "http://www.phoenix.gov",
main_url = base_url + "/news/mayor/";

module.exports = function() {
	var count = 0,
	done = false,
	press_releases = [];

	return new Promise(function(resolve, reject) {
		var getReleases = function() {
			var promise_array = [];
			for (var i=0; i<50; i++) {
				//TODO: Replace with pheonix values.
				count ++;
				console.log(main_url+count)
				promise_array.push(getPage(main_url+count, '#MSOZoneCell_WebPartWPQ8', 'p', '.title'))
			}
			Promise.all(promise_array).then(function(results) {
				press_releases.concat(results);
				var cont = false;
				for (var i=0; i<results.length; i++) {
					if (results[i]!=null) {
						cont = true;
					}
				}
				if (cont) {
					getReleases()
				} else {
					resolve(press_releases);
				}
			}, function(err) {
				reject(err);
			})	
		};
		getReleases();		
	})
}




