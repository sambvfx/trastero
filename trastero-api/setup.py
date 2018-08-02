"""
Trastero python API
"""
import os
import re
from setuptools import setup


_dirname = os.path.abspath(os.path.dirname(__file__))


PROJECT_NAME = 'trastero'


def read(*paths):
    with open(os.path.join(_dirname, *paths)) as f:
        return f.read()


def version():
    """
    Sources version from the __init__.py so we don't have to maintain the
    value in two places.
    """
    regex = re.compile(r'__version__ = \'([0-9.]+)\'')
    for line in read(PROJECT_NAME, '__init__.py').split('\n'):
        match = regex.match(line)
        if match:
            return match.groups()[0]


setup(
    name=PROJECT_NAME,
    version=version(),
    description=__doc__,
    long_description=read('README.md'),
    author='Sam Bourne',
    packages=['trastero'],
)
