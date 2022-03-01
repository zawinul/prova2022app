const AWS = require('aws-sdk');
var lambda;

const tojson = x=>JSON.stringify(x,null,2);
function setupCustomLogger(logdumper) {
	var l = console.log;
	console.log = function() {
		var arr = [];
		for(var i=0; i<arguments.length; i++) {
			let x = arguments[i];
			if (logdumper)
				logdumper(x);
			arr.push(typeof(x)=='object' ? tojson(x) : x);
		}
		l.apply(console, arr);
	};
}




async function getUserInfo(event) {
}

async function getCredentials(access_token) {
	console.log({getCredentials:access_token});

	if (!lambda)
		lambda = new AWS.Lambda({ region: 'eu-south-1' });
	
	var lambdaEvent = {
		function: 'getRoleCredentials',
		access_token,
		source:'lambda2022',
		session:'l2022session'+Math.random()
	};
	console.log({lambdaEvent});
	var params = {
		FunctionName: 'ticket-machine', 
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
	setupCustomLogger,
	getUserInfo,
	getCredentials,
	tojson
}