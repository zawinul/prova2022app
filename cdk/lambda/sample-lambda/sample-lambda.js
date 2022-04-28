
const utils = require('./api-utils');
const AWS = require('aws-sdk');

let _tmlambda;

let commands={}

commands.loginUrl = async function(event) {
	let origin = (event.headers && event.headers.origin) ? event.headers.origin : '*';
	let params = event.queryStringParameters;
	let provider = params.provider;
	let headers = getOuputHeaders(event);

	let data = await callTmLambda({
		function: 'getLoginParameters',
		provider,
		origin
	});

	return {
		statusCode: 200,
		body: JSON.stringify(data,null,2),
		headers
	};
}


commands.loginCallbackPage = async function(event) {
	let code = event.queryStringParameters.code;
	let state = event.queryStringParameters.state;
	let headers = getOuputHeaders(event);
	headers['Content-Type'] = 'text/html; charset=UTF-8';

	let data = await callTmLambda({
		function: 'getLoginCallbackPage',
		code,
		state
	});

	var page = data.body;
	console.log('page: ' + page);
	return {
		statusCode: 200,
		body: page,
		headers
	};
}


commands.testS3 = async function(event) {
	let auth = getAuth(event);
	console.log('auth='+auth);
	let headers = getOuputHeaders(event);

	let credentials = await utils.getCredentials(auth,{});
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
	return {
		statusCode: 200,
		body: JSON.stringify(log,null,2),
		headers
	};
}

exports.main = async (event, context) => {
	logevent(event);
	let params = event.queryStringParameters;
	let method = (''+event.httpMethod).toLowerCase();
	let command;
	if (method=='get' && event.path == '/login-cb-page') 
		command = 'loginCallbackPage';
	else if (method=='get' && params.action == 'login-url') 
		command = 'loginUrl';
	else if (method=='get' && params.action == 'test-s3') 
		command = 'testS3';
 
	console.log('command='+command);
	if (!command)
		return { statusCode: 500, body: 'unknown command', headers:getOuputHeaders(event) };

	try {
		let out = commands[command](event);
		return out;
	}
	catch(e) {
		console.log(e);
		if (e.stack)
			console.log(e.stack.split('\n'));
		return { statusCode: 500, body: e, headers:getOuputHeaders(event) };
	}
};

async function callTmLambda(cmd) {
	if (!_tmlambda)
		_tmlambda = new AWS.Lambda({ region: process.env.ticketMachineLambdaRegion });

	var params = {
		// DA CAMBIARE!!!
		FunctionName: process.env.ticketMachineLambdaName,
		Payload: JSON.stringify(cmd),
	};
	var lambdaResult = await _tmlambda.invoke(params).promise();
	var data = lambdaResult.Payload;
	try {
		data = JSON.parse(lambdaResult.Payload);
	}catch(e) {}
	
	console.log('lambdaResult: ' + JSON.stringify(lambdaResult));
	return data
}

function getOuputHeaders(event) {
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
	return headers;
}

function getAuth(event) {
	let auth = event.headers.Authorization;
	if (auth && (auth.toLowerCase().indexOf('bearer ')==0))
		auth = auth.substring('bearer '.length);
	return auth;
}

function logevent(event) {
	let clone = JSON.parse(JSON.stringify(event));
	delete clone.multiValueHeaders;
	delete clone.requestContext;
	delete clone.multiValueQueryStringParameters;
	// remove something
	console.log(JSON.stringify(clone,null,2));
}
