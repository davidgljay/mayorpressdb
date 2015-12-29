var AWS = require('aws-sdk'),
logger = require('../utils/logger'),
Deferred = require('promise'),
hash = require('../utils/hash'),
logger = require('../utils/logger');

AWS.config.update({
	accessKeyId: process.env.AWS_KEY, 
	secretAccessKey: process.env.AWS_SECRET, 
	region: process.env.AWS_REGION
})

var dynamodb = this.dynamodb = new AWS.DynamoDB({apiVersion: '2015-02-02'})

//TODO: Auth with dynamoDB.

module.exports = function(items, city) {
	return new Promise(function(resolve, reject) {
		//TODO: make this a batchputitem for efficiency's sake.
		if (items == null) {
			resolve()
		} else {
			dynamodb.batchWriteItem(put_params(items), function(err, response) {
				logger.info("Got dynamo response");
				if (err) {
					logger.error("Error posting item to dynamo:" + err);
					reject(err);
				} else {
					logger.info("Item post to dynamo successful:" + response);
					resolve();
				}
			});			
		;}
	});
}

var put_params = function(items) {
	var formatted_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		//Some items will be null, skip them.
		if (items[i] == null) {
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
		           	city:{S:city}
	           	}
            }
          });
	};

	var dynamo_output = {
	    "RequestItems": {},
	    ReturnConsumedCapacity: 'NONE'
	};
	dynamo_output.RequestItems[process.env.DYNAMODB_NAME] = formatted_items;
	return dynamo_output;
};