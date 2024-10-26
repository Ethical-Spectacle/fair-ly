---
description: Bias Annotations By Experts (Media Bias Group)
---

# BABE Dataset (2022)

4.12k records | 2023 | [Media Bias Group](https://media-bias-research.org/)

Human annotated, and all annotators must agree. In its paper, BABE showed great results with BERT for sequence classification of news articles. While smaller than some other datasets, the annotations are very reliable (highly recommended as an external dataset for model eval).

**🤗HuggingFace Dataset**

{% embed url="https://huggingface.co/datasets/mediabiasgroup/BABE" %}

**📑 Contents**

<table><thead><tr><th width="187">Fields</th><th>Description</th></tr></thead><tbody><tr><td><strong><code>text</code></strong></td><td>The text fragment (few sentences or less).</td></tr><tr><td><strong><code>outlet</code></strong></td><td>The source of the text fragments.</td></tr><tr><td><strong><code>label</code></strong></td><td>0 or 1 (biased or unbiased).</td></tr><tr><td><strong><code>topic</code></strong></td><td>The subject of the text fragment.</td></tr><tr><td><strong><code>news_link</code></strong></td><td>URL to the original source.</td></tr><tr><td><strong><code>biased_words</code></strong></td><td>Full words contributing to bias, in a list.</td></tr><tr><td><strong><code>type</code></strong></td><td>Political sentiment (if applicable).</td></tr></tbody></table>

**📄 Research Paper**

{% embed url="https://arxiv.org/abs/2209.14557" %}
