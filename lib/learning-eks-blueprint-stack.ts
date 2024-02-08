import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as core from 'aws-cdk-lib/core';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as fs from 'node:fs';
import { exec } from 'child_process';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as eks from 'aws-cdk-lib/aws-eks';

// Get NLB ARN
export class CreateRoute53ARecordForEKSNLB extends cdk.Stack {
  constructor(scope: Construct, id: string, TAG: string, DOMAINNAME: string, props?: cdk.StackProps) {
    super(scope, id, props);
      const nlb = elbv2.NetworkLoadBalancer.fromLookup(
          this,
          'NLB',
          {
              loadBalancerTags: {
              'owner': TAG,
              },
          });

          // Create a CloudFormation stack output for the NLB ARN
          new core.CfnOutput(this, 'NLBARN', {
          value: nlb.loadBalancerArn,
          description: 'The ARN of the Network Load Balancer',
          });

          // Create A record
          const myzone = route53.HostedZone.fromLookup(this, 'myzone', {domainName: DOMAINNAME});
          new route53.ARecord(this, 'AliasRecord', {
          zone: myzone,
          recordName: TAG + DOMAINNAME,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(nlb))
          })
  }
}

export class LinuxTerminal {
  run(command: string): Promise<{ error: Error | null, stdout: string, stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });
  }
}

export async function appkubeBuildEksCluster(
    app: cdk.App,
    account: string,
    region: string,
    version:  cdk.aws_eks.KubernetesVersion | "auto", 
    addOns: blueprints.ClusterAddOn[],
    clusterProvider: blueprints.GenericClusterProvider,
    useDefaultSecretEncryption: boolean,
    CLUSTER_NAME: string
): Promise<void> {
    const builder = blueprints.EksBlueprint.builder()
        .account(account)
        .region(region)
        .version(version)
        .addOns(...addOns)
        .clusterProvider(clusterProvider)
        .useDefaultSecretEncryption(useDefaultSecretEncryption);

    const blueprint = builder.build(app, CLUSTER_NAME);
    await blueprint.waitForAsyncTasks(); // Ensure all async tasks are completed
    let clusterInfo = await blueprint.getClusterInfo();
    console.log(clusterInfo.version);

    // Wait for the cluster creation to complete
    await waitForClusterCreation(blueprint);
}

export async function replaceStringInFile(
  filePath: string, 
  oldString: string, 
  newString: string
): Promise<number> {
  console.log(`Replacing ${oldString} with ${newString} in ${filePath}`);

  try {
      // Read file content
      let data = fs.readFileSync(filePath, 'utf-8');

      // Replace string
      data = data.replace(new RegExp(oldString, 'g'), newString);
      let indx: number = data.indexOf(newString);
      if (indx === -1) {
          console.log('New string not found in file');
          return(-1);
      }

      // Write the modified content back to the file
      fs.writeFileSync(filePath, data, 'utf8');
      console.log(`Successfully replaced ${oldString} with ${newString} in ${filePath}`);
      return(0)
  } catch (error) {
      console.error(error);
      // throw error; // Propagate the error to the caller
      return(-2)
  }
}

async function waitForClusterCreation(blueprint: blueprints.EksBlueprint): Promise<void> {
  while (true) {
      try {
          const clusterInfo = await blueprint.getClusterInfo();
          // const clusterStatus = clusterInfo.clusterStatus; // Update this line
          // console.log(`Cluster status: ${clusterStatus}`);
          if (clusterStatus === "ACTIVE") {
              console.log("EKS cluster is active and ready.");
              break; // Exit the loop when the cluster is active
          }

          // Wait for a few seconds before checking the status again
          await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
          console.error("Error occurred while describing cluster:", error);
          throw error;
      }
  }
}
