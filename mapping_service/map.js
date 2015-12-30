//Pulls press relases and generates maps overall and by city.
//This will involve a large word freqency hashmap probably, possibly an array with mergesort.

var promise = require('Promise');

var dynamo_get = function(lastId) {
	//get next 100 from last id, then run callback.
}