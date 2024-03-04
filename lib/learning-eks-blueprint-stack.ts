import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as core from 'aws-cdk-lib/core';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as fs from 'node:fs';
import { exec } from 'child_process';

// export class LearningEksBlueprintStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // The code that defines your stack goes here

//     // example resource
//     // const queue = new sqs.Queue(this, 'LearningEksBlueprintQueue', {
//     //   visibilityTimeout: cdk.Duration.seconds(300)
//     // });
//   }
// }

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

export function replaceStringInFile(filePath: string, oldString: string, newString: string): number {
  fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
      console.error(err);
      return -1;
  }

  let result: string;
  try {
    result = data.replace(new RegExp(oldString, 'g'), newString);
  } catch (e) {
    console.error(`Error: ${e}`);
    return -1;
  }

  let indx: number = data.indexOf(newString) //=== -1 ? data : result;
  console.log(`Original file content: ${data}`);
  console.log(`Modified file content: ${result}`);
  if (indx === -1) {
    return -1;
  }

  fs.writeFile(filePath, result, 'utf8', (err) => {
      if (err) {
      console.error(err);
      return -1;
      }
      console.log(`Successfully replaced ${oldString} with ${newString} in ${filePath}`);
      return 0;
  });
  return 0;
  });
  return 0;
}



