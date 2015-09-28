var config = require('./config');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var DigitalOcean = require('do-wrapper');

var api = new DigitalOcean(config.doApiKey, 100);
Promise.promisifyAll(api);

// run
// inspect SNS for alarm name, scale up or down accordingly
//
var _run = function(event, context) {
  console.log("event : ", event);
  var message = event.Records[0].Sns.Message;
  message = JSON.parse(message);
  console.log("_run : message : ", message);

  if( message.AlarmName === config.highAlarmName ) {
    //SCALE UP
    console.log("scaling up..");
    api.dropletsGetAllAsync({}
    ).then( _configure_scale_up
    ).then( _scale_up
    ).then( function(results) { context.succeed(true);}
    ).catch(
      function(err) {
        console.error("Error : err : " + err);
        context.fail(err);
      }
    );
  } else if ( message.AlarmName === config.lowAlarmName ) {
    //SCALE DOWN
    console.log("scaling down..");
    api.dropletsGetAllAsync({}
    ).then( _configure_scale_down
    ).then( _scale_down
    ).then( function(results) { context.succeed(true);}
    ).catch(
      function(err) {
        console.error("Error : err : " + err);
        context.fail(err);
      }
    );
  };
};

// -----------------------------------------
// config scale down  - how many should we delete?
//
var _configure_scale_down = function(results){
  var droplets = results[0].body.droplets;
  var remove = droplets.length - config.minInstances;
  var idsToRemove = [];
  console.log("calc items to scale down : min allowed : " + config.minInstances + " : current : " + droplets.length + " : should remove : " + remove);

  if (remove > 0) {
    for(var i = 0; i<remove; i++) {
      console.log("targeting : " + droplets[i].id + " : " + droplets[i].name + " for delete");
      idsToRemove.push(droplets[i].id);
    }
  };
  return idsToRemove;
};

// -----------------------------------------
// config scale up - how many should we add?
//
var _configure_scale_up = function(results){
  var droplets = results[0].body.droplets;
  var add = config.maxInstances - droplets.length;
  console.log("calc items to scale up : max allowed : " + config.maxInstances + " : current : " + droplets.length + " : should add : " + add);
  return add
};

// -----------------------------------------
// scale_down : remove instances (by id)
//
var _scale_down = function(ids) {
  console.log("scale down : ids : " + ids);

  var deletes = [];
  for(var i =0; i<ids.length; i++){
    deletes.push(api.dropletsDeleteAsync(ids[i]));
  };

  return Promise.all(deletes).then(function() {
     console.log("all deletes done!");
  });
};

// -----------------------------------------
// scale_up : add instances (number)
//
var _scale_up = function(number) {
  console.log("scale up : number : " + number);

  var params = {
      name: null,
      region: config.doRegion,
      image: config.doImageId,
      size: config.doSize,
      ssh_keys: [config.sshKeyId]
  };

  var adds = [];
  for(var i =0; i<number; i++){
    var randId = Math.floor( Math.random() * (10000 - 100) + 100 );
    params.name = config.doImageBaseName + randId;
    console.log("adding : " + params.name + " : " + params.size + " : " + params.image + " : " + params.region);
    adds.push(api.dropletsCreateAsync(params));
  };

  return Promise.all(adds).then(function() {
     console.log("all adds done!");
  });
};

// -----------------------------------------
exports.handler = function(event, context) {
  _run(event, context);
};


// -----------------------------------------
// TESTING FOR RUNNING LOCAL
//
// eg. $>node index.js test create
//     will run an integration test locally
var first_value = process.argv[2];
var second_value = process.argv[3];
if ("test" === first_value) {

  switch(second_value) {
    case 'up':
      _run(config.test.fake_sns_high, config.test.fake_context);
      break;
    case 'down':
      _run(config.test.fake_sns_low, config.test.fake_context);
      break;
  }
};
