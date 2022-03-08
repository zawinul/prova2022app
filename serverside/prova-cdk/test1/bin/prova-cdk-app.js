#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
//const { ProvaCdkStack } = require('../lib/prova-cdk-stack');
const { ProvaCdkTenantsStack } = require('../lib/prova-cdk-tenants');
const { ProvaCdkTicketMachineStack } = require('../lib/prova-cdk-tm');

const app = new cdk.App();

const tenants = new ProvaCdkTenantsStack(app, 'T1-TENANTS', {
  	env: { account: '071979381930', region: 'eu-south-1' }
});

const ticketMachine = new ProvaCdkTicketMachineStack (app, 'T1-TICKET-MACHINE', {
	env: { account: '071979381930', region: 'eu-south-1',  },
	bbb:222,
	tenants: tenants.map
	
});