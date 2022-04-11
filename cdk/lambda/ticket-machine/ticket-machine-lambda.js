
const VERSION = "01 01";
const AWS = require('aws-sdk');

const tm = require('./ticket-machine.js');
const utils = require('./utils.js');

exports.main = async (event, context) => {
	console.log(JSON.stringify({lambdaevent:event},null,2));
	utils.setupLogObj();
	let ret = {};
	
	if (event.function == 'getLoginParameters') {
		try {
			let result = await tm.getLoginParameters(event.provider, event.callback);
			ret = { statusCode: 200, body: result }
		} 
		catch (err) {
			console.log(err);
			console.log(err.stack.split('\n'));
			ret = {	statusCode: 500, body: err }
		}
	}
	if (event.function == 'login-set-code') {
		try {
			let result = await tm.loginSetCode(event.token, event.href);
			ret = { statusCode: 200, body: result }
		} 
		catch (err) {
			console.log(err);
			if (err.stack)
				console.log(err.stack.split('\n'));
			ret = {	statusCode: 500, body: err }
		}
	}
	if (event.function == 'login') {
		let code = event.code;
		let state = event.state;
		let provider = event.provider;
		let accessToken = await tm.getAccessTokenFromCode(code, state, provider);

	}
	if (event.function == 'getUserInfo') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			statusCode: 200,
			body: userinfo
		};
	}
	else if (event.function == 'getRoleCredentials') {
		var credentials = await tm.getCredentials(
			event.access_token,
			event.sessionName || 'session' + Math.random(),
			event.source || 'generic',
			event.extra
		);

		ret = {
			statusCode: 200,
			body: credentials
		};
	}
	else if (event.function == 'verifyToken') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			statusCode: 200,
			body: userinfo
		};
	}

	if (process.env.addInfoToReply)
		ret.body.info = { VERSION, event, context, env: process.env };

	if (process.env.addLogToReply)
		ret.body.log = utils.getLogMessages();

	return ret;
};
