import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Effect } from 'aws-cdk-lib/aws-iam';

export class Test4TsStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here

		// example resource
		const queue = new sqs.Queue(this, 'Test4TsQueue', {
			visibilityTimeout: cdk.Duration.seconds(300),
			queueName: 'pippoqueue'
		});

		
		const role = new iam.Role(this, "bla bla", {
			assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
			roleName: "pippoTest4TS"
		});

		var tenant='tokio';
		var bucketName = "test4-tenant-"+tenant;

		var bucket = new s3.Bucket(this, bucketName, {
			bucketName: bucketName
		});

		let stat1 = new iam.PolicyStatement({
			actions: [
				"s3:ListAccessPoints",
				"s3:ListAllMyBuckets"
			],
			resources: ["*"],
			effect: Effect.ALLOW
		});

		let stat2 = new iam.PolicyStatement({
			actions: [
				"s3:*"
			],
			resources: [
				`arn:aws:s3:::${bucketName}`,
				`arn:aws:s3:::${bucketName}/*`
			],
			effect: Effect.ALLOW
		});

		new iam.ManagedPolicy(this, "policy", {
			
			managedPolicyName:'test4-tenant-policy',
			document:  new iam.PolicyDocument({
				statements: [ stat1, stat2]
			})
		})

		ssm.StringParameterProps;

		let tmUserIdParam = new ssm.StringParameter(this, 'ticket-machine-user-id', {
			parameterName: 'ticket-machine-user-id'
		});

	}
}
