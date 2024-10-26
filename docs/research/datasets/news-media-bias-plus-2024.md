---
description: Multi-modal image and text bias classification dataset (The Vector Institute)
---

# News Media Bias Plus (2024)

90k rows | 2024 | [The Vector Institute](https://huggingface.co/vector-institute)

The dataset includes around 90,000 news articles, curated from a broad spectrum of [reliable](https://www.allsides.com/media-bias) [sources](https://today.yougov.com/politics/articles/49552-trust-in-media-2024-which-news-outlets-americans-trust), including major news outlets from around the globe, from May 2023 to September 2024. These articles were gathered through open data sources using Google RSS, adhering to research ethics guidelines.&#x20;

NMB+ has images, and multi-modal labels for the text + image pair of each news article.

#### 📑 Contents

<table><thead><tr><th width="226">Field</th><th>Description</th></tr></thead><tbody><tr><td><strong><code>unique_id</code></strong></td><td>Unique identifier for each news item. <strong>Each <code>unique_id</code> is associated with the image (top image) for the same news article.</strong></td></tr><tr><td><strong><code>outlet</code></strong></td><td>Publisher of the news article.</td></tr><tr><td><strong><code>headline</code></strong></td><td>Headline of the news article.</td></tr><tr><td><strong><code>article_text</code></strong></td><td>Full text content of the news article.</td></tr><tr><td><strong><code>image_description</code></strong></td><td>Description of the image paired with the article.</td></tr><tr><td><strong><code>image</code></strong></td><td>File path of the image associated with the article.</td></tr><tr><td><strong><code>date_published</code></strong></td><td>Publication date of the news article.</td></tr><tr><td><strong><code>source_url</code></strong></td><td>Original URL of the news article.</td></tr><tr><td><strong><code>canonical_link</code></strong></td><td>Canonical URL of the news article, if different from the source URL.</td></tr><tr><td><strong><code>new_categories</code></strong></td><td>Categories assigned to the article.</td></tr><tr><td><strong><code>news_categories_confidence_scores</code></strong></td><td>Confidence scores for the assigned categories.</td></tr><tr><td><strong><code>text_label</code></strong></td><td><p>Annotation for the textual content, indicating:</p><p><code>'Likely'</code>or <code>'Unlikely'</code>to be disinformation.</p></td></tr><tr><td><strong><code>multimodal_label</code></strong></td><td><p>Annotation for the combined text snippet (first paragraph of the news story) and image content, assessing:</p><p><code>'Likely'</code>or <code>'Unlikely'</code>to be disinformation.</p></td></tr></tbody></table>

#### 🤗HuggingFace Dataset (Request access)



{% embed url="https://huggingface.co/datasets/vector-institute/newsmediabias-plus" %}

#### Website (Official Docs)

{% embed url="https://vectorinstitute.github.io/Newsmediabias-plus/" %}

#### 📰 Blog Post

{% embed url="https://vectorinstitute.ai/new-multimodal-dataset-will-help-in-the-development-of-ethical-ai-systems/" %}
