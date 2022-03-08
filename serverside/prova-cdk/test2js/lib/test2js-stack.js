const { Stack, Duration } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');
const s3 = require('aws-cdk-lib/aws-s3');
const iam = require('aws-cdk-lib/aws-iam');

class Test2JsStack extends Stack {
	/**
	 *
	 * @param {Construct} scope
	 * @param {string} id
	 * @param {StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);

		// The code that defines your stack goes here

		// example resource
		new sqs.Queue(this, 'Test2JsQueue2', {
			visibilityTimeout: Duration.seconds(300),
			queueName: 'test2JsStackParis'
		});

		const bucket1 = new s3.Bucket(this, "tenant-a1-on-cdk", {
			bucketName: "tenant-a1"
		});
		const bucket2 = new s3.Bucket(this, "tenant_a2_on_cdk", {
			bucketName: "tenant-a2"
		});

		// const accessTenantA1 = new iam.Policy(this, "accessTenantA1", {
		// 	policyName: 'access_tenant_a1'
		// });

		const lambdaRole = new iam.Role(this, 'Role123', {
			assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
			description: 'Example role...',
			roleName:'tenant_a1_writer',
			DeletionPolicy: "Retain"

		  });
	}
}

module.exports = { Test2JsStack }
