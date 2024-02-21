

ansible-playbook -e "ansible_ssh_user=papu.bhattacharya"  -e "ansible_connection=local"  -i "localhost," ansible/k8s-master.yaml

python3 runkube.py --with-elk  --no-pull -o overlay/user_template.yml -- optscale  1.0.0

helm template --debug optscale  -f overlay/user_template.yml  optscale

helm template  --dry-run  optscale  -f overlay/user_template.yml  optscale | awk -vout=out -F": " '$0~/^# Source: /{file=out"/"$2; print "Creating "file; system ("mkdir -p $(dirname "file"); echo -n "" > "file)} $0!~/^#/ && $0!="---"{print $0 >> file}'

files goes to out folder
