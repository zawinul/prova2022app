#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Test4TsStack } from '../lib/test4ts-stack';

const app = new cdk.App();
new Test4TsStack(app, 'Test4TsStack', {
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  env: { account: '071979381930', region: 'eu-south-1' },
});