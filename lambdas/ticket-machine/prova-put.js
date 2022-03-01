const http = require('http');
const https = require('https');
const AWS = require('aws-sdk');
//const utils = require('./utils2022.js');

const log = x => typeof(x)=='object' ? console.log(JSON.stringify(x,null,2)) : console.log(x);

var lambdaStartTime = new Date();
log('started at ' + lambdaStartTime);

function bothCaseFields(obj) {
	for (var k in obj) {
		var k2 = k.substring(0,1).toLowerCase()+k.substring(1);
		if (k!=k2 && !obj[k2])
			obj[k2] = obj[k];
	}
	for (var k in obj) {
		var k2 = k.substring(0,1).toUpperCase()+k.substring(1);
		if (k!=k2 && !obj[k2])
			obj[k2] = obj[k];
	}
	return obj;
}

async function testS3(event) {
	const Bucket = 'tenant-a1';

	const adminWithoutMFAKeyId = 'AKIARBQSOGSVGTQSKJ7P';
	const adminWithoutMFASecretAccessKey = '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';

	// const tenant1KeyId = "AKIARBQSOGSVEBOWJ6NE";
	// const tenant1SecretAccessKey = "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";

	const sts = new AWS.STS({
		credentials: new AWS.Credentials(adminWithoutMFAKeyId, adminWithoutMFASecretAccessKey),
		// accessKeyId: adminWithoutMFAKeyId,
		// secretAccessKey: adminWithoutMFASecretAccessKey,
		endpoint:'https://sts.eu-south-1.amazonaws.com',
		region:'eu-south-1'
	});

	var arParams = {
		RoleArn: "arn:aws:iam::071979381930:role/tenant_a1_writer",
		RoleSessionName: "testAssumeRoleSession" + Math.random(),
		DurationSeconds: 900
	};

	var arData = await sts.assumeRole(arParams).promise();
	var credentials = sts.credentialsFrom(arData);
	log({ aaa: {credentials, arData}});
	//AWS.config.region = 'eu-south-1';
	var s3Config = {
		//apiVersion: '2006-03-01',
		//credentials:bothCaseFields(arData.Credentials),
		credentials,

		//bothCaseFields(arData.Credentials),
		// credentials: new AWS.Credentials(
		// 	// adminWithoutMFAKeyId,
		// 	// adminWithoutMFASecretAccessKey

		// 	// tenant1KeyId,
		// 	// tenant1SecretAccessKey

		// 	arData.Credentials.AccessKeyId,
		// 	arData.Credentials.SecretAccessKey,
		// 	arData.Credentials.SessionToken
		// ),
		region: 'eu-south-1',
		//endpoint: 's3.eu-south-1.amazonaws.com'
	};

	//log({ s3Config });
	//var s3 = new AWS.S3(s3Config);
	var s3 = new AWS.S3(s3Config);

	var name = 'file_prova_put_' + Math.floor(Math.random() * 1000000);
	var params = {
		Body: 'aaa',
		Bucket,
		Key: name
	};
	log(`put ${name} on ${Bucket}`);
	var request = s3.putObject(params);
	// request.on('send', function(a,b,c){
	// 	console.log({a,b,c});
	// });
	// request.on('validate', function(a,b,c){
	// 	console.log({a,b,c});
	// });
	var data = await request.promise();
	log({ data });
	return data;
}

testS3().then(log, log);
