import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
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

let tagPlaceHolder: string = '{{ proj-tag }}'
console.log(`Update tag ${TAG} in yaml files`)

async function main() {
    try  {
        const ret = await appkubelib.replaceStringInFile(ISTIOINGRESSYAML, tagPlaceHolder, TAG);
        if (ret === 0) {
            console.log(`${TAG} tag update: successful`);
        } else {
            console.log(`${TAG} tag update: failed, The return value: ${ret}.`);
            process.exit(ret);
        }

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

        // Call the appkubeBuildEksCluster function with appropriate parameters
        await appkubelib.appkubeBuildEksCluster(
            app,
            account,
            region,
            version,
            addOns,
            clusterProvider,
            true,
            CLUSTER_NAME
        );
        console.log('EKS cluster creation completed successfully.');
        console.log(`Cluster ${CLUSTER_NAME} is ready`);

        // try {
        //     const appkubeEKSBuilder = await appkubelib.appkubeBuildEksCluster(app, account, region, version, addOns, 
        //     clusterProvider, true, CLUSTER_NAME);
        //     console.log('Cluster successfully built!');
        // } catch (error) {
        //     console.error('Error building cluster:', error);
        //     process.exit(-1);
        // }

        // const builder = blueprints.EksBlueprint.builder()
        //     .account(account)
        //     .region(region)
        //     .version(version)
        //     .addOns(...addOns)
        //     .clusterProvider(clusterProvider)
        //     .useDefaultSecretEncryption(true);

        // try {
        //     const blueprint = builder.build(app, CLUSTER_NAME);
        //     await blueprint.waitForAsyncTasks(); // Wait for asynchronous tasks

        //     console.log('Async tasks completed.');

        //     if (process.env.CODEBUILD_BUILD_SUCCEEDING === '1') {
        //         console.log('Build succeeded!');
        //     } else {
        //         console.log('Build failed!');
        //     }
        // } catch (error) {
        //     console.error('Error:', error);
        //     process.exit(-1);
        // }

        // const stack = blueprints.EksBlueprint.builder()
        //     .account(account)
        //     .region(region)
        //     .version(version)
        //     .addOns(...addOns)
        //     .clusterProvider(clusterProvider)
        //     .useDefaultSecretEncryption(true) // set to false to turn secret encryption off (non-production/demo cases)
        //     .build(app, CLUSTER_NAME);

        // // stack.build(app, CLUSTER_NAME);
        // if (process.env.CODEBUILD_BUILD_SUCCEEDING == '1') {
        //     console.log('Build succeeded!');
        // } else {
        //     console.log('Build failed!');
        // }

        // Run stack builder
        // app.synth();

        // don't skip stack builder




        // istio control plane and ingress-egress deployment commands
        // var istioControlPlaneCMD = 'istioctl install -f components/istio-ingress-egress.yaml --skip-confirmation'
        // var istioIngressEgressCMD = 'kubectl apply -f components/istio-ingress-egress.yaml'

        // // Execute above commands
        // const myTerminal = new appkubelib.LinuxTerminal();
        // myTerminal.run(istioControlPlaneCMD)
        // .then(({ error, stdout, stderr }) => {
        //     if (error) {
        //         console.error(error);
        //         process.exit(-1)
        //     } else {
        //         console.log(stdout);
        //     }
        //     console.log(stderr);
        //     process.exit(-1)
        //     })
        //     .catch((error) => {
        //     console.error(error);
        //     process.exit(-1)
        //     });

        // myTerminal.run(istioIngressEgressCMD)
        //     .then(({ error, stdout, stderr }) => {
        //     if (error) {
        //         console.error(error);
        //         process.exit(-1)
        //     } else {
        //         console.log(stdout);
        //     }
        //     console.log(stderr);
        //     process.exit(-1)
        //     })
        //     .catch((error) => {
        //     console.error(error);
        //     process.exit(-1)
        //     });

        // const addRoute53 = new appkubelib.CreateRoute53ARecordForEKS(this,DOMAINNAME,TAG,'');
    } catch(error) {
        console.error('An error occurred:', error);
        process.exit(-1);
    }
}

// main().catch(error => {
//     console.error('An error occurred:', error);
//     process.exit(-1);
// });
