import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
// import { KubernetesVersion, NodegroupAmiType } from 'aws-cdk-lib/aws-eks';
// import { CfnIPAMScope } from 'aws-cdk-lib/aws-ec2';
// import * as iam from '@aws-cdk-lib/aws-iam';
// import * as ec2 from '@aws-cdk-lib/aws-ec2';

const PROJ = 'ak'; // appkube
const ENV = 'qa';
const CLUSTER_NAME = PROJ.concat('-',ENV,'-','eks')
const TAG = PROJ.concat('-',ENV)
console.log("EKS Cluster name: " + CLUSTER_NAME)

const app = new cdk.App();
const account = '657907747545';
const region = 'us-east-2';
const version = 'auto'

const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ArgoCDAddOn(),
    // new blueprints.addons.CalicoOperatorAddOn(),
    new blueprints.addons.MetricsServerAddOn(),
    new blueprints.addons.ClusterAutoScalerAddOn(),
    new blueprints.addons.AwsLoadBalancerControllerAddOn(),
    new blueprints.addons.VpcCniAddOn(),
    new blueprints.addons.EbsCsiDriverAddOn(),
    new blueprints.addons.CoreDnsAddOn(),
    new blueprints.addons.KubeProxyAddOn(),
    new blueprints.addons.IstioBaseAddOn(),
    new blueprints.addons.IstioControlPlaneAddOn(),
    // new blueprints.addons.PrometheusNodeExporterAddOn(),
    // new blueprints.addons.GrafanaOperatorAddon()
    // new blueprints.addons.CloudWatchAdotAddOn()
];

// const vpc = new cdk.aws_ec2.Vpc(app, TAG.concat('-', 'vpc'), {
//     cidr: '10.0.0.0/16',
//     maxAzs: 2,
//     subnetConfiguration: [
//       {
//         cidrMask: 16,
//         name: 'public',
//         subnetType: cdk.aws_ec2.SubnetType.PUBLIC
//       },
//       {
//         cidrMask: 16,
//         name: 'private',
//         subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS
//       },
//     ],
// });

const clusterProvider = new blueprints.GenericClusterProvider({
    version: cdk.aws_eks.KubernetesVersion.V1_27,
    // vpc,
    tags: {
        "Name": TAG.concat('-','cluster'),
        "Type": "generic-cluster",
        "Project": TAG
    },
    serviceIpv4Cidr: "10.43.0.0/16",
    // if needed use this to register an auth role integrate with RBAC
    mastersRole: blueprints.getResource(context => {
        return new cdk.aws_iam.Role(context.scope, 'AdminRole', { assumedBy: new cdk.aws_iam.AccountRootPrincipal() });
    }),
    managedNodeGroups: [
        {
            id: "mng1",
            amiType: cdk.aws_eks.NodegroupAmiType.AL2_X86_64,
            instanceTypes: [new cdk.aws_ec2.InstanceType('m5.2xlarge')],
            desiredSize: 2,
            maxSize: 3, 
            nodeGroupSubnets: { subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS },
            launchTemplate: {
                // You can pass Custom Tags to Launch Templates which gets propagated to worker nodes.
                tags: {
                    "Project": TAG,
                    "Name": TAG.concat('-', 'NodeGroup'),
                    "Type": "Managed-Node-Group",
                    "LaunchTemplate": "Custom",
                    "Instance": "ONDEMAND"
                }
            }
        }
    ]
});

const stack = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .version(version)
    .addOns(...addOns)
    .clusterProvider(clusterProvider)
    .useDefaultSecretEncryption(true) // set to false to turn secret encryption off (non-production/demo cases)
    .build(app, CLUSTER_NAME);