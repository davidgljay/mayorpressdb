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

module.exports.post = function(items) {
	return new Promise(function(resolve, reject) {
		//TODO: make this a batchputitem for efficiency's sake.
		if (items == null) {
			resolve();
			return;
		}
		var formatted_items = put_params(items);
		if (!formatted_items) {
			resolve();
			return;
		};
		dynamodb.batchWriteItem(formatted_items, function(err, response) {
			if (err) {
				logger.error("Error posting item to dynamo:" + err);
				reject(err);
			} else {
				logger.info("Item post to dynamo successful\n" + JSON.stringify(response));
				resolve();
			}
		});			
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
				Item:  items[i]
            }
          });
	};

	if (formatted_items.length == 0) {
		//Handle the case where we get a set entirely of null variables. This seems to happen with Houston.
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