---
description: >-
  A directory and implementation of SOTA bias detection research papers, all in
  one place.
icon: microscope
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
The Fair-ly Project was founded and is maintained by researchers of [Ethical Spectacle Research](https://ethicalspectacle.org) and [The Vector Institute](https://vectorinstitute.ai/), who have published groundbreaking bias detection papers such as [Dbias](https://arxiv.org/abs/2208.05777) ('22), [Nbias](https://arxiv.org/abs/2308.01681) ('23), and [GUS-Net](https://arxiv.org/abs/2410.08388) ('24).&#x20;
{% endhint %}

The Fair-ly Project is an open-source collection of resources, such as:

* Research papers
* Blogs and videos
* Datasets and models

**Ethos**: Bias-detection research should be accessible to users and developers of all levels.&#x20;

Here are a few tools we built for using state-of-the-art models in practice, something for everyone :).

{% tabs %}
{% tab title="Browser Extension" %}
### Fair-ly Extension

Our Chrome extension, [Fair-ly](https://chromewebstore.google.com/detail/fair-ly/geoaacpcopfegimhbdemjkocekpncfcc), is a showcase of SOTA models. Anyone can run a bias analysis pipeline/dashboard on their webpage, no code required.

It was created to open-the-door for new people to bias detection technology, by demonstrating it's strengths and weaknesses. The tasks it's intended to preform are:

* [Binary bias classification](research/sequence-classification/binary.md) (sentence -> biased/fair).
* [Bias aspect classification](research/sequence-classification/multi-class.md) (sentence -> gender bias, racial bias, ...).
* [Token classification](research/ner/token-classification.md) of generalizations, unfairness, and stereotypes.

Try this interactive demo for a quick look:

{% @arcade/embed flowId="Du67JkGTIgON60NwyJfU" url="https://app.arcade.software/share/Du67JkGTIgON60NwyJfU" %}

We'd love help on this, so join our [discord](https://discord.gg/Jn6TYxwRjy) and submit a PR on github.
{% endtab %}

{% tab title="Python Package" %}
### Install Our Package:

```bash
pip install the-fairly-project
```

### How to Use The Pipeline:

```python
from fairly import SequenceClassificationPipeline, TokenClassificationPipeline

analyzer = FairlyAnalyzer(bias="ternary", classes=True, top_k_classes=3, ner="gus")
result = analyzer.analyze("Tall people are so clumsy.")
```

Example Response:

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

description will go here later
{% endtab %}

{% tab title="Hosted APIs" %}


If vector could cover the clusters it'd be a big help.
{% endtab %}
{% endtabs %}



If you're interested in contributing or organizing research projects, join our [discord server](https://discord.gg/Jn6TYxwRjy).

### Jump right in

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>Fair-ly Toolkit</strong></td><td>Chrome extension + Python package</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>SOTA Research</strong></td><td>Catch up on what's new with bias detection</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr><tr><td><strong>Join the Project</strong></td><td>Contribute and get in touch with other researchers</td><td></td><td></td><td><a href="broken-reference">Broken link</a></td></tr></tbody></table>
