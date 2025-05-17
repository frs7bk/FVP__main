"""
إعداد حزمة نظام متابعة العملاء المحتملين
"""
from setuptools import setup, find_packages

with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

with open('requirements.txt', 'r', encoding='utf-8') as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name='crm_automation',
    version='1.0.0',
    author='فريق التطوير',
    author_email='dev@example.com',
    description='نظام متابعة العملاء المحتملين تلقائياً',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/crm-automation',
    packages=find_packages(),
    package_data={
        '': ['*.txt', '*.md', '*.yaml', '*.json'],
    },
    install_requires=requirements,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Topic :: Office/Business',
        'Topic :: Software Development :: Libraries :: Application Frameworks',
    ],
    python_requires='>=3.9',
    entry_points={
        'console_scripts': [
            'crm-automation=src.cli:main',
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
