- [create K8 in local machine via ansible](#create-K8-in-local-machine-via-ansible)
- [install product via helm-chart on local k8 ](#install-via-helm-chart-on-local-k8)

# create-K8-in-local-machine-via-ansible

ansible-playbook -e "ansible_ssh_user=papu.bhattacharya"  -e "ansible_connection=local"  -i "localhost," ansible/k8s-master.yaml

To run verbose mode
ansible-playbook -vv -e "ansible_ssh_user=papu"  -e "ansible_connection=local"  -i "localhost," ansible/test.yaml

# install-via-helm-chart-on-local-k8 
python3 runkube.py --with-elk  --no-pull -o overlay/user_template.yml -- optscale  1.0.0

helm template --debug optscale  -f overlay/user_template.yml  optscale

helm template  --dry-run  optscale  -f overlay/user_template.yml  optscale | awk -vout=out -F": " '$0~/^# Source: /{file=out"/"$2; print "Creating "file; system ("mkdir -p $(dirname "file"); echo -n "" > "file)} $0!~/^#/ && $0!="---"{print $0 >> file}'

files goes to out folder

# some important kubeadm commands

kubeadm init --config /tmp/kubeadm-init.conf --upload-certs
kubeadm init --upload-certs
kubeadm init phase kubelet-start
swapoff -a
kubeadm config images pull

# How to clean Docker
Remove the following packages:

for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

Then clean 
sudo rm -rf /var/lib/docker
sudo rm -rf /etc/docker

# How to clean k8

Step 1: Delete All Kubernetes Resources

Before uninstalling Kubernetes, ensure that you delete all resources (like pods, services, and volumes) that were created under Kubernetes.

```
kubectl delete all --all-namespaces --all

```

Step 2: Uninstall kubeadm, kubectl, and kubelet

Use the following commands to uninstall kubeadm, kubectl, and kubelet:

```
sudo apt-get purge kubeadm kubectl kubelet kubernetes-cni kube*   
sudo apt-get autoremove  

```
Step 3: Remove Configuration and Data

After uninstalling the Kubernetes components, ensure you remove all configurations and data related to Kubernetes:

```
sudo rm -rf ~/.kube
sudo rm -rf /etc/cni
sudo rm -rf /etc/kubernetes
sudo rm -rf /var/lib/etcd
sudo rm -rf /var/lib/kubelet

```
Step 4: Reset iptables

Reset the iptables rules to their default settings:

```
sudo iptables -F && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -X

```
Step 5: Revert Changes to the Hosts File

If you made any changes to the /etc/hosts file during the Kubernetes setup, ensure you revert those changes.

# How to install Docker

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

## Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

## install docker 

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# disable swap
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
