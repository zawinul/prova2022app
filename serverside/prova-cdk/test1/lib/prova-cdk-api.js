const cdk = require('aws-cdk-lib');
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda  = require("aws-cdk-lib/aws-lambda");


class ProvaCdkApiStack extends cdk.Stack {

	constructor(scope, id, props) {
		super(scope, id, props);
		var prefix = props.namePrefix;
		const lambdaFolder = lambda.Code.fromAsset("lambda/api");
		const lambdaFile = "api-lambda";
		const lambdaFunction = "main";
		const functionName = prefix+"api-lambda-handler";
		const apiLambda = new lambda.Function(this, functionName, {
			functionName,
			id:functionName,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			handler: `${lambdaFile}.${lambdaFunction}`,
			environment: {
				account:props.env.account,
				region:props.env.region
			}
		});



		var apiName = prefix+'-TEST-API';
		var api = new apigateway.LambdaRestApi (this, apiName, {
			restApiName: apiName,
			id: apiName,
			proxy: true,
			handler: apiLambda,
			description: 'bla bla bla',
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			parameters: {
				aaa:'1234'
			},
			deployOptions: {
				stageName: 'prod',
			},
			// 👇 enable CORS
			defaultCorsPreflightOptions: {
				allowHeaders: [
					'Content-Type',
					'X-Amz-Date',
					'Authorization',
					'X-Api-Key',
				],
				allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
				allowCredentials: true,
				allowOrigins: ['*'],
			},
		});
	}
}


module.exports = ProvaCdkApiStack;