
const VERSION = "01 01";
const AWS = require('aws-sdk');

const tm = require('./ticket-machine.js');
const utils = require('./utils.js');

exports.main = async (event, context) => {
	utils.setupLogObj();
	let ret = {};
	if (event.function=='getUserInfo') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			statusCode: 200,
			body: userinfo
		};
	}
	else if (event.function=='getRoleCredentials') {
		var credentials = await tm.getCredentials(
			event.access_token, 
			event.sessionName || 'session'+Math.random(),
			event.source || 'generic',
			event.extra
		);

		ret = {
			statusCode: 200,
			body: credentials
		};
	}
	else if (event.function=='verifyToken') {
		var userinfo = await tm.getUserInfo(event.access_token);
		ret = {
			statusCode: 200,
			body: userinfo
		};
	}

	if (process.env.addInfoToReply)
		ret.body.info = {VERSION, event, context, env:process.env}; 

	if (process.env.addLogToReply)
		ret.body.log = utils.getLogMessages();

	return ret;
};
