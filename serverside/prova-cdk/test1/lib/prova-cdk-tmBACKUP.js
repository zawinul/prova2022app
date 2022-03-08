const { Stack, Duration } = require('aws-cdk-lib');
const iam = require("aws-cdk-lib/aws-iam");
const ssm = require("aws-cdk-lib/aws-ssm");
const lambda = require("aws-cdk-lib/aws-lambda");
//const AWS = require("aws-sdk");

class ProvaCdkTicketMachineStack extends Stack {

	constructor(scope, id, props) {

		super(scope, id, props);

		const parameterArn=parName=>`arn:aws:ssm:${props.env.region}:${props.env.account}:parameter/${parName}`; 

		this.roles = {}

		var tmUser = "test1-tm-user";
		var user = new iam.User(this, tmUser, {
			userName: tmUser
		});

		var map = props.tenants;
		console.log(JSON.stringify(map));
		for (var tenantName in map) {
			let tenant = map[tenantName];
			const role = new iam.Role(this, "bla bla", {
				assumedBy: user,
				roleName: "tm-role-" + tenantName
			});

			this.roles[tenantName] = role;
		}

		let tmUserIdParamName = 'ticket-machine-user-id';
		this.tmUserIdParam = new ssm.StringParameter(this, tmUserIdParamName, {
			parameterName: tmUserIdParamName,
			description: "userid dell'utente che assume i ruoli dei tenants",
			stringValue: 'to be replaced'
		});

		let tmUserSecretParamName = 'ticket-machine-user-secret';
		this.tmUserSecretParam = new ssm.StringParameter(this, tmUserSecretParamName, {
			parameterName: tmUserSecretParamName,
			description: "user secret dell'utente che assume i ruoli dei tenants",
			stringValue: 'to be replaced'
		});

		console.log([
			parameterArn(tmUserIdParamName),
			parameterArn(tmUserSecretParamName)
		]);
		

		let stat1 = new iam.PolicyStatement({
			actions: [
				"ssm:GetParameter",
				"ssm:GetParameters"
			],
			resources: [
				parameterArn(tmUserIdParamName),
				parameterArn(tmUserSecretParamName)
			],
			effect: iam.Effect.ALLOW
		});

		let policyName = `read-tmusr-cred-policy`;
		this.readTMUserCredentialsPolicy = new iam.ManagedPolicy(this, policyName, {
			//managedPolicyName: policyName,
			description: 'policy necessaria alla lambda ticket machine',
			document: new iam.PolicyDocument({
				statements: [stat1]
			})
		});

		
		const lambdaFolder = lambda.Code.fromAsset("lambda-resources");
		const lambdaFile = "ticket-machine-lambda";
		const lambdaFunction = "main";

		this.lambda = new lambda.Function(this, "TicketMachineHandler", {
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			handler: `${lambdaFile}.${lambdaFunction}`,
			//role:
			//grantPrincipal:user,
			environment: {
				userIdParam: parameterArn(tmUserIdParamName),
				userSecretParam: parameterArn(tmUserSecretParamName)
			}
		});
		
		const role = new iam.Role(this, "bla bla", {
			assumedBy: this.lambda.grantPrincipal,
			roleName: 'tm-lambda-role'
		});

		//this.lambda.grantPrincipal = user;

	}
}



module.exports = { ProvaCdkTicketMachineStack }
