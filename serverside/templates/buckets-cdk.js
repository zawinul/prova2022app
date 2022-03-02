"use strict";
var __extends = (this && this.__extends) || (function () {
	var extendStatics = function (d, b) {
		extendStatics = Object.setPrototypeOf ||
			({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
			function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
		return extendStatics(d, b);
	};
	return function (d, b) {
		if (typeof b !== "function" && b !== null)
			throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
		extendStatics(d, b);
		function __() { this.constructor = d; }
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();

Object.defineProperty(exports, "__esModule", { value: true });
exports.MyStack = void 0;

var cdk = require("@aws-cdk/core");
var iam = require("@aws-cdk/aws-iam");
var s3 = require("@aws-cdk/aws-s3");
var arpd = {
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
var MyStack = /** @class */ (function (_super) {
	__extends(MyStack, _super);
	function MyStack(scope, id, props) {
		var _this = _super.call(this, scope, id, props) || this;
		var IAMRole = new iam.CfnRole(_this, 'IAMRole', {
			path: "/",
			roleName: "tenant_a1_writer",
			assumeRolePolicyDocument: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/admin\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/adminWithoutMFA\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}},{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::071979381930:user/ticketMachineUser\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{}}]}",
			maxSessionDuration: 3600,
			description: "Allows Lambda functions to call AWS services on your behalf."
		});
		var S3Bucket = new s3.CfnBucket(_this, 'S3Bucket', {
			bucketName: "tenant-a1"
		});
		var S3Bucket2 = new s3.CfnBucket(_this, 'S3Bucket2', {
			bucketName: "tenant-a2"
		});
		var IAMPolicy = new iam.CfnPolicy(_this, 'IAMPolicy', {
			policyDocument: "\n{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n            \"Sid\": \"VisualEditor0\",\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"s3:ListAccessPoints\",\n                \"s3:ListAllMyBuckets\"\n            ],\n            \"Resource\": \"*\"\n        },\n        {\n            \"Sid\": \"VisualEditor1\",\n            \"Effect\": \"Allow\",\n            \"Action\": \"s3:*\",\n            \"Resource\": [\n                \"arn:aws:s3:::tenant-a1\",\n                \"arn:aws:s3:::tenant-a1/*\"\n            ]\n        }\n    ]\n}\n",
			roles: [
				IAMRole.ref
			],
			policyName: "custom_tenant1_policy"
		});
		return _this;
	}
	return MyStack;
}(cdk.Stack));
exports.MyStack = MyStack;
var app = new cdk.App();
new MyStack(app, 'my-stack-name', { env: { region: 'eu-south-1' } });
app.synth();
