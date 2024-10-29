---
icon: microscope
description: >-
  A directory and implementation of SOTA bias detection research papers, all in
  one place.
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Welcome to The Fair-ly Project

{% hint style="info" %}
The Fair-ly Project was founded and is maintained by ML researchers of [Ethical Spectacle Research](https://ethicalspectacle.org) and [The Vector Institute](https://vectorinstitute.ai/), who have published ground-breaking bias detection papers such as [Dbias](https://arxiv.org/abs/2208.05777) ('22), [Nbias](https://arxiv.org/abs/2308.01681) ('23), and [GUS-Net](https://arxiv.org/abs/2410.08388) ('24).&#x20;
{% endhint %}

The Fair-ly Project is an open-source collection of resources, such as:

* Research papers
* Blogs and videos
* Datasets and models

**Ethos**: Bias-detection research should be accessible to users and developers of all levels.&#x20;

***

### 🛠️ Fair-ly Toolkit

Here are a few tools we built for using state-of-the-art models in practice, something for everyone :).

{% tabs %}
{% tab title="Browser Extension" %}
### Fair-ly Extension

Our Chrome extension, [Fair-ly](https://chromewebstore.google.com/detail/fair-ly/geoaacpcopfegimhbdemjkocekpncfcc), is a showcase of SOTA models. Anyone can run a bias analysis pipeline/dashboard on their webpage, no code required.

{% embed url="https://chromewebstore.google.com/detail/fair-ly/geoaacpcopfegimhbdemjkocekpncfcc" %}

It was created to open-the-door for new people to bias detection technology, by demonstrating it's strengths and weaknesses. The tasks it's intended to preform are:

* [Binary bias classification](research/sequence-classification/binary.md) (sentence -> biased/fair).
* [Bias aspect classification](research/sequence-classification/multi-class.md) (sentence -> gender bias, racial bias, ...).
* [Token classification](research/ner/token-classification.md) of generalizations, unfairness, and stereotypes.

Try this interactive demo for a quick look:

{% @arcade/embed flowId="Du67JkGTIgON60NwyJfU" url="https://app.arcade.software/share/Du67JkGTIgON60NwyJfU" %}
{% endtab %}

{% tab title="Python Package" %}
{% hint style="info" %}
Walk through and run all the pipelines in this [Google Colab Notebook 💻](https://colab.research.google.com/drive/1Vwd8GuMoJNOiKDwryVgf0QFS2zKVVNlf?usp=sharing)
{% endhint %}

### Install Our Package:

```bash
pip install the-fairly-project
```

### How to Use The Pipeline:

```python
from fairly import TextAnalyzer

analyzer = TextAnalyzer(bias="ternary", classes=True, top_k_classes=3, ner="gus")
result = analyzer.analyze("Tall people are so clumsy.")
```

### Example Response:

```json5
{
'text': {
    'text': 'Tall people are so clumsy.', 
    'label': 'Slightly Biased', 
    'score': 0.6829080581665039, 
    'aspects': {
      'physical': 0.9650779366493225, 
      'gender': 0.024978743866086006, 
      'socioeconomic': 0.023334791883826256
    }
}, 
'ner': [
    {'token': 'tall', 'labels': ['B-STEREO', 'B-GEN', 'B-UNFAIR']}, 
    {'token': 'people', 'labels': ['I-STEREO', 'I-GEN', 'I-UNFAIR']}, 
    {'token': 'are', 'labels': ['I-STEREO']}, 
    {'token': 'so', 'labels': ['I-STEREO']}, 
    {'token': 'clumsy', 'labels': ['I-STEREO', 'B-UNFAIR', 'I-UNFAIR']},
    {'token': '.', 'labels': ['I-STEREO', 'I-UNFAIR']}
]
}
```

<table data-view="cards"><thead><tr><th></th><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td></td><td><code>TextAnalyzer</code> Docs</td><td></td><td><a href="toolkit/python-package/textanalyzer-pipeline.md">textanalyzer-pipeline.md</a></td></tr><tr><td></td><td><code>MultimodalAnalyzer</code> Docs</td><td></td><td><a href="toolkit/python-package/multimodalanalyzer-pipeline.md">multimodalanalyzer-pipeline.md</a></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table>
{% endtab %}

{% tab title="Hosted APIs" %}
<table data-view="cards"><thead><tr><th></th><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td></td><td></td><td>Binary Classification API</td><td><a href="toolkit/hosted-apis.md#binary-bias-classification">#binary-bias-classification</a></td></tr><tr><td></td><td></td><td>Types-of-bias Classification API</td><td><a href="toolkit/hosted-apis.md#fairlyaspects-types-of-bias">#fairlyaspects-types-of-bias</a></td></tr><tr><td></td><td></td><td>GUS-Net (Token Classification) API</td><td><a href="toolkit/hosted-apis.md#token-classification-of-generalizations-unfairness-and-stereotypes">#token-classification-of-generalizations-unfairness-and-stereotypes</a></td></tr></tbody></table>
{% endtab %}
{% endtabs %}

{% hint style="info" %}
If you're interested in contributing to the open-source tool-kit, check out our [GitHub](https://github.com/Ethical-Spectacle/fair-ly) and join our [Discord](https://discord.com/invite/Jn6TYxwRjy).
{% endhint %}

***

### 🧠 Learn

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Recent Papers</strong></td><td>Papers to cite ;)</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>Binary Classification</strong></td><td>Classifying text sequences as "Biased" or "Fair."</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>Multi-Class Classification</strong></td><td>Classifying text sequences into more specific classes.</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>Named-Entity Recognitio</strong>n</td><td>Classifying tokens (words) that contain bias.</td><td></td><td></td><td></td></tr><tr><td><strong>Multimodal Classification</strong></td><td>Classifying image and text pairs for bias.</td><td></td><td></td><td></td></tr><tr><td><strong>Discord</strong></td><td>Ask questions or share a project.</td><td></td><td></td><td></td></tr></tbody></table>
