const cdk = require('aws-cdk-lib');
const s3 = require("aws-cdk-lib/aws-s3");
const iam = require("aws-cdk-lib/aws-iam");

class ProvaCdkTenantsStack extends cdk.Stack {

	constructor(scope, id, props) {
		super(scope, id, props);
		var prefix = props.namePrefix;
		var tenantNames = props.tenants;

		const policyArn = policyName=>`arn:aws:iam::${props.env.account}:policy/${policyName}`;

		var map = {};

		
		for (let tenant of tenantNames) {
			var bucketName = prefix.toLowerCase()+"-tenant-" + tenant;
			let bucket = new s3.Bucket(this, bucketName, {
				bucketName: bucketName,
				removalPolicy: cdk.RemovalPolicy.DESTROY
			});

			let stat1 = new iam.PolicyStatement({
				actions: [
					"s3:ListAccessPoints",
					"s3:ListAllMyBuckets"
				],
				resources: ["*"],
				effect: iam.Effect.ALLOW
			});
			let stat2 = new iam.PolicyStatement({
				actions: [
					"s3:*"
				],
				resources: [
					`arn:aws:s3:::${bucketName}`,
					`arn:aws:s3:::${bucketName}/*`
				],
				effect: iam.Effect.ALLOW
			});
			let accessPolicyName = `${prefix}-${tenant}-access-policy`;
			let accessPolicy = new iam.ManagedPolicy(this, accessPolicyName, {
				managedPolicyName: accessPolicyName,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
				document: new iam.PolicyDocument({
					statements: [stat1, stat2]
				})
			});

			const roleName = (tenantName) => prefix+"-tm-role-" + tenantName;
			//const roleArn  = tenantName=>`arn:aws:iam::${props.env.account}:role/${roleName(tenantName)}`;
			let role = new iam.Role(this, roleName(tenant), {
				assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
				removalPolicy: cdk.RemovalPolicy.DESTROY,
				roleName: roleName(tenant),
				managedPolicies: [ accessPolicy ]	
			});
	
			map[tenant] = {
				accessPolicy,
				bucket,
				role
			};
		}

		this.map=map;
	}
}



module.exports = ProvaCdkTenantsStack; 
