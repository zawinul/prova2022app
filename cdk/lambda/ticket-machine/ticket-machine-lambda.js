
const VERSION = "01 01";
//const AWS = require('aws-sdk');

const tm = require('./ticket-machine.js');
//const utils = require('./utils.js');

let actions = {}

actions.getLoginParameters = async function(event) {
	let result = await tm.getLoginParameters(event.provider, event.origin);
	return { statusCode: 200, body: result };
}

actions.getLoginCallbackPage = async function(event) {
	let result = await tm.getLoginCallbackPage(event.code, event.state);
	return { statusCode: 200, body: result };
}

actions.delayExpiration = async function(event) {
	let result = await tm.sessionRefresh(event.sessionId, event.timestamp);
	return { statusCode: 200, body: result };
}

actions.sessionSet = async function(event) {
	let result = await tm.sessionSet(event.sessionId, event.key, event.value);
	return { statusCode: 200, body: result };
}

actions.sessionGet = async function(event) {
	let result = await tm.sessionGet(event.sessionId, event.key);
	return { statusCode: 200, body: result };
}

actions.getRoleCredentials = async function(event) {
	var credentials = await tm.getCredentials(
		event.localToken,
		event.session || 'session' + Math.random(),
		event.extraInfo
	);
	return { statusCode: 200, body: credentials};
}


exports.main = async (event, context) => {
	console.log(JSON.stringify({lambdaevent:event},null,2));
	try {
		let ret = actions[event.function](event);
		return ret;
	}
	catch(err) {
		console.log(err);
		if (err.stack)
			console.log(err.stack.split('\n'));
		return { statusCode: 500, body: err };
	}
};
