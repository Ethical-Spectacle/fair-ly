---
description: Bias Evaluation Across Domains (The Vector Institute)
---

# BEADs Dataset (2024)

3.67M rows | 2024 | [The Vector Institute](https://huggingface.co/vector-institute)

The BEADs corpus was gathered from the datasets: [MBIC](https://zenodo.org/records/4474336), [Hyperpartisan news](https://huggingface.co/datasets/SemEvalWorkshop/hyperpartisan\_news\_detection), [Toxic comment classification](https://www.kaggle.com/competitions/jigsaw-toxic-comment-classification-challenge), [Jigsaw Unintended Bias](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification), [Age Bias](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/L4OAKN), [Multi-dimensional news (Ukraine)](https://zenodo.org/records/3885351#.ZF0KoxHMLtV), [Social biases](https://maartensap.com/social-bias-frames/).&#x20;

It was annotated by humans, then with semi-supervised learning, and finally human verified.

It's one of the largest and most up-to-date datasets for bias and toxicity classification, though it's currently private so you'll need to request access through HuggingFace.

**🤗Hugging Face Dataset (request access)**

{% embed url="https://huggingface.co/datasets/newsmediabias/news-bias-full-data" %}

**📑 Contents**

<table><thead><tr><th width="219">Fields</th><th>Description</th></tr></thead><tbody><tr><td><strong><code>text</code></strong></td><td>The sentence or sentence fragment.</td></tr><tr><td><strong><code>dimension</code></strong></td><td>Descriptive category of the text.</td></tr><tr><td><strong><code>biased_words</code></strong></td><td>A compilation of words regarded as biased.</td></tr><tr><td><strong><code>aspect</code></strong></td><td>Specific sub-topic within the main content.</td></tr><tr><td><strong><code>label</code></strong></td><td>Indicates the presence (True) or absence (False) of bias. The label is ternary - highly biased, slightly biased, and neutral.</td></tr><tr><td><strong><code>toxicity</code></strong></td><td>Indicates the presence (True) or absence (False) of toxicity.</td></tr><tr><td><strong><code>identity_mention</code></strong></td><td>Mention of any identity based on words match.</td></tr></tbody></table>

_While BEADs doesn't have a binary label for bias, the ternary labels (e.g. neutral, slightly biased, and highly biased) of the label field can categorized into biased (1), or unbiased (0). Additionally, the toxicity field contains binary labels._

**📄 Research Paper**

{% embed url="https://arxiv.org/abs/2312.00168" %}

<figure><img src="../../.gitbook/assets/Screenshot 2024-10-10 at 1.37.02 AM.png" alt="" width="375"><figcaption></figcaption></figure>
