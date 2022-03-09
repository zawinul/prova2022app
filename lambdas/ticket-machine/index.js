var tm = require('./ticket-machine.js');
var utils = require('./utils.js');

const VERSION = "01 01";
const region = 'eu-south-1';



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
