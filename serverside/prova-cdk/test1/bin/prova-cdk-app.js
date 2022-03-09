#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
//const { ProvaCdkStack } = require('../lib/prova-cdk-stack');
const ProvaCdkTenantsStack  = require('../lib/prova-cdk-tenants');
const ProvaCdkTicketMachineStack = require('../lib/prova-cdk-tm');
const ProvaCdkApiStack = require('../lib/prova-cdk-api');
const config = require('../config.js');
const app = new cdk.App();


const tenants = new ProvaCdkTenantsStack(app, config.namePrefix+'-TENANTS', config);
config.tenants = tenants.map;

const ticketMachine = new ProvaCdkTicketMachineStack (app, config.namePrefix+'-TICKET-MACHINE',config);

const api = new ProvaCdkApiStack(app, config.namePrefix+'-API',config);