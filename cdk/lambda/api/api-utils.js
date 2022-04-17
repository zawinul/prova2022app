const AWS = require('aws-sdk');
var lambda;

const tojson = x=>JSON.stringify(x,null,2);


async function getCredentials(localToken, extraInfo) {
	console.log({getCredentials:localToken});

	if (!lambda)
		lambda = new AWS.Lambda({ region: process.env.ticketMachineLambdaRegion });
	
	var lambdaEvent = {
		function: 'getRoleCredentials',
		localToken,
		session:'newApiLambdaSession'+Math.random(),
		extraInfo
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
	getCredentials,
	tojson
}