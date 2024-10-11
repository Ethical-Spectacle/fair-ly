from setuptools import setup, find_packages

setup(
    name="the-fairly-project",
    version="0.1",
    description="A package for analyzing the fairness of text data",
    long_description=open('readme.md').read(),
    long_description_content_type='text/markdown',
    author="Maximus Powers",
    author_email="maximuspowersdev@gmail.com",
    url="https://github.com/ethical-spectacle/fair-ly/pypi_package",
    packages=find_packages(),
    install_requires=[
        'numpy<2',  # numpy 2 isn'tworking with transformers
        'transformers',
        'torch',
        'gradio',
    ],
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3.8',
    ],
    python_requires='>=3.6',
)
