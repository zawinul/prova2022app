var tm = require('./ticket-machine.js');
var utils = require('./utils.js');

const VERSION = "01 01";
const region = 'eu-south-1';

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

// async function testS3(credentials) {
// 	const AWS = require('aws-sdk');

// 	const Bucket = 'tenant-a1';
// 	var s3Config = {};

// 	s3Config = {
// 		credentials,
// 		region: 'eu-south-1'
// 	};
// 	console.log({s3Config});

// 	var s3 = new AWS.S3(s3Config);
// 	//console.log({s3});

// 	var name = 'file_tm_' + Math.floor(Math.random() * 1000000);
// 	var params = {
// 		Body: 'aaa',
// 		Bucket,
// 		Key: name
// 	};
// 	console.log(`put ${name} on ${Bucket}`);
// 	var req = s3.putObject(params);
// 	// req.
// 	// 	on('success', function (response) {
// 	// 		console.log("Success!");
// 	// 	}).
// 	// 	on('error', function (error, response) {
// 	// 		console.log("Error!");
// 	// 	}).
// 	// 	on('complete', function (response) {
// 	// 		console.log("Always!");
// 	// 	});

// 	// req.send();

// 	await req.promise();
// 	// var data = await s3.putObject(params).promise();
// 	// log({ data });
// 	// return data;
// 	return {};
// }


exports.handler = async (event, context) => {
	utils.setupLogObj();
	console.log({VERSION});
	console.log({input:{event,context}});

	var ret = {
		"statusCode": 400,
		"body": "Function not found: "+event.function
	};
	if (event.function=='getUserInfo') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			"statusCode": 200,
			"body": userinfo
		};
	}
	else if (event.function=='getRoleCredentials') {
		var credentials = await tm.getCredentials(
			event.access_token, 
			event.region || region,
			event.sessionName || 'session'+Math.random(),
			event.source || 'generic'
		);

		// try {
		// 	var retTestS3 = await testS3(credentials.credentials);
		// 	console.log({retTestS3});
		// } catch (err) {
		// 	console.log({err});
		// }

		credentials.version = '01 00';
		
		ret = {
			"statusCode": 200,
			"body": credentials
		};
	}
	else if (event.function=='verifyToken') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			"statusCode": 200,
			"body": userinfo
		};
	}
	console.log({VERSION});

	console.log({ret});
	return ret;
};
