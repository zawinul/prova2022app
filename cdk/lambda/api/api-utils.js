const AWS = require('aws-sdk');
var lambda;

const tojson = x=>JSON.stringify(x,null,2);
function pushlogmsg(x) {
	
	if (typeof(x) != 'string') {
		logmsg.push(x);
	}
	try {
		logmsg.push(JSON.parse(x));
	}
	catch(e) {
		logmsg.push(x);
	}
} 
const logmsg = [];

function initLog() {
	if (!initLog.native)
		initLog.native = console.log;
	
	console.log = function() {
		var arr = [];
		for(var i=0; i<arguments.length; i++) {
			let x = arguments[i];
			pushlogmsg(x);
			x = typeof(x)=='object' ? tojson(x) : x;
			arr.push(x);
		}
		initLog.native.apply(console, arr);
	};
}

function getLogMessages() {
	return logmsg;
}



async function getUserInfo(event) {
}

async function getCredentials(access_token) {
	console.log({getCredentials:access_token});

	if (!lambda)
		lambda = new AWS.Lambda({ region: process.env.ticketMachineLambdaRegion });
	
	var lambdaEvent = {
		function: 'getRoleCredentials',
		access_token,
		source: process.env.ticketMachineLambdaSource,
		secret: process.env.ticketMachineLambdaSecret,
		session:'newApiLambdaSession'+Math.random()
	};
	console.log({lambdaEvent});
	var params = {
		FunctionName: process.env.ticketMachineLambdaName, 
		Payload: JSON.stringify(lambdaEvent),
	};

	var lambdaResult = await lambda.invoke(params).promise();
	var result = JSON.parse(lambdaResult.Payload);
	console.log({getRoleCredentialResult:result.body});
	var jCredentials = result.body.credentials;
	var credentials = new AWS.Credentials(
		jCredentials.AccessKeyId, 
		jCredentials.SecretAccessKey,
		jCredentials.SessionToken);
	return credentials;
}

module.exports = {
	initLog,
	getLogMessages,
	getUserInfo,
	getCredentials,
	tojson
}