---
icon: image-landscape
description: Bias analysis of image and text pairs.
---

# MultimodalAnalyzer Pipeline

### 1. Import:

```python
from fairly import MultimodalAnalyzer
```

### 2. Initialize the Module:

```python
multimodal_pipeline = MultimodalAnalyzer()
```

### 3. Format Image as PIL

```python
# image formatting
from PIL import Image
img_path = "/content/random_person.jpg"
img = Image.open(img_path)
```

### 4. Run Multimodal Bias Analysis

```python
result = multimodal_pipeline.analyze(text="Top 10 Smartest People Ever", image=img)
```

### 5. Example Output

<pre class="language-json"><code class="lang-json">{
    'text': 'Top 10 Smartest People Ever', 
    'image': &#x3C;PIL.JpegImagePlugin.JpegImageFile image mode=RGB size=1200x1499 at 0x7A82D0295360>, 
    'prob': 0.5121262669563293, 
<strong>    'label': 'Biased'
</strong>}
</code></pre>
