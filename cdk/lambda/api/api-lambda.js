
const utils = require('./api-utils');
const AWS = require('aws-sdk');

async function testS3(credentials) {
	var s3Config = {
		credentials,
		region: 'eu-south-1',
		Region: process.env.region
	};
	var s3 = new AWS.S3(s3Config);
	var buckets = JSON.parse(process.env.buckets);
	for(let Bucket of buckets) {
		var name = 'file_' + Math.floor(Math.random() * 1000000);
		try {
			var params = {
				Body: 'aaa',
				Bucket,
				Key: name
			};
			var req = s3.putObject(params);
			req.send();
			await req.promise();
			console.log(`put ${name} on ${Bucket} SUCCESS`);
		
		}catch(e) {
			console.log(`put ${name} on ${Bucket} FAIL: ${e}`);
		}
	}

	return "ok";
}

exports.main = async (event, context) => {
	utils.initLog();

	let statusCode = '200';
	let headers = {
		'Access-Control-Allow-Methods' : 'OPTIONS,POST,GET',
		'Access-Control-Allow-Headers' :  'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		'Access-Control-Allow-Credentials' :  true,
		'Access-Control-Allow-Origin': '*'
	};
	if (event.headers && event.headers.origin)
		headers["Access-Control-Allow-Origin"] = event.headers.origin;
	
	try {
		var credentials = null;
		const auth = event.headers.Authorization;
		if (auth) {
			if (auth.trim().toLowerCase().indexOf('Bearer ')==0)
				auth = auth.substring(7).trim();
			credentials = await utils.getCredentials();
			await testS3(credentials);
		}
	}catch(e) {
		console.log(e);
		console.log(e.stack.split('\n'));
	}
	const log = utils.getLogMessages();

	var ret = {
		statusCode,
		body: JSON.stringify({ event, env:process.env, credentials, log },null,2),
		headers
	};
	return ret;

};
