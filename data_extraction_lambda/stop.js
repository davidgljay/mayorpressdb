var aws = require('aws-sdk');
var ec2 = new aws.EC2({apiVersion: '2015-10-01'});

module.exports.handler = function(event, context) {
    console.log(event);
    if (event.default.AlarmName == "MayorsDB") {
        var instanceParams = {
          InstanceIds: [ 'i-eb0b645a' ],
          DryRun: false
        };
        ec2.stopInstances(instanceParams, function(err, data) {
            if (err) {
                context.fail(err);
            } else {
                context.succeed(data);
            }
        });            
    } else {
        context.succeed();
    }
};