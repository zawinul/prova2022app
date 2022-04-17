const cdk = require('aws-cdk-lib');
const apigateway = require("aws-cdk-lib/aws-apigateway");
//const apigatewayv2 = require("aws-cdk-lib/aws-apigatewayv2");
const lambda  = require("aws-cdk-lib/aws-lambda");
//const cdk  = require("aws-cdk-lib/core");


class ProvaCdkApiStack extends cdk.Stack {

	constructor(scope, id, props) {
		super(scope, id, props);
		var prefix = props.namePrefix;
		const lambdaFolder = lambda.Code.fromAsset("lambda/api");
		const lambdaFile = "api-lambda";
		const lambdaFunction = "main";
		const functionName = prefix+"-api-lambda-handler";
		const bucketNames = props.tenants.map(x=>prefix.toLowerCase()+"-tenant-" + x);
		const environment = {
			account:props.env.account,
			region:props.env.region,
			ticketMachineLambdaName:props.ticketMachineLambdaName,
			ticketMachineLambdaRegion:props.ticketMachineLambdaRegion,
			ticketMachineLambdaSource: props.ticketMachineLambdaSource,
			ticketMachineLambdaSecret: props.ticketMachineLambdaSecret,
			buckets: JSON.stringify(bucketNames)
		};
		//console.log(JSON.stringify({environment, props}, null, 2));
		const apiLambda = new lambda.Function(this, functionName, {
			functionName,
			id:functionName,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			timeout: cdk.Duration.seconds(30),
			handler: `${lambdaFile}.${lambdaFunction}`,
			environment
		});

		let lambdaIntegration = new apigateway.LambdaIntegration(apiLambda, {
			proxy: true
		});

		var apiName = prefix+'-TEST-API';
		let api = new apigateway.RestApi(this, apiName, {
			name: apiName+'1',
			restApiName:apiName+'2',
			deploy: true,		
			defaultIntegration: lambdaIntegration,

		});

		const defz = api.root.addResource('{proxy+}');
		defz.addMethod('ANY');

		new cdk.CfnOutput(this, 'output1', {
			value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/`,
			description:'aeiou',
			exportName: 'bbbdddccc'
		});

		this.lambda = apiLambda;
	}
}


module.exports = ProvaCdkApiStack;