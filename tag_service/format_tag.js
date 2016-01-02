/* 
* Takes responses from AlchemyApi and formats them in the form:
* *  {"tag":
		{
		"count":1,
		"dates":[
		]
		"articles":[
			{
				"title":"TITLE",
				"date:"20160101",
				"url":"http://url.url",
				"hash":"adshf98yh"
			}
		],
		"people":[
			{
				"name":"Mr. Mayor",
				"mentions":""
			}
		],
		"cities":[
			{
				"New York": {
					"count":1,
					"dates":[
					]
				}
			}
		]
	}
*/

var Promise = require('promise');

module.exports = function() {}

//Gets the existing record for a tag. Returns as a promise.
var get_tag = function(tag) {

}

