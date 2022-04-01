

const cdk = require('aws-cdk-lib');
const ec2 = require("aws-cdk-lib/aws-ec2");

class ProvaVpcStack extends cdk.Stack {

	constructor(scope, id, props) {
		// props.env = { // esempio di come "dirottare questo stack su un altra regione
		// 	account: '071979381930',
		// 	region:'eu-west-3'
		// };


		super(scope, id, props);
		var prefix = props.namePrefix;
		function tagname(name) {
			return { key: "Name", value: prefix+"-"+name};
		}
		
		const vpc = new ec2.CfnVPC(this, prefix+'-web-vpc', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			cidrBlock: "192.168.0.0/16",
			enableDnsSupport: true,
			enableDnsHostnames: false,
			instanceTenancy: "default",
			vpcName: prefix+'-web-vpc-name',
		
			tags: [ tagname("prova-2022-web-2")	]
		});

		const publicSubnet = new ec2.CfnSubnet(this, prefix+'-public', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			availabilityZone: props.az[0],
			cidrBlock: "192.168.0.0/17",
			vpcId: vpc.ref,
			mapPublicIpOnLaunch: false,
			tags: [ tagname("public-sub") ]
		});

		const privateSubnet = new ec2.CfnSubnet(this, prefix+'-private', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			availabilityZone: props.az[1],
			cidrBlock: "192.168.128.0/17",
			vpcId: vpc.ref,
			mapPublicIpOnLaunch: false,
			tags: [ tagname("private-sub") ]
		});

		const privateRouteTable = new ec2.CfnRouteTable(this, prefix+'-private-rt', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			vpcId: vpc.ref,
			tags: [ tagname("private-rt") ]
		});

		const gatewayRouteTable = new ec2.CfnRouteTable(this, prefix+'-gateway-rt', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			vpcId: vpc.ref,
			tags: [ tagname("gateway-rt") ]
		});

		// const publicRouteTable = new ec2.CfnRouteTable(this, prefix+'-public-rt', {
		// 	removalPolicy: cdk.RemovalPolicy.DESTROY,

		// 	vpcId: vpc.ref,
		// 	tags: [ tagname("public-rt") ]
		// });

		// const EC2SecurityGroup = new ec2.CfnSecurityGroup(this, 'EC2SecurityGroup', {
		// 	groupDescription: "SSH and PING",
		// 	groupName: "SSH_and_PING",
		// 	vpcId: vpc.ref,
		// 	securityGroupIngress: [
		// 		{
		// 			cidrIp: "0.0.0.0/0",
		// 			fromPort: 22,
		// 			ipProtocol: "tcp",
		// 			toPort: 22
		// 		},
		// 		{
		// 			cidrIp: vpc.attrCidrBlock,
		// 			fromPort: 8,
		// 			ipProtocol: "icmp",
		// 			toPort: -1
		// 		}
		// 	],
		// 	securityGroupEgress: [
		// 		{
		// 			cidrIp: "0.0.0.0/0",
		// 			ipProtocol: "-1"
		// 		}
		// 	]
		// });

		// const EC2VPCDHCPOptionsAssociation = new ec2.CfnVPCDHCPOptionsAssociation(this, 'EC2VPCDHCPOptionsAssociation', {
		// 	dhcpOptionsId: "dopt-b0340dd4",
		// 	vpcId: vpc.ref
		// });

		const privateRouteTableAssoc = new ec2.CfnSubnetRouteTableAssociation(this, prefix+'-priv-rt-association', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			routeTableId: privateRouteTable.ref,
			subnetId: privateSubnet.ref
		});

		const publicRouteTableAssoc = new ec2.CfnSubnetRouteTableAssociation(this, prefix+'-pub-rt-association', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			routeTableId: gatewayRouteTable.ref,
			subnetId: publicSubnet.ref
		});

		const internetGateway = new ec2.CfnInternetGateway(this, prefix+'-internet-gw', {
			tags: [ tagname("internet-gw") ]
		});

		const internetGwAttachment = new ec2.CfnVPCGatewayAttachment(this, prefix+'-inet-gw-attachment', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			internetGatewayId: internetGateway.ref,
			vpcId: vpc.ref
		});


		const routeToGateway = new ec2.CfnRoute(this, prefix+'-gw-route', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			destinationCidrBlock: "0.0.0.0/0",
			gatewayId: internetGateway.ref,
			routeTableId: gatewayRouteTable.ref
		});


		// for export
		this.publicSubnetId = publicSubnet.ref;
		this.publicSubnetZone = props.az[0];
		this.vpcId = vpc.ref;
	}
}

module.exports = ProvaVpcStack;
