import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class MyStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const EC2Subnet = new ec2.CfnSubnet(this, 'EC2Subnet', {
            availabilityZone: EC2Instance.attrAvailabilityZone,
            cidrBlock: "192.168.0.0/17",
            vpcId: EC2VPC.ref,
            mapPublicIpOnLaunch: false
        });

        const EC2Instance = new ec2.CfnInstance(this, 'EC2Instance', {
            imageId: "ami-0d1a6957706326ecb",
            instanceType: "t3.nano",
            keyName: "p2022-putty",
            availabilityZone: "eu-south-1a",
            tenancy: "default",
            subnetId: "subnet-0aea0339a0f30f99c",
            ebsOptimized: true,
            securityGroupIds: [
                "sg-0c1974f16ddec8f64"
            ],
            sourceDestCheck: true,
            blockDeviceMappings: [
                {
                    deviceName: "/dev/xvda",
                    ebs: {
                        encrypted: false,
                        volumeSize: 10,
                        snapshotId: "snap-0c16cb6c1847c4362",
                        volumeType: "gp2",
                        deleteOnTermination: true
                    }
                }
            ],
            tags: [
                {
                    key: "Name",
                    value: "T9312-tomcat-server"
                },
                {
                    key: "tipologia",
                    value: "non sicura, solo per demo"
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

        const EC2VolumeAttachment = new ec2.CfnVolumeAttachment(this, 'EC2VolumeAttachment', {
            volumeId: EC2Volume.ref,
            instanceId: EC2Instance.ref,
            device: "/dev/xvda"
        });

        const EC2NetworkInterfaceAttachment = new ec2.CfnNetworkInterfaceAttachment(this, 'EC2NetworkInterfaceAttachment', {
            networkInterfaceId: "eni-062e6c9ce20baf174",
            deviceIndex: 0,
            instanceId: EC2Instance.ref,
            deleteOnTermination: true
        });

        const EC2Volume = new ec2.CfnVolume(this, 'EC2Volume', {
            availabilityZone: EC2Subnet.attrAvailabilityZone,
            encrypted: false,
            size: 10,
            volumeType: "gp2",
            snapshotId: "snap-0c16cb6c1847c4362",
            multiAttachEnabled: false
        });

        const EC2NetworkInterface = new ec2.CfnNetworkInterface(this, 'EC2NetworkInterface', {
            description: "",
            privateIpAddress: EC2Instance.attrPrivateIp,
            privateIpAddresses: [
                {
                    privateIpAddress: EC2Instance.attrPrivateIp,
                    primary: true
                }
            ],
            subnetId: EC2Subnet.ref,
            sourceDestCheck: true,
            groupSet: [
                "sg-0c1974f16ddec8f64"
            ]
        });

        const EC2VPC = new ec2.CfnVPC(this, 'EC2VPC', {
            cidrBlock: "192.168.0.0/16",
            enableDnsSupport: true,
            enableDnsHostnames: false,
            instanceTenancy: "default",
            tags: [
                {
                    key: "Name",
                    value: "T9312-prova-2022-web-2"
                }
            ]
        });

        const EC2Subnet2 = new ec2.CfnSubnet(this, 'EC2Subnet2', {
            availabilityZone: "eu-south-1b",
            cidrBlock: "192.168.128.0/17",
            vpcId: EC2Subnet.attrVpcId,
            mapPublicIpOnLaunch: false,
            tags: [
                {
                    key: "Name",
                    value: "T9312-private-sub"
                }
            ]
        });

        const EC2RouteTable = new ec2.CfnRouteTable(this, 'EC2RouteTable', {
            vpcId: EC2Subnet.attrVpcId,
            tags: [
                {
                    key: "Name",
                    value: "T9312-gateway-rt"
                }
            ]
        });

        const EC2RouteTable2 = new ec2.CfnRouteTable(this, 'EC2RouteTable2', {
            vpcId: EC2Subnet.attrVpcId
        });

        const EC2RouteTable3 = new ec2.CfnRouteTable(this, 'EC2RouteTable3', {
            vpcId: EC2Subnet.attrVpcId,
            tags: [
                {
                    key: "Name",
                    value: "T9312-private-rt"
                }
            ]
        });

        const EC2SecurityGroup = new ec2.CfnSecurityGroup(this, 'EC2SecurityGroup', {
            groupDescription: "sg Demo Tomcat Non Sicura",
            groupName: "T9312-tomcat-sec-group",
            vpcId: EC2Subnet.attrVpcId,
            securityGroupIngress: [
                {
                    cidrIp: "0.0.0.0/0",
                    fromPort: 80,
                    ipProtocol: "tcp",
                    toPort: 80
                },
                {
                    cidrIpv6: "::/0",
                    fromPort: 80,
                    ipProtocol: "tcp",
                    toPort: 80
                },
                {
                    cidrIp: "0.0.0.0/0",
                    fromPort: 22,
                    ipProtocol: "tcp",
                    toPort: 22
                },
                {
                    cidrIp: "0.0.0.0/0",
                    fromPort: 443,
                    ipProtocol: "tcp",
                    toPort: 443
                },
                {
                    cidrIpv6: "::/0",
                    fromPort: 443,
                    ipProtocol: "tcp",
                    toPort: 443
                }
            ],
            securityGroupEgress: [
                {
                    cidrIp: "0.0.0.0/0",
                    ipProtocol: "-1"
                }
            ]
        });

        const EC2VPCDHCPOptionsAssociation = new ec2.CfnVPCDHCPOptionsAssociation(this, 'EC2VPCDHCPOptionsAssociation', {
            dhcpOptionsId: "dopt-17d23f7e",
            vpcId: "vpc-0afec776fc1bb04d7"
        });

        const EC2VPCGatewayAttachment = new ec2.CfnVPCGatewayAttachment(this, 'EC2VPCGatewayAttachment', {
            internetGatewayId: "igw-0525f9f70e85bb6ba",
            vpcId: EC2Subnet.attrVpcId
        });

    }
}

const app = new cdk.App();
new MyStack(app, 'my-stack-name', { env: { region: 'eu-south-1' } });
app.synth();
