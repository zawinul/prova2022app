const cdk = require('aws-cdk-lib');
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const db = require("aws-cdk-lib/aws-dynamodb");
//const cdk  = require("aws-cdk-lib/core");

class ProvaCdkTicketMachineStack extends cdk.Stack {

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
		const functionName = this.lambdaName = prefix+"-cache-handler";
		
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

	}
}



module.exports = ProvaCdkTicketMachineStack;
