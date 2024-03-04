import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
// import { KubernetesVersion, NodegroupAmiType } from 'aws-cdk-lib/aws-eks';
// import { CfnIPAMScope } from 'aws-cdk-lib/aws-ec2';
// import * as iam from '@aws-cdk-lib/aws-iam';
// import * as ec2 from '@aws-cdk-lib/aws-ec2';

import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as core from 'aws-cdk-lib/core';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct} from 'constructs';
import * as appkubelib from '../lib/learning-eks-blueprint-stack'


const PROJ = 'ak'; // appkube
const ENV = 'qa'; // environment
const SETUPID = 'satya1'
const CLUSTER_NAME = PROJ.concat('-',ENV,'-','eks')
const TAG = PROJ.concat('-',ENV, '-', SETUPID)
console.log("EKS Cluster name: " + CLUSTER_NAME)
const ISTIOINGRESSYAML = 'components/istio-ingress-egress.yaml'
const DOMAINNAME = 'synectiks.net';

const app = new cdk.App();
const account = '657907747545';
const region = 'us-east-2';
const version = 'auto'
const INSTANCETYPE = 't2.xlarge' // t2.xlarge/m5.2xlarge

const ret = appkubelib.replaceStringInFile(ISTIOINGRESSYAML, '{{ proj-tag }}', TAG)
if (ret === 0) {
    console.log("Inside " + ISTIOINGRESSYAML + " successfully replaced {{ proj-tag }} with " + TAG);
  } else {
    console.log(`The return value is ${ret}.`);
    process.exit(ret);
    // exit(ret)
  }

// process.exit(0);

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
    new blueprints.addons.EksPodIdentityAgentAddOn(),
];

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
            id: CLUSTER_NAME.concat('-', 'ng'),
            // amiType: cdk.aws_eks.NodegroupAmiType.AL2_X86_64,
            instanceTypes: [new cdk.aws_ec2.InstanceType(INSTANCETYPE)],
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

if (process.env.CODEBUILD_BUILD_SUCCEEDING === '1') {
    console.log('Build succeeded!');
} else {
    console.log('Build failed!');
}
// stack.build(app, CLUSTER_NAME);

// Run stack builder
// app.synth();

// don't skip stack builder




// istio control plane and ingress-egress deployment commands
var istioControlPlaneCMD = 'istioctl install -f components/istio-ingress-egress.yaml --skip-confirmation'
var istioIngressEgressCMD = 'kubectl apply -f components/istio-ingress-egress.yaml'

const myTerminal = new appkubelib.LinuxTerminal();
myTerminal.run(istioControlPlaneCMD)
.then(({ error, stdout, stderr }) => {
    if (error) {
        console.error(error);
        process.exit(-1)
    } else {
        console.log(stdout);
    }
    console.log(stderr);
    process.exit(-1)
    })
    .catch((error) => {
    console.error(error);
    process.exit(-1)
    });

myTerminal.run(istioIngressEgressCMD)
    .then(({ error, stdout, stderr }) => {
    if (error) {
        console.error(error);
        process.exit(-1)
    } else {
        console.log(stdout);
    }
    console.log(stderr);
    process.exit(-1)
    })
    .catch((error) => {
    console.error(error);
    process.exit(-1)
    });

// const addRoute53 = new appkubelib.CreateRoute53ARecordForEKS(this,DOMAINNAME,TAG,'');