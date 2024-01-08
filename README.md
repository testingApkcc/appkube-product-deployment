# Welcome to appkube product deployment

# prerequisities
To use the eks-blueprints module, you must have node.js, npm, aws, aws-cdk(version as per package.json)
* `Install node, npm, make, istioctl(1.20.1) and kubectl`
* `aws --version`
* `npm install -g aws-cdk@2.115.0`
* `cdk --version`
* `cdk init app --language typescript`

# EKS deployment
target account and region must be bootstrapped prior to deploying stacks
* `cdk bootstrap aws://<AWS-account-number>/<region-to-bootstrap>`
* `git clone <this repo>`
* `cdk deploy ak-qa-eks`
After deployment configure kubebctl. Below is a sample command, actual is part of 'cdk deploy' output
* `aws eks update-kubeconfig --name ak-qa-eks --region us-east-2 --role-arn arn:aws:iam::657907747545:role/ak-qa-eks-AdminRole38563C57-rfo013EkdNlw`

# Post cluster deployment
 * ``
 * `kubectl apply -f components/istio-addons/`
 * `istioctl install -f components/istio-ingress-egress.yaml`
 * Add route 53 entry for nlb created above


# cmdb service deployment
 
 * check README from cmdb deployment repo

# Cleanup
 *  Uninstall cmdb service - check README from cmdb deployment repo
 * `kubectl delete -f components/appkube-api-istiogw.yaml`
 * `kubectl delete -f components/istio-ingress-egress.yaml`
 * `kubectl delete -f components/istio-addons/`
 * `istioctl operator remove --purge -n istio-system` confirmation prompt should be removed
 * `istioctl uninstall --purge` # load balaner won't be deleted
 * `kubectl delete namespace istio-system`
 * `cdk destroy ak-qa-eks`
cleanup route53 entry
