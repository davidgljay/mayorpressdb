//Seems like Pheonix is just a set of sequential ids going up like so:

//SPECIAL

//https://www.phoenix.gov/news/mayor/125
//Not sure when they start, seem so go up sequentially from 111.

var http = require('follow-redirects').http,
getLinks = require('../utils/getlinks'),
getPage = require('../utils/getpage');

var base_url = "http://www.phoenix.gov",
main_url = base_url + "/news/mayor/";

var count = 110,
done = false,
press_releases = [];

var getReleases = function() {
	var promise_array = [];
	for (var i=0; i<30; i++) {
		//TODO: Replace with pheonix values.
		count ++;
		console.log(main_url+count)
		promise_array.push(getPage(main_url+count, '#MSOZoneCell_WebPartWPQ8', 'p', '.title'))
	}
	Promise.all(promise_array).then(function(results) {
		press_releases.concat(results);
		console.log(results);
		var cont = false;
		for (var i=0; i<results.length; i++) {
			if (results[i]!=null) {
				cont = true;
			}
		}
		if (cont) {
			getReleases()
		} else {
			return press_releases;
		}
	}, function(err) {
		console.log("Error in pheonix:" + err);
	})	
}

getReleases();


