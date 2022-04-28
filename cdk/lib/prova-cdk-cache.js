const cdk = require('aws-cdk-lib');
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const db = require("aws-cdk-lib/aws-dynamodb");
//const cdk  = require("aws-cdk-lib/core");

class ProvaCdkCacheStack extends cdk.Stack {

	constructor(scope, id, props) {
		//console.log(JSON.stringify({props},null,2))
		var prefix = props.namePrefix;

		super(scope, id, props);
		const cacheTableName = prefix+'-TMCACHE';
		const cacheTable = new db.Table(this, cacheTableName, {
			partitionKey: { name: 'key', type: db.AttributeType.STRING },
			tableName: cacheTableName,
			removalPolicy: cdk.RemovalPolicy.DESTROY
		});

	
		const lambdaFolder = lambda.Code.fromAsset("lambda/cache");
		const lambdaFile = "cache-lambda";
		const lambdaFunction = "main";
		const functionName = props.cacheLambdaName;
		
		this.lambda = new lambda.Function(this, functionName, {
			functionName,
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			handler: `${lambdaFile}.${lambdaFunction}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			timeout: cdk.Duration.seconds(30),
			environment: {
				cacheTableName,
				account:props.env.account,
				region:props.env.region
			}
		});

		cacheTable.grantReadWriteData(this.lambda.grantPrincipal);

		let arn = this.lambda.resourceArnsForGrantInvoke;
		let policyName = prefix+"-invoke-cache-policy";

		this.canInvoke = new iam.ManagedPolicy(this, policyName, {
			managedPolicyName: policyName,
			policyName,
			statements:[
				new iam.PolicyStatement({ 
					hasPrincipal: false,
					hasResource:true,
					actions: ['lambda:InvokeFunction'],
					resources: [arn]
				})
			],
			effect: iam.Effect.ALLOW,
			//user:new iam.ServicePrincipal('lambda.amazonaws.com')
		});


	}
}



module.exports = ProvaCdkCacheStack;
