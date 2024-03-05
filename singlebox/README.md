- [create K8 in local machine via ansible](#create-K8-in-local-machine-via-ansible)
- [install product via helm-chart on local k8 ](#install-via-helm-chart-on-local-k8)

# create-K8-in-local-machine-via-ansible

ansible-playbook -e "ansible_ssh_user=papu.bhattacharya"  -e "ansible_connection=local"  -i "localhost," ansible/k8s-master.yaml

To run verbose mode
ansible-playbook -vv -e "ansible_ssh_user=papu"  -e "ansible_connection=local"  -i "localhost," ansible/test.yaml

# install-via-helm-chart-on-local-k8 

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

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

for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd.io runc; do sudo apt-get remove $pkg; done

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

# Load the required kernel modules on all nodes

sudo tee /etc/modules-load.d/containerd.conf <<EOF
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter

# Configure the critical kernel parameters for Kubernetes using the following:

sudo tee /etc/sysctl.d/kubernetes.conf <<EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF

# Then, reload the changes

sudo sysctl --system

# Install Containerd Runtime (all nodes)

## install dependencies

sudo apt install -y curl gnupg2 software-properties-common apt-transport-https ca-certificates

## Enable the Docker repository

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmour -o /etc/apt/trusted.gpg.d/docker.gpg
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

## Update the package list and install containerd:

sudo apt update
sudo apt install -y containerd.io

## Configure containerd to start using systemd as cgroup:
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null 2>&1
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml

## Restart and enable the containerd service:

sudo systemctl restart containerd
sudo systemctl enable containerd

## Add Apt Repository for Kubernetes (all nodes)
//the following 2 is not working
option1 
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmour -o /etc/apt/trusted.gpg.d/kubernetes-xenial.gpg
sudo apt-add-repository "deb http://apt.kubernetes.io/ kubernetes-xenial main"

option2
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes.gpg

echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/kubernetes.gpg] http://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list


## Install Kubectl, Kubeadm, and Kubelet (all nodes)

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

## Initialize Kubernetes Cluster with Kubeadm (master node)

sudo kubeadm  init --upload-certs

## Run the following commands on the master node
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

## Next, use kubectl commands to check the cluster and node status

kubectl get nodes

## Add Worker Nodes to the Cluster (worker nodes)
kubeadm join 146.190.135.86:6443 --token f1h95l.u4nkex9cw8d0g63w         --discovery-token-ca-cert-hash sha256:6d15f2a79bdb38d1666af50c85f060b9fadc73f13c932e0e2a9eeef08f51f91a

## Install Kubernetes Network Plugin (master node)

kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.25.0/manifests/calico.yaml

## Verify the cluster and test (master node)

kubectl get pods -n kube-system
kubectl get nodes

## Deploy test application on cluster (master node)

kubectl run nginx --image=nginx

## How to run pods in master node 
You can taint the master node
(myproject) papu@papu:~$ kubectl get no
NAME   STATUS   ROLES           AGE   VERSION
papu   Ready    control-plane   19h   v1.28.2

kubectl taint nodes --all node-role.kubernetes.io/control-plane-

## To run as root
export KUBECONFIG=/etc/kubernetes/admin.conf