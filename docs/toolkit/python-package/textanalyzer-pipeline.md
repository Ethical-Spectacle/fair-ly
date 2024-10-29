---
icon: text-size
description: Python module for using NLP bias analysis models.
---

# TextAnalyzer Pipeline

### 1. Import&#x20;

```python
# pip install the-fairly-project
from fairly import TextAnalyzer
```

### 2. Initialize the Module

```python
text_pipeline = TextAnalyzer(
    bias="ternary", # defaults to None
    classes=True, # defaults to False
    top_k_classes=3, # defaults to 3
    ner="gus" 
    )
```

#### Customize your pipeline

<table data-full-width="false"><thead><tr><th width="185">Args</th><th>Options</th></tr></thead><tbody><tr><td><code>bias</code></td><td><p>Classify bias at the sentence level (<a href="../../research/sequence-classification/">sequence classification</a>):</p><ul><li><code>None</code>: Default (no bias sequence classification).</li><li><code>"ternary"</code>: Uses <a href="https://huggingface.co/newsmediabias/UnBIAS-classifier">Unbias</a> (e.g. Neutral, Slightly Biased, Highly Biased). <a href="../../research/sequence-classification/multi-class.md">More info</a>.</li><li><code>"binary"</code>: Not implemented yet. (e.g. Fair, Biased) <a href="../../research/sequence-classification/binary.md">More info</a>.</li></ul><p>When set to <code>ternary</code> this adds two fields to the "text" dictionary in the return dictionary: <code>label</code> (as shown above) and <code>score</code> (0-1).</p></td></tr><tr><td><code>classes</code></td><td><p>Classify the types of bias a sentence contains:</p><ul><li><code>False</code>: Default (no bias aspects classification).</li><li><code>True</code>: Uses <a href="https://huggingface.co/maximuspowers/bias-type-classifier">fairlyAspects</a> (11 classes). <a href="../../research/sequence-classification/multi-class.md">More info</a>.</li></ul><p>When set to <code>True</code>, this adds one field to the "text" dictionary in the return dictionary: <code>aspects</code>(which contains <code>top_k_classes</code> in [CLASS]: [SCORE] format).</p></td></tr><tr><td><code>top_k_classes</code></td><td><p>Number of classes returned in the <code>aspects</code> dict.</p><ul><li>Int: <code>1</code> to <code>11</code> (defaults to <code>3</code>).</li></ul><p>Only relevant when <code>classes</code> is set to <code>True</code>.</p></td></tr><tr><td><code>ner</code></td><td><p>Run <a href="../../research/ner/token-classification.md">named-entity recognition</a> on the text sequence.</p><ul><li><code>None</code>: Default (no token classification)</li><li><code>"gus"</code>: Uses <a href="https://huggingface.co/ethical-spectacle/social-bias-ner">GUS-Net</a> (e.g. GEN, UNFAIR, STEREO). <a href="../../research/ner/token-classification.md">More in</a><a href="../../research/ner/token-classification.md">fo</a>.</li></ul><p>When in use, it appends a new <code>"ner"</code> dictionary to the return dictionary.</p></td></tr></tbody></table>

### 3. Run Bias Analysis

```python
result = text_pipeline.analyze("Data scientists are so smart")
```

### 4. Example Output

```json
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
