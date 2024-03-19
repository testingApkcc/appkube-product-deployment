#!/usr/bin/env python
import sys
from setuptools import setup


setup(name='config-client',
      description='Appkube Config Client',
      author='Synectiks',
      url='https://appkube.app',
      author_email='info@synectiks.com',
      package_dir={'config_client': ''},
      install_requires=['etcd3==0.12.0', 'retrying'],
      packages=['config_client']
      )
