"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test4TsStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const sqs = require("aws-cdk-lib/aws-sqs");
const s3 = require("aws-cdk-lib/aws-s3");
const iam = require("aws-cdk-lib/aws-iam");
const ssm = require("aws-cdk-lib/aws-ssm");

class Test4TsStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
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
        var tenant = 'tokio';
        var bucketName = "test4-tenant-" + tenant;
        var bucket = new s3.Bucket(this, bucketName, {
            bucketName: bucketName
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
        new iam.ManagedPolicy(this, "policy", {
            managedPolicyName: 'test4-tenant-policy',
            document: new iam.PolicyDocument({
                statements: [stat1, stat2]
            })
        });

		new ssm.StringParameter(this, 'ticket-machine-user-id', {
			parameterName: 'ticket-machine-user-id'
		});

		
		new ssm.StringParameter(this, 'ticket-machine-user-id', {
			parameterName: 'ticket-machine-user-id'
		});

    }
}
exports.Test4TsStack = Test4TsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdDR0cy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3Q0dHMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDZDQUFnRDtBQUVoRCwyQ0FBMkM7QUFDM0MseUNBQXlDO0FBQ3pDLDJDQUEyQztBQUMzQyxpREFBNkM7QUFFN0MsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFDdEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMzRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw2Q0FBNkM7UUFFN0MsbUJBQW1CO1FBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2pELGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUM1QyxTQUFTLEVBQUUsWUFBWTtTQUN2QixDQUFDLENBQUM7UUFHSCxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUMxQyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUM7WUFDeEQsUUFBUSxFQUFFLGNBQWM7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxNQUFNLEdBQUMsT0FBTyxDQUFDO1FBQ25CLElBQUksVUFBVSxHQUFHLGVBQWUsR0FBQyxNQUFNLENBQUM7UUFFeEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDNUMsVUFBVSxFQUFFLFVBQVU7U0FDdEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ25DLE9BQU8sRUFBRTtnQkFDUixxQkFBcUI7Z0JBQ3JCLHFCQUFxQjthQUNyQjtZQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNoQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1NBQ3BCLENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNuQyxPQUFPLEVBQUU7Z0JBQ1IsTUFBTTthQUNOO1lBQ0QsU0FBUyxFQUFFO2dCQUNWLGdCQUFnQixVQUFVLEVBQUU7Z0JBQzVCLGdCQUFnQixVQUFVLElBQUk7YUFDOUI7WUFDRCxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1NBQ3BCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBRXJDLGlCQUFpQixFQUFDLHFCQUFxQjtZQUN2QyxRQUFRLEVBQUcsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDO2dCQUNqQyxVQUFVLEVBQUUsQ0FBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO2FBQzNCLENBQUM7U0FDRixDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0Q7QUFyREQsb0NBcURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgRWZmZWN0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5cbmV4cG9ydCBjbGFzcyBUZXN0NFRzU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG5cdGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhY2tQcm9wcykge1xuXHRcdHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG5cdFx0Ly8gVGhlIGNvZGUgdGhhdCBkZWZpbmVzIHlvdXIgc3RhY2sgZ29lcyBoZXJlXG5cblx0XHQvLyBleGFtcGxlIHJlc291cmNlXG5cdFx0Y29uc3QgcXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsICdUZXN0NFRzUXVldWUnLCB7XG5cdFx0XHR2aXNpYmlsaXR5VGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzAwKSxcblx0XHRcdHF1ZXVlTmFtZTogJ3BpcHBvcXVldWUnXG5cdFx0fSk7XG5cblx0XHRcblx0XHRjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIFwiYmxhIGJsYVwiLCB7XG5cdFx0XHRhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnc25zLmFtYXpvbmF3cy5jb20nKSxcblx0XHRcdHJvbGVOYW1lOiBcInBpcHBvVGVzdDRUU1wiXG5cdFx0fSk7XG5cblx0XHR2YXIgdGVuYW50PSd0b2tpbyc7XG5cdFx0dmFyIGJ1Y2tldE5hbWUgPSBcInRlc3Q0LXRlbmFudC1cIit0ZW5hbnQ7XG5cblx0XHR2YXIgYnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBidWNrZXROYW1lLCB7XG5cdFx0XHRidWNrZXROYW1lOiBidWNrZXROYW1lXG5cdFx0fSk7XG5cblx0XHRsZXQgc3RhdDEgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG5cdFx0XHRhY3Rpb25zOiBbXG5cdFx0XHRcdFwiczM6TGlzdEFjY2Vzc1BvaW50c1wiLFxuXHRcdFx0XHRcInMzOkxpc3RBbGxNeUJ1Y2tldHNcIlxuXHRcdFx0XSxcblx0XHRcdHJlc291cmNlczogW1wiKlwiXSxcblx0XHRcdGVmZmVjdDogRWZmZWN0LkFMTE9XXG5cdFx0fSk7XG5cblx0XHRsZXQgc3RhdDIgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG5cdFx0XHRhY3Rpb25zOiBbXG5cdFx0XHRcdFwiczM6KlwiXG5cdFx0XHRdLFxuXHRcdFx0cmVzb3VyY2VzOiBbXG5cdFx0XHRcdGBhcm46YXdzOnMzOjo6JHtidWNrZXROYW1lfWAsXG5cdFx0XHRcdGBhcm46YXdzOnMzOjo6JHtidWNrZXROYW1lfS8qYFxuXHRcdFx0XSxcblx0XHRcdGVmZmVjdDogRWZmZWN0LkFMTE9XXG5cdFx0fSk7XG5cblx0XHRuZXcgaWFtLk1hbmFnZWRQb2xpY3kodGhpcywgXCJwb2xpY3lcIiwge1xuXHRcdFx0XG5cdFx0XHRtYW5hZ2VkUG9saWN5TmFtZTondGVzdDQtdGVuYW50LXBvbGljeScsXG5cdFx0XHRkb2N1bWVudDogIG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuXHRcdFx0XHRzdGF0ZW1lbnRzOiBbIHN0YXQxLCBzdGF0Ml1cblx0XHRcdH0pXG5cdFx0fSlcblx0fVxufVxuIl19