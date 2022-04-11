const AWS = require("aws-sdk");
var cloudfront = new AWS.CloudFront();
var cdkOutputs = require('./cdk-outputs.json');

async function main() {
	let DistributionId = cdkOutputs["T9312-STATICWEB"].distributionID;

	var params = {
		DistributionId,
		InvalidationBatch: {
			CallerReference: new Date().getTime() + '',
			Paths: {
				Quantity: '1',
				Items: [
					"/*"
				]
			}
		}
	};
	let result = await cloudfront.createInvalidation(params).promise();
	return JSON.stringify(result, null,2);
}




main().then(console.log, console.log);