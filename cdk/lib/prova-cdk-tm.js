const cdk = require('aws-cdk-lib');
const iam = require("aws-cdk-lib/aws-iam");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");

//const cdk  = require("aws-cdk-lib/core");

class ProvaCdkTicketMachineStack extends cdk.Stack {

	constructor(scope, id, props) {
		var prefix = props.namePrefix;

		super(scope, id, props);

		const roleName = (tenantName) => prefix + "-tm-role-" + tenantName;
		const roleArn = tenantName => `arn:aws:iam::${props.env.account}:role/${roleName(tenantName)}`;

		var map = props.tenants;


		const lambdaFolder = lambda.Code.fromAsset("lambda/ticket-machine");
		const lambdaFile = "ticket-machine-lambda";
		const lambdaFunction = "main";
		const functionName = props.ticketMachineLambdaName;
		let importedApiURL = '';
		importedApiURL = cdk.Fn.importValue('mainApiURL').toString();

		this.lambda = new lambda.Function(this, functionName, {
			functionName,
			runtime: lambda.Runtime.NODEJS_14_X, // So we can use async
			code: lambdaFolder,
			handler: `${lambdaFile}.${lambdaFunction}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			timeout: cdk.Duration.seconds(30),
			environment: {
				apiURL: importedApiURL.toString(),
				cacheLambdaName: props.cacheLambdaName,
				cacheLambdaRegion: props.env.region,
				account: props.env.account,
				region: props.env.region
			}
		});
		let lambdaRole = this.lambda.role;
		lambdaRole.addManagedPolicy(props.useCachePolicy);
		//....
		//lambdaRole.addManagedPolicy()
		//cacheTable.grantReadWriteData(this.lambda.grantPrincipal);

		//console.log(JSON.stringify(map));
		for (var tenantName in map) {
			let { accessPolicy, bucket, role } = map[tenantName];
			let arpolicy = role.assumeRolePolicy;
			const myCustomPolicy = new iam.PolicyDocument({
				statements: [new iam.PolicyStatement({
					actions: ['sts:AssumeRole'],
					principals: [this.lambda.grantPrincipal],
				})]
			});
			role.assumeRolePolicy = role.myCustomPolicy;
			// let role = new iam.Role(this, roleName(tenantName), {
			// 	assumedBy: this.lambda.grantPrincipal,
			// 	removalPolicy: cdk.RemovalPolicy.DESTROY,
			// 	roleName: roleName(tenantName),
			// 	managedPolicies: [ accessPolicy ]	
			// });


		}

		let lambdaIntegration = new apigateway.LambdaIntegration(this.lambda, {
			//proxy: true
		});

		// const res1 = props.api.root.addResource('tm');
		// res1.addMethod('ANY', lambdaIntegration);

		const res2 = props.api.root.addResource('login-cb-page');
		res2.addMethod('GET', lambdaIntegration);
		const res3 = props.api.root.addResource('logout');
		res3.addMethod('GET', lambdaIntegration);
		const res4 = props.api.root.addResource('login-parameters');
		res4.addMethod('GET', lambdaIntegration);



	}
}



module.exports = ProvaCdkTicketMachineStack;
