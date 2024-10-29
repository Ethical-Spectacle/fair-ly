from setuptools import setup, find_packages

setup(
    name="the-fairly-project",
    version="0.4",
    description="Bias analysis toolkit for NLP and multimodal models",
    long_description=open('readme.md').read(),
    long_description_content_type='text/markdown',
    author="Maximus Powers",
    author_email="maximuspowersdev@gmail.com",
    url="https://github.com/ethical-spectacle/fair-ly/pypi_package",
    packages=find_packages(), # don't need this?
    install_requires=[
        'numpy<2',  # numpy 2 isn't working with transformers
        'torch>=1.7.1', 
        'torchvision>=0.8.0', # multi-modal model needs this
        'transformers>=4.0.0',  # soooo slow
        'huggingface_hub>=0.10.0',  # For hf_hub_download, lowkey don't need this, could hard code that one config.json
        'pillow',  # for img processing
    ],
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3.8',
    ],
    python_requires='>=3.6',
    keywords='fairness bias detection NLP transformers multimodal',
)
