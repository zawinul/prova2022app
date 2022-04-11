const cdk = require('aws-cdk-lib');
const s3 = require("aws-cdk-lib/aws-s3");
const s3Deployment = require('aws-cdk-lib/aws-s3-deployment');
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
class ProvaCdkStaticwebStack extends cdk.Stack {

	constructor(scope, id, props) {
		super(scope, id, props);
		var prefix = props.namePrefix;

		const myBucket = new s3.Bucket(this, prefix + "-static-website", {
			publicReadAccess: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			websiteIndexDocument: "index.html",
			bucketName: prefix.toLowerCase() + '-staticweb'
		});


		const deployment = new s3Deployment.BucketDeployment(this, prefix + "-deploy-web", {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			sources: [s3Deployment.Source.asset("../web")],
			destinationBucket: myBucket,
			retainOnDelete: false
		});

		const distribution = new cloudfront.Distribution(this, prefix + "-web-distribution", {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			defaultBehavior: {
				origin: new origins.S3Origin(myBucket)
			}
		});

		
		new cdk.CfnOutput(this, 'static-web-url', {
			value: myBucket.bucketWebsiteUrl,
			exportName: 'static-web-url'
		});

		new cdk.CfnOutput(this, 'distributionURL', {
			value: `https://${distribution.domainName}`,
			exportName: 'distributionURL'
		});

		new cdk.CfnOutput(this, 'distributionID', {
			value: distribution.distributionId,
			exportName: 'distributionId'
		});



	}
}



module.exports = ProvaCdkStaticwebStack; 
