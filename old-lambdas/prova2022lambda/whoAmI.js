const AWS = require('aws-sdk');

exports.handler = async (event, context) => {

	const sts = new AWS.STS({ });
	var identity = await sts.getCallerIdentity({}).promise();
	var text = JSON.stringify({identity}, null, 2);
	console.log(text);
	var origin = '*';
	if (event.headers && event.headers.origin)
		origin = event.headers.origin;

	let statusCode = '200';
	const headers = {
		"Access-Control-Allow-Origin": origin,
		// "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
		//'Access-Control-Expose-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		// 'Access-Control-Allow-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		'Access-Control-Allow-Credentials': true
	};

	
	var ret = {
		statusCode,
		body: text,
		headers
	};
	return ret;

};
