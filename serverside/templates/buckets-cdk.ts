import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

const arpd = {
	"Version": "2012-10-17",
	"Statement": [{
		"Effect": "Allow",
		"Principal": {
			"Service": "lambda.amazonaws.com"
		},
		"Action": "sts:AssumeRole"
	},
	{
		"Effect": "Allow",
		"Principal": {
			"AWS": "arn:aws:iam::071979381930:user/ticketMachineUser"
		},
		"Action": "sts:AssumeRole",
		"Condition": {}
	}
	]
};
export class MyStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const IAMRole = new iam.CfnRole(this, 'IAMRole', {
			path: "/",
			roleName: "tenant_a1_writer",
			assumeRolePolicyDocument: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/admin\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/adminWithoutMFA\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/ticketMachineUser\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}}]}",
			maxSessionDuration: 3600,
			description: "Allows Lambda functions to call AWS services on your behalf."
		});

		const S3Bucket = new s3.CfnBucket(this, 'S3Bucket', {
			bucketName: "tenant-a1"
		});

		const S3Bucket2 = new s3.CfnBucket(this, 'S3Bucket2', {
			bucketName: "tenant-a2"
		});

		const IAMPolicy = new iam.CfnPolicy(this, 'IAMPolicy', {
			policyDocument: `
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:ListAccessPoints",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::tenant-a1",
                "arn:aws:s3:::tenant-a1/*"
            ]
        }
    ]
}
`,
			roles: [
				IAMRole.ref
			],
			policyName: "custom_tenant1_policy"
		});

	}
}

const app = new cdk.App();
new MyStack(app, 'my-stack-name', { env: { region: 'eu-south-1' } });
app.synth();
