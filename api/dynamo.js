var AWS = require('aws-sdk'),
logger = require('../utils/logger'),
Deferred = require('promise'),
hash = require('../utils/hash');

AWS.config.update({
	accessKeyId: process.env.AWS_KEY, 
	secretAccessKey: process.env.AWS_SECRET, 
	region: process.env.AWS_REGION
});

var dynamodb = this.dynamodb = new AWS.DynamoDB({apiVersion: '2015-02-02'});

//TODO: Figure out how to avoid rewriting items.
/*
* I could hold all of my current URLs for a given city in memory. This would probably be fine.
* For a richer (but premature) optimization I could pull the urls into a list and check it with
* batchgetitems. 
* Then I avoid recrawling, which probably makes the most sense.
* I should do this at a city level. 
* I COULD then put additional press releases up with individual put requests to avoid overwriting them.
* Then I could have tag_service update all of those functions to mark them as scanned. This will let me stay
* Within the 1000 call/day limit and still make it through in 10 days.
*/

module.exports = function(items) {
	return new Promise(function(resolve, reject) {
		if (items === null) {
			resolve();
			return;
		}
		var formatted_items = put_params(items);
		if (!formatted_items) {
			resolve();
			return;
		}
		dynamodb.batchWriteItem(formatted_items, function(err, response) {
			if (err) {
				logger.error("Error in batchWriteItem for:\n" + err);
				// logger.error(formatted_items);
				resolve();
				return;
			}
			if (Object.keys(response.UnprocessedItems).length > 0) {
				//Retry the post once if there are unprocessed items.TODO: make this exponential.
				logger.info("Reposting " + Object.keys(response.UnprocessedItems).length + " items to dynamoDB.");
				resolve(repost(response, 0));
			} else {
				setTimeout(function() {
					resolve();
				},1000);
			}
		});			
	});
};

//Handle queries to dynamodb.
module.exports.query = function(params) {
	return new Promise(function(resolve, reject) {
		dynamodb.query(params, function(err, data) {
			if(err) reject(err);
			else resolve(data);
		})
	});
}


//Try reposting 5 times, if that doesn't work then give up.
var repost = function(response, tries) {
	return new Promise(function (resolve, reject) {
		if (tries>=5) {
			logger.info("Giving up on reposting " + Object.keys(response.UnprocessedItems).length + " entries");
			resolve();
			return;
		}
		logger.info("Trying to repost " + Object.keys(response.UnprocessedItems).length + " entries, try " + tries + ".");
		setTimeout(function() {
			var retry = {
			    "RequestItems": {},
			    ReturnConsumedCapacity: 'NONE'
			};
			retry.RequestItems = response.UnprocessedItems;
			//TODO: Post these w/ writeitem, rather than batchwrite.
			dynamodb.batchWriteItem(retry, function(err, response) {
				if (err) {
					logger.error("Error reposting item to dynamo\n" + err);
				} else if (Object.keys(response.UnprocessedItems).length > 0) {
					resolve(repost(response, tries+1));
				} else {
					resolve();
				}
			});
		}, 500);
	});
};

var put_params = function(items) {
	var formatted_items = [],
	hashes = new Set();

	for (var i = items.length - 1; i >= 0; i--) {
		//Some items will be null, skip them. Also confirm that there are no duplicate hashes.
	
		if (items[i] === null) continue;

		var urlid = items[i].url + ":" + items[i].date;
		if (hashes.has(urlid)) continue;
		for (var key in items[i]) {
			if (items[i][key]=="") continue;
		};
		if (urlid=="") continue;
		formatted_items.push({
			PutRequest: {
				Item:  {
					hash:{S:urlid},
		           	title:{S:items[i].title},
		           	body:{S:items[i].body},
		           	date:{S:items[i].date},
		           	url:{S:items[i].url},
		           	city:{S:items[i].city}
	           	}
            }
          });
		hashes.add(urlid);
	}
	

	if (formatted_items.length === 0) {
		//Handle the case where we get a set entirely of null variables. This seems to be possible with Houston.
		return false;
	} else {
		var dynamo_output = {
		    "RequestItems": {},
		    ReturnConsumedCapacity: 'NONE'
		};
		dynamo_output.RequestItems[process.env.RELEASE_TABLE] = formatted_items;
		return dynamo_output;		
	}

};