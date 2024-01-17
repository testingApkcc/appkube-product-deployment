# Welcome to appkube product deployment
# prerequisities
To use the eks-blueprints module, you must have nvm, node, npm, aws, istioctl, aws, aws-cdk, kubectl
*	Install nvm using script from NVM github page https://github.com/nvm-sh/nvm
*	`wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`
*	open new terminal
*	`nvm --version`
*	`nvm install node 20.11.0 (npm will get installed)`
*	`curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"`
*	`unzip awscli-bundle.zip`
*	`./awscli-bundle/install -b ~/bin/aws`
*	aws configure <enter keyID and secret)
*	`curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.1 TARGET_ARCH=x86_64 sh -`
*	`curl -LO https://dl.k8s.io/release/v1.29.0/bin/linux/amd64/kubectl`
*   target account and region must be bootstrapped prior to deploying stacks
*   `cdk bootstrap aws://<AWS-account-number>/<region-to-bootstrap>` (run it outside git repo)
*   `cd <repo>`
*   `cdk --version`
*   `git clone <repo>`
*   `npm install -g aws-cdk@2.115.0`
*   `npm i @aws-quickstart/eks-blueprints`

# EKS deployment
* cd <repo>
* `cdk deploy ak-qa-eks`
After deployment configure kubebctl. Below is a sample command, actual is part of 'cdk deploy' output
* `aws eks update-kubeconfig --name ak-qa-eks --region us-east-2 --role-arn arn:aws:iam::657907747545:role/ak-qa-eks-AdminRole38563C57-rfo013EkdNlw`

# Post cluster deployment
 * `istioctl install -f components/istio-ingress-egress.yaml`
 * `kubectl apply -f components/appkube-api-istiogw.yaml`
 * Add route 53 entry for nlb created above

# appkube service
 * check README from cmdb deployment repo
 * check README from security rbac deployment repo

# Cleanup
 * First remove services, checkout README for service deployment 
 * `kubectl delete -f components/appkube-api-istiogw.yaml`
 * `kubectl delete -f components/istio-ingress-egress.yaml`
 * `istioctl operator remove --purge -n istio-system` confirmation prompt should be removed
 * `istioctl uninstall --purge` # load balaner won't be deleted
 * `kubectl delete namespace istio-system`
 * `cdk destroy ak-qa-eks`
cleanup route53 entry
cleanup loadbalancer 
