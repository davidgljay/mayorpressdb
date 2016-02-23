'use strict';

var dynamo = require('../api/dynamo'),
logger = require('./logger');


module.exports=function(city) {
	return function queryDynamo(lastKey, urls) {
		return new Promise(function(resolve, reject) {
			var params = {
				TableName: process.env.RELEASE_TABLE,
				ConsistentRead: false,
				ReturnConsumedCapacity: 'TOTAL',
				ExpressionAttributeNames: {
		            '#url': 'url'
		        },
		        ExpressionAttributeValues: {
		             ':city':{S:city}
		        },
		        IndexName:'city-index',
		        KeyConditionExpression:'city=:city',
				ProjectionExpression:'#url'
			};
			
			if (lastKey) {
			    params.ExclusiveStartKey=lastKey;
			}
			
			var dynamopromise = dynamo.query(params).then(function(data) {
		        for (var i=0; i<data.Items.length; i++) {
	    	        urls[data.Items[i].url.S]=true;
		        }
		        logger.info('Got ' + city + ' urls ' + Object.keys(urls).length);
		        if (data.LastEvaluatedKey===undefined) {
	    	        return urls;
		        } else {
			        return queryDynamo(data.LastEvaluatedKey, urls);
		        }
			});
			setTimeout(function() {
				resolve(dynamopromise);
			},1000);
		});
	};
};