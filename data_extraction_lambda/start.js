var aws = require('aws-sdk');

var ec2 = new aws.EC2({apiVersion: '2015-10-01'});
var ecs = new aws.ECS();

module.exports.handler = function(event, context) {
    var instanceParams = {
      InstanceIds: [ 'i-eb0b645a' ],
      DryRun: false
    };
    ec2.startInstances(instanceParams, function(err, data) {
        if (err) context.fail(err);
    })
    ec2.waitFor('instanceRunning', instanceParams, function(err, data) {
        if (err) context.fail(err);
        else runTask();
    });
};

var runTask = function() {
    var ContainerParams = {
      taskDefinition: 'MayorsDB_Data:5',
      cluster: 'mayorsdb',
      count: 1
    };
    ecs.runTask(ContainerParams, function(err, data) {
      if (err) context.fail(err);
      else if (data.failure) setInterval(runTask(), 250);
      else context.succeed("Successfully started task\n" + JSON.stringify(data));
  });
}