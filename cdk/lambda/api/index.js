
/*
const AWS = require('aws-sdk');
const utils = require('./utils2022.js');

var logbuf = [];
utils.setupCustomLogger(x=>logbuf.push(x));

var lambdaStartTime = new Date();
console.log('started at ' + lambdaStartTime);

function duplicateCase(obj) {
	for(var k in obj) {
		var lk = k.substring(0,1).toLowerCase()+k.substring(1);
		var uk = k.substring(0,1).toUpperCase()+k.substring(1);
		if (!obj[lk])
			obj[lk] = obj[k];
		if (!obj[uk])
			obj[uk] = obj[k];
	}
	return obj;
}
async function testS3(credentials) {

	const Bucket = 'tenant-a1';
	var s3Config = {};

	s3Config = {
		credentials:duplicateCase(credentials),
		Credentials:duplicateCase(credentials),
		region: 'eu-south-1',
		Region: 'eu-south-1',
	};
	//console.log({s3Config});

	var s3 = new AWS.S3(s3Config);
	//console.log({s3});

	var name = 'file_' + Math.floor(Math.random() * 1000000);
	var params = {
		Body: 'aaa',
		Bucket,
		Key: name
	};
	console.log(`put ${name} on ${Bucket}`);
	var req = s3.putObject(params);
	// req.
	// 	on('success', function (response) {
	// 		console.log("Success!");
	// 	}).
	// 	on('error', function (error, response) {
	// 		console.log("Error!");
	// 	}).
	// 	on('complete', function (response) {
	// 		console.log("Always!");
	// 	});

	req.send();

	await req.promise();
	// var data = await s3.putObject(params).promise();
	// log({ data });
	// return data;
	return {};
}


exports.handler = async (event, context) => {

	console.log({ inputEvent:event });
	var credentials = await utils.getCredentials(event.headers.authorization);
	console.log({credentials});

	var origin = '*';
	if (event.headers && event.headers.origin)
		origin = event.headers.origin;

	console.log('origin=' + origin);
	let statusCode = '200';
	const headers = {
		"Access-Control-Allow-Origin": origin,
		'Access-Control-Allow-Credentials': true
	};

	try {
		await testS3(credentials);
	} catch (error) {
		console.log({ testS3Error: error });
		if (error.stack)
			console.log({ testS3ErrorStack: error.stack.split('\n') });
	}

	console.log('VERSIONE 0.7');
	console.log('aws version: ' + AWS.VERSION);

	var ret = {
		statusCode,
		body: JSON.stringify(logbuf, null, 4),
		headers
	};
	return ret;

};

*/
