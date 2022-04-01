const cdk = require('aws-cdk-lib');
const ec2 = require("aws-cdk-lib/aws-ec2");

class ProvaEc2MachineStack extends cdk.Stack {

	constructor(scope, id, props) {


		super(scope, id, props);
		var prefix = props.namePrefix;

		const WebServerSecurityGroup = new ec2.CfnSecurityGroup(this, prefix+'-tomcat-sg', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			groupDescription: "sg Demo Tomcat Non Sicura",
			groupName: prefix+"-tomcat-sec-group",
			//vpcId: "vpc-2ed33e47",
			vpcId: props.vpcId,

			
			securityGroupIngress: [
				rule("0.0.0.0/0", "tcp", [80, 80]),
				ruleIPv6("::/0", "tcp", [80, 80]),
				rule("0.0.0.0/0", "tcp", [22, 22]),
				rule("0.0.0.0/0", "tcp", [443, 443]),
				ruleIPv6("::/0", "tcp", [443, 443]),
			],
			securityGroupEgress: [
				{
					cidrIp: "0.0.0.0/0",
					ipProtocol: "-1"
				}
			]
		});

		const TomcatMachine = new ec2.CfnInstance(this, prefix+'-tomcat-machine', {
			removalPolicy: cdk.RemovalPolicy.DESTROY,

			imageId: "ami-0d1a6957706326ecb",
			instanceType: "t3.nano",
			keyName: "p2022-putty",
			availabilityZone: props.publicSubnetZone,
			tenancy: "default",
			//subnetId: props.publicSubnetId,
			ebsOptimized: true,
			// securityGroupIds: [
			// 	WebServerSecurityGroup.ref
			// ],
			networkInterfaces: [{
				deviceIndex:'0',
				associatePublicIpAddress: true,
				deleteOnTermination: true,
				subnetId: props.publicSubnetId
			}],
			sourceDestCheck: true,
			// blockDeviceMappings: [
			// 	{
			// 		deviceName: "/dev/xvda",
			// 		ebs: {
			// 			encrypted: false,
			// 			volumeSize: 10,
			// 			//snapshotId: "snap-0c16cb6c1847c4362",
			// 			volumeType: "gp2",
			// 			deleteOnTermination: true
			// 		}
			// 	}
			// ],
			tags: [
				{
					key: "tipologia",
					value: "non sicura, solo per demo"
				},
				{
					key: "Name",
					value: prefix+"-tomcat-server"
				}

			],
			hibernationOptions: {
				configured: false
			},
			cpuOptions: {
				coreCount: 1,
				threadsPerCore: 2
			},
			enclaveOptions: {
				enabled: false
			}
		});

		// const disk = new ec2.CfnVolume(this, 'EC2Volume', {
        //     availabilityZone: TomcatMachine.attrAvailabilityZone,
        //     encrypted: false,
        //     size: 10,
        //     volumeType: "gp2",
        //     //snapshotId: "snap-0c16cb6c1847c4362",
        //     tags: [
        //         {
        //             key: "tipologia",
        //             value: "un disco come un altro"
        //         }
        //     ],
        //     multiAttachEnabled: false
        // });

		// const diskAttach = new ec2.CfnVolumeAttachment(this, prefix+'-tomcat-disk', {
		// 	removalPolicy: cdk.RemovalPolicy.DESTROY,
		// 	volumeId: disk.ref,
		// 	instanceId: TomcatMachine.ref,
		// 	device: "/dev/xvda"
		// });

		// const net = new ec2.CfnNetworkInterfaceAttachment(this, prefix+'-tomcat-net',
		// 	{
		// 		removalPolicy: cdk.RemovalPolicy.DESTROY,
		// 		//networkInterfaceId: "eni-09ce69de3dc270c5e",
		// 		networkInterfaceId: prefix+"-net-"+(new Date().getTime()),
		// 		deviceIndex: '0',
		// 		instanceId: TomcatMachine.ref,
		// 		deleteOnTermination: true
		// 	});

	}
}

function rule(ip, prot, portRange) {
	return {
		cidrIp: ip,
		fromPort: portRange[0],
		toPort: portRange[1],
		ipProtocol: prot
	};
};
function ruleIPv6(ip, prot, portRange) {
	return {
		cidrIpv6: ip,
		fromPort: portRange[0],
		toPort: portRange[1],
		ipProtocol: prot
	};
};


module.exports = ProvaEc2MachineStack;
