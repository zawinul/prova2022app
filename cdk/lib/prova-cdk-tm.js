const cdk = require('aws-cdk-lib');
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const db = require("aws-cdk-lib/aws-dynamodb");
//const AWS = require("aws-sdk");

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

		const roleName = (tenantName) => prefix+"-tm-role-" + tenantName;
		const roleArn  = tenantName=>`arn:aws:iam::${props.env.account}:role/${roleName(tenantName)}`;

		var map = props.tenants;
		const roles = [];
		for (var tenantName in map)
			roles.push(roleArn(tenantName));

	
		const lambdaFolder = lambda.Code.fromAsset("lambda/ticket-machine");
		const lambdaFile = "ticket-machine-lambda";
		const lambdaFunction = "main";
		const functionName = this.lambdaName = prefix+"-ticket-machine-handler";
		this.lambda = new lambda.Function(this, functionName, {
			functionName,
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			handler: `${lambdaFile}.${lambdaFunction}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			environment: {
				roles:JSON.stringify(roles),
				// addInfoToReply:'1',
				// addLogToReply:'1',
				cacheTableName,
				account:props.env.account,
				region:props.env.region
			}
		});

		cacheTable.grantReadWriteData(this.lambda.grantPrincipal);

		//console.log(JSON.stringify(map));
		for (var tenantName in map) {
			let  { 	accessPolicy, bucket } = map[tenantName];

			let role = new iam.Role(this, roleName(tenantName), {
				assumedBy: this.lambda.grantPrincipal,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
				roleName: roleName(tenantName),
				managedPolicies: [ accessPolicy ]	
			});
		}
	}
}



module.exports = ProvaCdkTicketMachineStack;
