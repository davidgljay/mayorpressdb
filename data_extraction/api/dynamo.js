var AWS = require('aws-sdk'),
logger = require('../utils/logger'),
Deferred = require('promise'),
hash = require('../utils/hash'),
logger = require('../utils/logger');

AWS.config.update({
	accessKeyId: process.env.AWS_KEY, 
	secretAccessKey: process.env.AWS_SECRET, 
	region: process.env.AWS_REGION
});

var dynamodb = this.dynamodb = new AWS.DynamoDB({apiVersion: '2015-02-02'});

//TODO: Auth with dynamoDB.

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
				logger.info("Error posting item to dynamo\n" + err);
				reject(err);
			} else {
				logger.info("Item post to dynamo successful\n" );
				if (response.UnprocessedItems.keys.length > 0) {
					//Retry the post once if there are unprocessed items.
					repost(resolve, reject);
				} else {
					setInterval(function() {
						resolve();
					},200);
				}

			}
		});			
	});
};

var repost = function(resolve, reject) {
	setInterval(
		function() {
			var retry = {
			    "RequestItems": {},
			    ReturnConsumedCapacity: 'NONE'
			};
			retry[process.env.DYNAMODB_NAME] = response.UnprocessedItems;
			dynamodb.batchWriteItem(retry, function(err, response) {
				if (err) {
					logger.error("Error reposting item to dynamo\n" + err);
					reject(err);
				} else {
					logger.info("Reposted items to DynamoDB.");
					setInterval(function() {
						resolve();
					},200);
				}
			});
		},150);
};

var put_params = function(items) {
	var formatted_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		//Some items will be null, skip them.
		if (items[i] === null) {
			continue;
		}
		formatted_items.push({
			PutRequest: {
				Item:  {
					hash:{S:hash(items[i].url + "_" + items[i].date).toString()},
		           	title:{S:items[i].title},
		           	body:{S:items[i].body},
		           	date:{S:items[i].date},
		           	url:{S:items[i].url},
		           	city:{S:items[i].city}
	           	}
            }
          });
	}

	if (formatted_items.length === 0) {
		//Handle the case where we get a set entirely of null variables. This seems to be possible with Houston.
		return false;
	} else {
		var dynamo_output = {
		    "RequestItems": {},
		    ReturnConsumedCapacity: 'NONE'
		};
		dynamo_output.RequestItems[process.env.DYNAMODB_NAME] = formatted_items;
		return dynamo_output;		
	}

};