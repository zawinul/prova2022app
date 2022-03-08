const cdk = require('aws-cdk-lib');
const { Stack, Duration } = require('aws-cdk-lib');
const s3 = require("aws-cdk-lib/aws-s3");
const iam = require("aws-cdk-lib/aws-iam");

const objlog = x=>console.log(JSON.stringify(x,null,4));

class ProvaCdkTenantsStack extends Stack {

	constructor(scope, id, props) {
		super(scope, id, props);
		
		var buckets = [];
		var tenantPolicies = [];
		var tenantRoles = [];
		var tenantRolesARN = [];
		var tenantNames = ['madrid', 'lisbona', 'lione'];

		var map = {};

		for (let tenant of tenantNames) {
			var bucketName = "test1-tenant-" + tenant;
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
			let accessPolicyName = `${tenant}-access-policy`;
			let accessPolicy = new iam.ManagedPolicy(this, accessPolicyName, {
				managedPolicyName: accessPolicyName,
				document: new iam.PolicyDocument({
					statements: [stat1, stat2]
				})
			});

			map[tenant] = {
				accessPolicy,
				bucket
			};
		}

		this.map=map;
	}
}



module.exports = { ProvaCdkTenantsStack }
