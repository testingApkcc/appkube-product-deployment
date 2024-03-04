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