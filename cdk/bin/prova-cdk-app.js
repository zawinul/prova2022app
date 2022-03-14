#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
//const { ProvaCdkStack } = require('../lib/prova-cdk-stack');
const ProvaCdkTenantsStack  = require('../lib/prova-cdk-tenants');
const ProvaCdkTicketMachineStack = require('../lib/prova-cdk-tm');
const ProvaCdkApiStack = require('../lib/prova-cdk-api');
const config = require('../config.js');
const app = new cdk.App();

function buildApp() {
	const tenantProps = Object.assign({}, config);
	const tenants = new ProvaCdkTenantsStack(app, config.namePrefix+'-TENANTS', tenantProps);
	
	const tmSecret = "secret-8Y6UG45F6TC4H";
	const ticketMachineProps = Object.assign({}, config, {
		tenants: tenants.map,
		secret: tmSecret
	});

	const ticketMachine = new ProvaCdkTicketMachineStack (
		app, 
		config.namePrefix+'-TICKET-MACHINE',
		ticketMachineProps);
	
	const apiProps = Object.assign({}, config, {
		ticketMachineLambdaName: ticketMachine.lambdaName,
		ticketMachineLambdaRegion: config.env.region,
		ticketMachineLambdaSource: 'api-lambda',
		ticketMachineLambdaSecret: tmSecret
	});
	console.log({ apiProps });
	const api = new ProvaCdkApiStack(app, config.namePrefix+'-API', apiProps);

	ticketMachine.lambda.grantInvoke(api.lambda);
}

console.log('building app...');
buildApp();
console.log('building app done!');
