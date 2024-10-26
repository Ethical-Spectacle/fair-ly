---
description: Last updated Oct 26, 2024 btw :).
---

# To Do List

### Chrome Extension

* [ ] Finish the Chrome Extension page on this site (info about the features), right now it's just copied from the welcome page tab.
* [ ] The popup should render the progress bar if closed and reopened during analysis processing.
* [ ] Switch to UnBIAS ternary classification instead of binary classification.&#x20;
* [ ] Add multi-modal image classification feature for TruBias release
* [ ] Add "Explain" button to the cards in the Explore Tab. It should use [Mbias](https://huggingface.co/newsmediabias/MBIAS) eventually, but we can start with OpenAI API because it's more cost effective.
* [ ] Add a "Debias" option (uses Mbias to retain maximum context, while reducing bias). Could probabily use OpenAI for this until Mbias is hosted too.
* [ ] Make a really nice media: demo with Arcade (with pan and zoom), Chrome Store images and banners, etc.

### PyPI Package

* [ ] Add a multimodal pipeline for TruBias.
* [ ] Add `ner="unbias"` to pipeline args. This would use UnBIAS NER instead of `"gus"` (GUS-Net) so that it would return the biased words instead of the generalizations, unfairness, and stereotype entities in the "ner" dictionary value.
* [ ] Add individual model modules (allow people to call specific ones instead of all through the main pipeline.

### Hosted Endpoints

* [ ] Write page about the endpoints and how people can use them.
* [ ] Need to find someone to cover the costs, using AWS right now, and it's only $50/m per model (BERT models, Mbias would be more). I can add scaling with replicas, and let it scale to 0, so it's efficiently managed.

### Docs (This Site)

* [ ] Ask Dr. Raza to add some info on models/datasets she knows.
* [ ] Add dataset principles to the datasets tab ([FAIR](https://www.go-fair.org/fair-principles/) principles).
* [ ] Write the LLMs section: De-biasing (Mbias), explanation (Mbias), classification LoRA?
* [ ] Add the TruBias paper and details when it's ready (Dr. Raza and Maximus working on it).
* [ ] Add sections in "Research" for Hate Speech detection and political bias detection.

### Discord

* [ ] We should add some channels for sharing active research projects.

### GitHub

* [ ] Add pretty readme files for all the subdirs.
* [ ] Add a ipynb for using the-faily-project package to the resources
