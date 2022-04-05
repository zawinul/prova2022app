"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyStack = void 0;
var cdk = require("@aws-cdk/core");
var ec2 = require("@aws-cdk/aws-ec2");
var MyStack = /** @class */ (function (_super) {
    __extends(MyStack, _super);
    function MyStack(scope, id, props) {
        var _this = _super.call(this, scope, id, props) || this;
        var EC2Subnet = new ec2.CfnSubnet(_this, 'EC2Subnet', {
            availabilityZone: EC2Instance.attrAvailabilityZone,
            cidrBlock: "192.168.0.0/17",
            vpcId: EC2VPC.ref,
            mapPublicIpOnLaunch: false
        });
        var EC2Instance = new ec2.CfnInstance(_this, 'EC2Instance', {
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
        var EC2VolumeAttachment = new ec2.CfnVolumeAttachment(_this, 'EC2VolumeAttachment', {
            volumeId: EC2Volume.ref,
            instanceId: EC2Instance.ref,
            device: "/dev/xvda"
        });
        var EC2NetworkInterfaceAttachment = new ec2.CfnNetworkInterfaceAttachment(_this, 'EC2NetworkInterfaceAttachment', {
            networkInterfaceId: "eni-062e6c9ce20baf174",
            deviceIndex: 0,
            instanceId: EC2Instance.ref,
            deleteOnTermination: true
        });
        var EC2Volume = new ec2.CfnVolume(_this, 'EC2Volume', {
            availabilityZone: EC2Subnet.attrAvailabilityZone,
            encrypted: false,
            size: 10,
            volumeType: "gp2",
            snapshotId: "snap-0c16cb6c1847c4362",
            multiAttachEnabled: false
        });
        var EC2NetworkInterface = new ec2.CfnNetworkInterface(_this, 'EC2NetworkInterface', {
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
        var EC2VPC = new ec2.CfnVPC(_this, 'EC2VPC', {
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
        var EC2Subnet2 = new ec2.CfnSubnet(_this, 'EC2Subnet2', {
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
        var EC2RouteTable = new ec2.CfnRouteTable(_this, 'EC2RouteTable', {
            vpcId: EC2Subnet.attrVpcId,
            tags: [
                {
                    key: "Name",
                    value: "T9312-gateway-rt"
                }
            ]
        });
        var EC2RouteTable2 = new ec2.CfnRouteTable(_this, 'EC2RouteTable2', {
            vpcId: EC2Subnet.attrVpcId
        });
        var EC2RouteTable3 = new ec2.CfnRouteTable(_this, 'EC2RouteTable3', {
            vpcId: EC2Subnet.attrVpcId,
            tags: [
                {
                    key: "Name",
                    value: "T9312-private-rt"
                }
            ]
        });
        var EC2SecurityGroup = new ec2.CfnSecurityGroup(_this, 'EC2SecurityGroup', {
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
        var EC2VPCDHCPOptionsAssociation = new ec2.CfnVPCDHCPOptionsAssociation(_this, 'EC2VPCDHCPOptionsAssociation', {
            dhcpOptionsId: "dopt-17d23f7e",
            vpcId: "vpc-0afec776fc1bb04d7"
        });
        var EC2VPCGatewayAttachment = new ec2.CfnVPCGatewayAttachment(_this, 'EC2VPCGatewayAttachment', {
            internetGatewayId: "igw-0525f9f70e85bb6ba",
            vpcId: EC2Subnet.attrVpcId
        });
        return _this;
    }
    return MyStack;
}(cdk.Stack));
exports.MyStack = MyStack;
var app = new cdk.App();
new MyStack(app, 'my-stack-name', { env: { region: 'eu-south-1' } });
app.synth();
