

const cdk = require('aws-cdk-lib');
const ProvaCdkTenantsStack  = require('../lib/prova-cdk-tenants');
const ProvaCdkTicketMachineStack = require('../lib/prova-cdk-tm');
const ProvaCdkApiStack = require('../lib/prova-cdk-api');
const ProvaEc2MachineStack = require('../lib/prova-cdk-ec2');
const ProvaVpcStack = require('../lib/prova-cdk-vpc');

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
	//console.log({ apiProps });
	const api = new ProvaCdkApiStack(app, config.namePrefix+'-API', apiProps);

	ticketMachine.lambda.grantInvoke(api.lambda);

	const vpcProps = Object.assign({}, config, {
	});
	const vpc = new ProvaVpcStack(app, config.namePrefix+'-VPC', vpcProps);

	const ec2Props = Object.assign({}, config, {
		vpcId: vpc.vpcId,
		publicSubnetId: vpc.publicSubnetId,
		publicSubnetZone: vpc.publicSubnetZone
	});
	const tomcat = new ProvaEc2MachineStack(app, config.namePrefix+'-EC2', ec2Props);

}

console.log('building app...');
buildApp();
console.log('building app done!');
