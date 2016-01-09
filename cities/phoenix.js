//Seems like Pheonix is just a set of sequential ids going up like so:

//SPECIAL

//https://www.phoenix.gov/news/mayor/125
//Not sure when they start, seem so go up sequentially from 111
//They also seem to jump, hooboy. I'll get them in batches of 50. If there are none in a span of 30 I'll call it a day. 
//Calls of 50 will happen sequentially to avoid breaking their server.

var getPage = require('../utils/getpage'),
promise = require('promise'),
logger = require('../utils/logger');

var base_url = "http://www.phoenix.gov",
main_url = base_url + "/news/mayor/";

module.exports = function() {
	var count = 100,
	done = false,
	press_releases = [];

	return new Promise(function(resolve, reject) {
		var getReleases = function() {
			var promise_array = [];
			var sleepBy = 0;
			for (var i=0; i<100; i++) {
				count ++;
				sleepBy += 500;
				promise_array.push(getPage(main_url+count, sleepBy, {
					content:'#MSOZoneCell_WebPartWPQ9', 
					body:'p', 
					title:'.title',
					city:'Phoenix'
				}))
			}
			Promise.all(promise_array).then(function(results) {
				press_releases = press_releases.concat(results);
				var cont = false;
				for (var i=0; i<results.length; i++) {
					if (results[i]!=null) {
						cont = true;
					}
				}
				if (cont) {
					getReleases()
				} else {
					logger.info("No results in set");
					resolve(press_releases);
				}
			}, function(err) {
				reject(err);
			})	
		};
		getReleases();		
	})
}




