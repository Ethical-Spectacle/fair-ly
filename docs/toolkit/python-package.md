---
icon: python
description: Bias analysis pipelines and SOTA models, for Python users
---

# Python Package

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
