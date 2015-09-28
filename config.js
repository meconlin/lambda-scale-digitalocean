var config = {};
config = {
  region: 'us-east-1',
  highAlarmName: 'sqs-count-high',
  lowAlarmName:  'sqs-count-low',
  doApiKey: '<your long Digital Ocean APIKEY>',
  doImageId: 123456789,
  doSSHKeyId: 123456789,
  doRegion: 'nyc2',
  doSize: '512mb',
  doImageBaseName: 'do-box-',
  maxInstances: 10,
  minInstances: 2
}

// test objects for runing locally
//
config.test = {};
config.test.fake_context = {
                            done: function(err, value){ console.log('done : ',err, value);},
                            succeed: function( err, value ){ console.log('succeed', err, value)},
                            fail: function(err, value){ console.log('fail', err, value)}};

config.test.fake_sns_high = {
                            Records: [
                              {Sns: { Message: "{ \"AlarmName\": \"sqs-count-high\"}" } }
                            ]
                            };

config.test.fake_sns_low = {
                            Records: [
                              {Sns: { Message: "{ \"AlarmName\": \"sqs-count-low\"}" } }
                            ]
                            };

module.exports = config;
