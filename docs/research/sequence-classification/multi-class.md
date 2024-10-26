---
description: Classifying text sequences into one of multiple categories of bias.
icon: traffic-light-go
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

# Multi-class

### Overview of Task

Multi-class classification is very similar to [binary sequence classification](binary.md), except with multiple classes, of which the sequence can be classified into only one.&#x20;

In the context of bias classification, this could be used for ternary classification (e.g. neutral, slightly biased, highly biased) or categorizations (e.g. gender, racial, religious, etc.).

Like binary classification, multi-class classification is typically implemented with an encoder-only model, such as [BERT](https://huggingface.co/docs/transformers/en/model\_doc/bert), to create encodings (i.e. contextual representations) that capture "the meaning" of a sentence. These can be passed to a classification head with multiple output features, each with a probability (the sum of the probabilities is 1).

<figure><img src="../../.gitbook/assets/multi_class_classification_diagram (2).jpg" alt="" width="375"><figcaption></figcaption></figure>

_**Note**: "Multi-class" classification is different from "multi-label" classification, where the text sequence can fall into more than one class at a time. The activation function you choose will determine the distribution of probabilities. For example, softmax activations will sum to 1, whereas sigmoid outputs will assign each class a score of 0-1 (and multiple classes may be within your threshold)._&#x20;

### 🤖 Models:

{% tabs %}
{% tab title="fairlyAspects" %}
### fairlyAspects

The fairlyAspects model was trained on the GUS synthetic corpus, which contains multi-label "type of bias" annotations from the generation process.&#x20;

In the Chrome Extension, this model is used to categorize sentences that have already been classified as biased (e.g. gender, educational, etc.).

Though it wasn't released as part of a paper, the GUS dataset was studied in the GUS-Net paper, and found to have effective coverage across domains.&#x20;

&#x20;**Base Model**: `bert-base-uncased` Dataset: [GUS Synthetic Corpus](https://huggingface.co/datasets/ethical-spectacle/biased-corpus) (37.5k rows)

**🤗Hugging Face Model**

{% embed url="https://huggingface.co/maximuspowers/bias-type-classifier" %}

### Use fairlyAspects

```python
# pip install transformers
from transformers import pipeline
 
classifier = pipeline("text-classification", model="maximuspowers/bias-type-classifier")
result = classifier("Tall people are so clumsy.") # function_to_appy="sigmoid", top_k=11 for multilabel
```
{% endtab %}

{% tab title="UnBIAS" %}
UnBIAS is a framework started in 2023 by Raza. et al at the Vector Institute, and a refresh of the technology proposed in Dbias. This model is the star of the models trained on the BEADs dataset, trained on 3.67M sentence fragments classified into: Neutral, Slightly Biased, and Highly Biased.

**Base Model**: `bert-base-uncased` Dataset: [BEADs](https://huggingface.co/datasets/shainar/BEAD) (3.67M rows)

**🤗Hugging Face Model**

{% embed url="https://huggingface.co/newsmediabias/UnBIAS-classifier" %}

**📄 Research Paper**

{% embed url="https://arxiv.org/abs/2208.05777" %}

#### Use UnBIAS Ternary Classifier:

```python
# pip install transformers
from transformers import pipeline

classifier = pipeline("text-classification", model="newsmediabias/UnBIAS-classifier")
result = classifier("Tall people are so clumsy.")
```
{% endtab %}

{% tab title="👀 Cool Finds" %}
{% hint style="info" %}
This is running list of cool multi-class classification models we've seen and want to learn more about. If you find one that should be here, send it to us on [discord](https://discord.gg/Jn6TYxwRjy).
{% endhint %}

{% embed url="https://huggingface.co/bucketresearch/politicalBiasBERT" %}
Ternary classification of political bias (left, center, right).
{% endembed %}
{% endtab %}
{% endtabs %}

### 💾 Datasets:

{% tabs %}
{% tab title="BEADs" %}
### **Bias Evaluation Across Domains (BEADs) Dataset**

3.67M rows | 2024

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
{% endtab %}

{% tab title="GUS (Corpus)" %}
### Generalizations, Unfairness, and Stereotypes Synthetic Corpus

&#x20;37.5k rows | 2024

The GUS dataset (released in the [GUS-Net paper](https://arxiv.org/abs/2410.08388)), is an entirely synthetic dataset. It was generated by Mistral 7B, and later used for named-entity recognition. The results of GUS-Net showed that the synthetic corpus was effective across domains. and contained less noise than authentic datasets.

**🤗Hugging Face Dataset**

{% embed url="https://huggingface.co/datasets/ethical-spectacle/biased-corpus" %}

**📑 Contents**

<table><thead><tr><th width="213">Field</th><th>Description</th></tr></thead><tbody><tr><td><strong><code>biased_text</code></strong></td><td>The full text fragment where bias is detected.</td></tr><tr><td><strong><code>racial</code></strong></td><td>Binary label, presence (1) or absence (0) of racial bias.</td></tr><tr><td><strong><code>religious</code></strong></td><td>Binary label, presence (1) or absence (0) of religious bias.</td></tr><tr><td><strong><code>gender</code></strong></td><td>Binary label, presence (1) or absence (0) of gender bias.</td></tr><tr><td><strong><code>age</code></strong></td><td>Binary label, presence (1) or absence (0) of age bias.</td></tr><tr><td><strong><code>nationality</code></strong></td><td>Binary label, presence (1) or absence (0) of nationality bias.</td></tr><tr><td><strong><code>sexuality</code></strong></td><td>Binary label, presence (1) or absence (0) of sexuality bias.</td></tr><tr><td><strong><code>socioeconomic</code></strong></td><td>Binary label, presence (1) or absence (0) of socioeconomic bias.</td></tr><tr><td><strong><code>educational</code></strong></td><td>Binary label, presence (1) or absence (0) of educational bias.</td></tr><tr><td><strong><code>disability</code></strong></td><td>Binary label, presence (1) or absence (0) of disability bias.</td></tr><tr><td><strong><code>political</code></strong></td><td>Binary label, presence (1) or absence (0) of political bias.</td></tr><tr><td><strong><code>sentiment</code></strong></td><td>The sentiment given to Mistral 7B in the prompt.</td></tr><tr><td><strong><code>target_group</code></strong></td><td>The group Mistral7B was told to prompt.</td></tr><tr><td><strong><code>statement_type</code></strong></td><td>Type of bias prompted (e.g. "stereotypes," "discriminatory language," "false assumptions," "offensive language," "unfair generalizations").</td></tr></tbody></table>

_Mistral 7B was prompted to generate biased sentences, using the arguments in the table above. This means all sentences are intended to be biased. You may want to supplement the dataset with fair statements (with the same labels), if you're using it on unbiased text fragments._

**📄 Research Paper**

{% embed url="https://arxiv.org/abs/2410.08388" %}

<figure><img src="../../.gitbook/assets/Screenshot 2024-10-10 at 2.59.36 PM.png" alt=""><figcaption></figcaption></figure>

<div align="center">

<figure><img src="../../.gitbook/assets/Screenshot 2024-10-10 at 3.00.03 PM.png" alt="" width="375"><figcaption><p>The GUS dataset is a random sample of the corpus (3739 rows), but this chart should also represent the distribution in the corpus</p></figcaption></figure>

</div>
{% endtab %}

{% tab title="Political" %}
Not added yet
{% endtab %}
{% endtabs %}

***

### How it Works:

{% hint style="info" %}
Train your own multi-label model: 💻 [fairlyAspects Training Notebook](../../../resources/aspects\_classification/aspects\_model\_training.ipynb)
{% endhint %}

<figure><img src="../../.gitbook/assets/embeddings_bert.jpeg" alt=""><figcaption></figcaption></figure>

1. BERT (and other encoder models) <mark style="background-color:yellow;">process an input sequence into a encoding sequence</mark> as shown in the figure above, where self-attention heads encode the contextual words' meaning into each token representation.&#x20;
2. These encodings are the foundation of many NLP tasks, and it's common (in BERT sequence classification) to then <mark style="background-color:yellow;">classify the CLS encoding</mark> into the desired classes (e.g. Neutral, Slightly Biased, Highly Biased).&#x20;
   1. The CLS token (pooler\_output) is a built in pooling mechanism, but you can also use your own pooling mechanism (e.g. averaging all the representations for a mean-pooled representation).
3. `bert-base-uncased` has 768 output features (for each token) and we can <mark style="background-color:yellow;">pass the CLS token into a (768 -> n) dense layer</mark> for multi-class or multi-label classification (where "n" is the number of classes).
   1. The activation function used (e.g. softmax for multi-class, sigmoid for multi-label, etc.) turn the output logits for each of those classes, into a probability for each one.
4. Data engineers will usually set a <mark style="background-color:yellow;">threshold</mark> where the probability gets counted as a presence (can be ubiquitous or individually calcuated for each class).

#### Metrics:

When evaluating models' performance at binary classification, you should try to understand the way positive (biased), negative (neutral) fall into the categories: correct (true) predictions, and incorrect (false) predictions.

Your individual requirements will guide your interpretation (e.g. maybe you REALLY want to avoid false positives).

*   **Confusion Matrix**: Used to visualize the levels of correct and incorrect classifications made, the goal&#x20;

    <figure><img src="../../.gitbook/assets/confusion-matrix.png" alt="" width="188"><figcaption></figcaption></figure>
* **Precision**: $$\frac{TP}{TP + FP}$$
* **Recall**: $$\frac{TP}{TP + FN}$$
* **F1 Score**: $$2 \times \frac{precision \times recall}{precision + recall}$$

***

