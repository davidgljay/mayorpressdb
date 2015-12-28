var AWS = require('aws-sdk'),
logger = require('../logger'),
Deferred = require('promise'),
hash = require('../utils/hash');

AWS.config.update({
	accessKeyId: process.env.AWS_KEY, 
	secretAccessKey: process.env.AWS_SECRET, 
	region: process.env.AWS_REGION
})

var dynamodb = this.dynamodb = new AWS.DynamoDB({apiVersion: '2015-02-02'})

//TODO: Auth with dynamoDB.

module.exports = function(items) {
	return new Promise(function(resolve, reject) {
		console.log("Preparing to post to dynamo");
		//TODO: make this a batchputitem for efficiency's sake.
		if (item == null) {
			resolve()
		} else {
			dynamodb.putItem(put_params(item)), function(err, response) {
				if (err) {
					console.log("Error posting item to dynamo");
					reject(err);
				} else {
					console.log("item post to dynamo successful");
					resolve();
				}
			};			
		}

	})
}

var put_params = module.exports.put_params = function(items) {
	var formatted_items = [];
	for (var i = items.length - 1; i >= 0; i--) {
		formatted_items.push({
			Item:  {
				hash:{S:hash(tems[i].url + items[i].date.toISOString())}
	           	title:{S:items[i].title},
	           	body:{S:items[i].body},
	           	date:{S:items[i].date.toISOString()},
	           	url:{S:items[i].url}
           	}
          });
	};

	return {
	    "RequestItems": 
    	    {
        	    process.env.DYNAMODB_NAME : formatted_items
        	}s,
	    ReturnConsumedCapacity: 'NONE'
	};
};