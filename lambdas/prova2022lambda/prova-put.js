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

	var secret = require('./prova-put.secret.json');


	const sts = new AWS.STS({
		apiVersion: '2011-06-15',
		accessKeyId: secret.adminWithoutMFAKeyId,
		secretAccessKey: secret.adminWithoutMFASecretAccessKey,
		endpoint:'https://sts.eu-south-1.amazonaws.com',
		region:'eu-south-1'
	});

	var arParams = {
		RoleArn: "arn:aws:iam::071979381930:role/tenant_a1_writer",
		RoleSessionName: "testAssumeRoleSession" + Math.random(),
		DurationSeconds: 900
	};
	//log({ arParams });
	var arData = await sts.assumeRole(arParams).promise();
	log({ arData });
	//AWS.config.credentials = arData.Credentials;
	AWS.config.region = 'eu-south-1';
	var s3Config = {
		//credentials: arData.Credentials,
		apiVersion: '2006-03-01',
		credentials: bothCaseFields(arData.Credentials),
		// credentials: new AWS.Credentials(
		// 	// adminWithoutMFAKeyId,
		// 	// adminWithoutMFASecretAccessKey

		// 	// tenant1KeyId,
		// 	// tenant1SecretAccessKey

		// 	arData.Credentials.AccessKeyId,
		// 	arData.Credentials.SecretAccessKey,
		// 	arData.Credentials.SessionToken
		// ),
		region: 'eu-south-1'
	};

	log({ s3Config });
	//var s3 = new AWS.S3(s3Config);
	var s3 = new AWS.S3(s3Config);

	var name = 'file_' + Math.floor(Math.random() * 1000000);
	var params = {
		Body: 'aaa',
		Bucket,
		Key: name
	};
	log(`put ${name} on ${Bucket}`);
	var request = s3.putObject(params);
	request.on('success', function (response) {
		log("Success!");
	});
	
	request.on('error', function (error, response) {
		log({ reqHeaders: response.request.httpRequest.headers});
		log({error});
	});

	request.on('complete', function (response) {
		log("Always!");
	});
	request.send();
	var data = await request.promise();
	log({ data });
	return data;
}

testS3().then(log, log);