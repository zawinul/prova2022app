#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { Test2JsStack } = require('../lib/test2js-stack');

const app = new cdk.App();
new Test2JsStack(app, 'Test2JsStack', {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  	env: { 
		  account: '071979381930', 
		  region: 'eu-south-1' 
		  //region: 'eu-west-3' 
	},

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
