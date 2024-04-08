#!/usr/bin/env python

import argparse
import base64
import json
import logging

import os
import sys
import time

# import yaml
import subprocess
from urllib.parse import urlsplit
# from optscale_client.config_client.client import Client as EtcdClient
from appkube_client.config_client.client import Client as EtcdClient


DESCRIPTION = "Script to test etcd connection"

class TestEtcd:
    def __init__(self, host='etcd', port=2379, cert_cert='/etc/kubernetes/pki/etcd/peer.crt',ca_cert='/etc/kubernetes/pki/etcd/ca.crt',cert_key='/etc/kubernetes/pki/etcd/peer.key'):
        # self.config = yaml.load(open(config_path, 'r'))
        self.etcd_cl = EtcdClient(host=host, port=port,cert_cert='/etc/kubernetes/pki/etcd/peer.crt',ca_cert='/etc/kubernetes/pki/etcd/ca.crt',cert_key='/etc/kubernetes/pki/etcd/peer.key')
        # config = self.config['etcd']

    def start(self):
        # self.etcd_cl.write('/registry_ready', 0)
        logging.log("str1: %s", self.etcd_cl.get('/configured'))
        # logging.log(self.etcd_cl.get('/configured'))
        # self.etcd_cl.
        
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    etcd_host = os.environ.get('HX_ETCD_HOST')
    etcd_port = int(os.environ.get('HX_ETCD_PORT'))
    if len(sys.argv) > 1:
        conf = TestEtcd(sys.argv[1], host=etcd_host, port=etcd_port)
    else:
        conf = TestEtcd(host=etcd_host, port=etcd_port)
    conf.start()
