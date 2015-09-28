### lambda-scale-digitalocean  

AWS Lambda for scaling (up or down) DigitalOcean instances based on a Cloudwatch Alert => SNS message.
You will need a DigitalOcean account with an APIKey, Image id, SSH key id.  
You will need an AWS account with Cloudwatch alarms set to fire SNS alerts on high and low item counts in an SQS instance.

### What problem does this solve?  

You need to scale worker instances running in DigitalOcean based on counts of messages inside your AWS kit. That's odd you might say, why not have workers simply running in AWS and take advantage of various autoscaling AWS goodies. Um, sometimes workers are doing things you dont necesssarily want associated with your AWS account. * cough * .... like maybe scraping the web or hacking re-captcha. Hypothetically, of course.

### Install  
```$>npm install```

### Lambda Usage
Designed to work with a high and low sqs size alarm via Cloudwatch Alert => SNS announcement.  
The high sns alert will trigger a scale up. The low sns alert will trigger a scale down. Your config should indicate the desired ```AlarmName``` property of each.  

Items you will need to configure in ```config.js```:
- region : your AWS REGION
- highAlarmName : name of SNS alarm to indicate a scale up is needed
- lowAlarmName : name of SNS alarm to indicate a scale down is needed
- doApiKey : DigitalOcean API Key
- doImageId : DigitalOcean image id
- doSSHKey : DigitalOcean SSH key id
- doRegion : DigitalOcean preferred region eg. 'nyc2'
- doSize  : DigitalOcean box size eg. '512mb'
- doImageBaseName : start of naming convention for these instances, will have a random id appended to it for full name. eg. 'chicken-897'
- maxInstance : maximum number instances to scale up to
- minInstance : min number of boxes to scale down to

Example:  
```
config = {
  region: 'us-east-1',
  highAlarmName: 'sqs-count-high',
  lowAlarmName:  'sqs-count-low',
  doApiKey: 'b52533f363700hfuk520012987f38f13802e939d293c1edb01869cb196efd30',
  doImageId: 13555722,
  doSSHKeyId: 1231329,
  doRegion: 'nyc2',
  doSize: '512mb',
  doImageBaseName: 'do-worker-',
  maxInstances: 50,
  minInstances: 7
}
```

### Deploy

The deploy directory contains shell scripts to create and upload a Lambda function as well as set policy on it. AWS cli installation and properly configured aws credentials are a must for this shell to work.  

This deploy shell will NOT setup SQS/SNS/Cloudwatch. Nor will it configure the Lambda to listen for SNS events. At the time I created this repo the aws-cli could not
set event triggers on Lambdas. You will have to do that via the AWS mgmt console.


#### Reference
[AWS Lambda Documentation](https://aws.amazon.com/lambda/)  
[AWS Cloudwatch Alarms](https://aws.amazon.com/documentation/cloudwatch/)
[AWS SNS Topics](https://aws.amazon.com/documentation/sns/)  
[DigitalOcean](https://www.digitalocean.com)  
[DigitalOcean API](https://www.digitalocean.com/features/api/)  
[DigitalOcean Wrapper for node](https://github.com/matt-major/do-wrapper)
[AWS SDK for node](https://github.com/aws/aws-sdk-js)  
