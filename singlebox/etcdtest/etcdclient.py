#!/usr/bin/env python3

import etcd3
# etcd = etcd3.client()
etcd = etcd3.client(host='127.0.0.1', port='2379',cert_cert='/etc/kubernetes/pki/etcd/peer.crt',ca_cert='/etc/kubernetes/pki/etcd/ca.crt',cert_key='/etc/kubernetes/pki/etcd/peer.key')
etcd.get('foo')
etcd.put('bar', 'doot')
etcd.delete('bar')
