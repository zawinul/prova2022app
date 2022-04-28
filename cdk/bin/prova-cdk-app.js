

const cdk = require('aws-cdk-lib');
const ProvaCdkTenantsStack  = require('../lib/prova-cdk-tenants');
const ProvaCdkTicketMachineStack = require('../lib/prova-cdk-tm');
const ProvaCdkApiStack = require('../lib/prova-cdk-api');
const ProvaEc2MachineStack = require('../lib/prova-cdk-ec2');
const ProvaVpcStack = require('../lib/prova-cdk-vpc');
const ProvaCdkStaticwebStack = require('../lib/prova-cdk-staticweb');
const ProvaCdkCache = require('../lib/prova-cdk-cache');
const config = require('../config.js');
const app = new cdk.App();
let stacks={};

function buildApp() {
	
	config.cacheLambdaName = config.namePrefix+'-cache-handler';
	config.ticketMachineLambdaName = config.namePrefix+'-ticket-machine-handler';

	const apiProps = Object.assign({}, config, {
	});
	//console.log({ apiProps });
	stacks.api = new ProvaCdkApiStack(app, config.namePrefix+'-API', apiProps);



	const cacheProps = Object.assign({}, config);
	stacks.cache = new ProvaCdkCache(app, config.namePrefix+'-CACHE', cacheProps);
	
	const tenantProps = Object.assign({}, config);
	stacks.tenants = new ProvaCdkTenantsStack(app, config.namePrefix+'-TENANTS', tenantProps);

	const ticketMachineProps = Object.assign({}, config, {
		tenants: stacks.tenants.map,
		useCachePolicy: stacks.cache.canInvoke,
		api: stacks.api.api
	});

	stacks.ticketMachine = new ProvaCdkTicketMachineStack (
		app, 
		config.namePrefix+'-TICKET-MACHINE',
		ticketMachineProps);
	
	// ticketMachine.lambda.grantInvoke(api.lambda);

	// if (config.includeStaticWeb) {
	// 	const webProps = Object.assign({}, config, {
	// 	});
	// 	const staticweb = new ProvaCdkStaticwebStack(app, config.namePrefix+'-STATICWEB', webProps);
	// }
	
	// if (config.includeVPC) {
	// 	const vpcProps = Object.assign({}, config, {
	// 	});


	// 	const vpc = new ProvaVpcStack(app, config.namePrefix+'-VPC', vpcProps);

	// 	if (config.includeEc2) {
	// 		const ec2Props = Object.assign({}, config, {
	// 			vpcId: vpc.vpcId,
	// 			publicSubnetId: vpc.publicSubnetId,
	// 			publicSubnetZone: vpc.publicSubnetZone
	// 		});
	// 		const tomcat = new ProvaEc2MachineStack(app, config.namePrefix+'-EC2', ec2Props);
	// 	}
	// }
}
console.log('building app...');
buildApp();
console.log('building app done!');
