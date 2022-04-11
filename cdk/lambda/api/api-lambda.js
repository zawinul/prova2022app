
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

async function testS3(credentials) {
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
			console.log(`put ${name} on ${Bucket} SUCCESS`);

		} catch (e) {
			console.log(`put ${name} on ${Bucket} FAIL: ${e}`);
		}
	}

	return "ok";
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
		console.log('Access-Control-Allow-Origin = '+event.headers.origin)
	}
	let params = event.queryStringParameters;
	let body = event.body ? new URLSearchParams(event.body) : null;
	let method = (''+event.httpMethod).toLowerCase();
	console.log({method});

	if (method=='get' && params.action == 'login-url') {
		try {
			let result = await getLoginUrl(params.provider, params.callback);
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
	}
	else if (method=='post' && body.get('action')=='login-set-code') {
		try {
			let result = await loginSetCode(body.get('href'), body.get('token'));
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

	}

	// da qui in giu' è solo un esempio
	utils.initLog();

	let statusCode = '200';

	try {
		var credentials = null;
		const auth = event.headers.Authorization;
		if (auth) {
			if (auth.trim().toLowerCase().indexOf('Bearer ') == 0)
				auth = auth.substring(7).trim();
			credentials = await utils.getCredentials();
			await testS3(credentials);
		}
	} catch (e) {
		console.log(e);
		console.log(e.stack.split('\n'));
	}
	const log = utils.getLogMessages();

	var ret = {
		statusCode,
		body: JSON.stringify({ event, env: process.env, credentials, log }, null, 2),
		headers
	};
	return ret;

};
