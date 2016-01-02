var AlchemyAPI = require('alchemy-api'),
Promise = require('promise');

var alchemy_api = new AlchemyAPI(process.env.ALCHEMY_API_KEY);

/*
* Takes a stream of press releases and uses IBM's AlchemyAPI to identify their topics an any people mentioned. 
* Data is then stored in a DynamoDB table of the form:
* 
* A mayorsdb_tags table of the form:
*  {"tag":
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

module.exports.handler = function(event, context) {

}


//Function which returns a promise to deliver a list of tags in an array.
var get_tags = function(url) {

}

//Function which returns a promise to deliver a list of people mentioned in the press release.
var get_entities = function(url) {

}



