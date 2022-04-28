
const VERSION = "01 01";
//const AWS = require('aws-sdk');

const tm = require('./ticket-machine.js');
//const utils = require('./utils.js');

let actions = {}

actions.getLoginParameters = async function (event) {
	let result = await tm.getLoginParameters(event.provider, event.origin);
	return { statusCode: 200, body: result };
}

actions.delayExpiration = async function (event) {
	let result = await tm.sessionRefresh(event.sessionId, event.timestamp);
	return { statusCode: 200, body: result };
}

actions.sessionSet = async function (event) {
	let result = await tm.sessionSet(event.sessionId, event.key, event.value);
	return { statusCode: 200, body: result };
}


actions.logout = async function (event) {
	let result = await tm.logout(event.sessionId);
	return { statusCode: 200, body: result };
}


actions.sessionSet = async function (event) {
	let result = await tm.sessionSet(event.sessionId, event.key, event.value);
	return { statusCode: 200, body: result };
}

actions.sessionGet = async function (event) {
	let result = await tm.sessionGet(event.sessionId, event.key);
	return { statusCode: 200, body: result };
}

actions.getRoleCredentials = async function (event) {
	var credentials = await tm.getCredentials(
		event.localToken,
		event.session || 'session' + Math.random(),
		event.extraInfo
	);
	return { statusCode: 200, body: credentials };
}

actions.loginCallbackPage = async function (event) {
	let html = await tm.getLoginCallbackPage(
		event.code,
		event.state
	);
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html; charset=UTF-8'
		},
		body: html
	};
}

function logevent(event) {
	event = JSON.parse(JSON.stringify(event));
	delete event.headers;
	delete event.multiValueHeaders;
	delete event.multiValueQueryStringParameters;
	delete event.requestContext;
	console.log(JSON.stringify({ tmLambdaEvent: event }, null, 2));

}
exports.main = async (event, context) => {
	logevent(event);
	let fromweb = false, data = event;

	if (event.httpMethod) {
		fromweb = true;
		if (event.body)
			data = JSON.parse(event.body);
		else
			data = event.queryStringParameters;
	}

	// special case: login and logout http services
	if (event.httpMethod) {
		let method = event.httpMethod.toUpperCase();
		if (method == 'GET' && event.path.indexOf('login-cb-page') >= 0)
			data.function = 'loginCallbackPage';

		if (method == 'GET' && event.path.indexOf('logout') >= 0)
			data.function = 'logout';

		if (method == 'GET' && event.path.indexOf('login-parameters') >= 0)
			data.function = 'getLoginParameters';

		// let html = await tm.getLoginCallbackPage(
		// 	event.queryStringParameters.code, 
		// 	event.queryStringParameters.state
		// );
		// return { statusCode: 200, 
		// 	headers:{
		// 		'Content-Type': 'text/html; charset=UTF-8'
		// 	}, 
		// 	body: html };
	}

	let ret;
	if (data.function && actions[data.function])
		ret = await actions[data.function](data);
	else
		ret = {
			statusCode: 200,
			body: JSON.stringify({ msg: 'nothing to do', data }, null, 2),
		};

	if (fromweb) {
		if (ret.body && typeof (ret.body) == 'object')
			ret.body = JSON.stringify(ret.body);
		if (!ret.headers)
			ret.headers = {};
		Object.assign(ret.headers, {
			'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
			'Access-Control-Allow-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Origin': '*'
		});
		if (event.headers && event.headers.origin) {
			ret.headers["Access-Control-Allow-Origin"] = event.headers.origin;
		}
	}

	console.log(JSON.stringify({ tmReturned: ret }, null, 2));
	return ret;
};
