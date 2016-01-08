module.exports = function() {
	this.maps = {
		all:[]
	}
}

module.exports.parse = function(tags) {
	for (var i = tags.length - 1; i >= 0; i--) {
		var tag = tags[i];
		hash.all.push({
			tag:tag.name,
			count:tag.articles.length,
			med_date:med_date(tag.articles)
		});
		for (var key in tag) {
			if (key.slice(0,9)=="city_articles") {
				var city = key.slice(9);
				if (!this.maps.hasOwnProperty(city)) {
					this.maps[city] = [];
				}
				this.maps[city].push({
					tag:tag.name,
					
				});
				concat(tag['city_articles' + city]);
			} else if {

			}
			/*
			* If the tag starts with city_name get the name of the city.
			* See if hash has that city yet. If not create an array.
			* Push this tag to the city array, along with the count and med_date of city_articles
			*/

			/*
			* Do a similar thing for people. Find each tag starting with person and move them into the appropriate city hash.
			*/

			/*
			* Finally, do a similar thing for each city_tag. 
			*/
		}
	};
}

var med_date = function(releases) {
	//Get median date
}