const core = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");
const s3 = require("@aws-cdk/aws-s3");

class CreaLambda extends core.Construct {
	constructor(scope, id) {
		super(scope, id);

		// const bucket = new s3.Bucket(this, "Biblioteca"); //note that it appends everything

		// const handler = new lambda.Function(this, "Handler", {
		// 	runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in lambda-esempio.js
		// 	code: lambda.Code.fromAsset("codice-remoto"), // Note 'codice-remoto' is the folder we created
		// 	handler: "lambda-esempio.funzioneMain", //Note lambda-esempio is our filename, and funzioneMain is our function
		// 	environment: {
		// 		BUCKET: bucket.bucketName
		// 	}
		// });

		// bucket.grantReadWrite(handler); // give our lambda IAM permissions to access the lambda
	}
}

module.exports = { CreaLambda }