
const utils = require('./api-utils');
const AWS = require('aws-sdk');

async function getLoginUrl(provider, callback) {
	try {
		console.log('getLoginUrl ' + provider + ',' + callback);
		let lambda = new AWS.Lambda({ region: process.env.ticketMachineLambdaRegion });

		var lambdaEvent = {
			function: 'getLoginParameters',
			provider,
			callback
		};


		var params = {
			FunctionName: process.env.ticketMachineLambdaName,
			Payload: JSON.stringify(lambdaEvent),
		};

		var lambdaResult = await lambda.invoke(params).promise();
		var data = JSON.parse(lambdaResult.Payload);
		console.log('lambdaResult: ' + JSON.stringify(lambdaResult));
		return data;

	} catch (err) {
		console.log(err);
		console.log(err.stack.split('\n'));
		return { err }
	}
}

async function loginSetCode(href, token) {
	try {
		console.log('loginSetCode ' + token + ',' + href);
		let lambda = new AWS.Lambda({ region: process.env.ticketMachineLambdaRegion });

		var lambdaEvent = {
			function: 'login-set-code',
			token,
			href
		};


		var params = {
			FunctionName: process.env.ticketMachineLambdaName,
			Payload: JSON.stringify(lambdaEvent),
		};

		var lambdaResult = await lambda.invoke(params).promise();
		var data = JSON.parse(lambdaResult.Payload);
		console.log('lambdaResult: ' + JSON.stringify(lambdaResult));
		return data;

	} catch (err) {
		console.log(err);
		console.log(err.stack.split('\n'));
		return { err }
	}

}

async function testS3(localToken) {
	let credentials = await utils.getCredentials(localToken,{});
	let log = [];
	log.push("cred="+JSON.stringify(credentials));
	var s3Config = {
		credentials,
		region: 'eu-south-1',
		Region: process.env.region
	};
	var s3 = new AWS.S3(s3Config);
	var buckets = JSON.parse(process.env.buckets);
	for (let Bucket of buckets) {
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
			log.push(`put ${name} on ${Bucket} SUCCESS`);

		} catch (e) {
			log.push(`put ${name} on ${Bucket} FAIL: ${e}`);
		}
	}

	return log;
}

exports.main = async (event, context) => {
	console.log(JSON.stringify(event,null,2));
	let headers = {
		'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
		'Access-Control-Allow-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Allow-Origin': '*'
	};
	if (event.headers && event.headers.origin) {
		headers["Access-Control-Allow-Origin"] = event.headers.origin;
		console.log('Access-Control-Allow-Origin = '+event.headers.origin);
	}
	let params = event.queryStringParameters;
	let body = event.body ? new URLSearchParams(event.body) : null;
	let method = (''+event.httpMethod).toLowerCase();
	let auth = event.headers.Authorization;
	if (auth && (auth.toLowerCase().indexOf('bearer ')==0))
		auth = auth.substring('bearer '.length);

	console.log({method, auth});

	let fun = function() { return {}; };

	if (method=='get' && params.action == 'login-url') {
		fun = ()=>getLoginUrl(params.provider, params.callback);
	}
	else if (method=='get' && params.action == 'test-s3') {
		fun = ()=>testS3(auth);
	}
	else if (method=='post' && body.get('action')=='login-set-code') {
		fun = ()=>loginSetCode(body.get('href'), body.get('token'));
	}

	try {
		let result = await fun();
		console.log(JSON.stringify(result));
		return {
			statusCode: 200,
			body: JSON.stringify(result, null, 2),
			headers,
		};
	} catch (err) {
		console.log(err);
		console.log(err.stack.split('\n'));

		return {
			statusCode: 500,
			body: JSON.stringify({ err, src: event }, null, 2),
			headers
		};
	}
};
