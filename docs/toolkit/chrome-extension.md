---
icon: chrome
description: A no-code bias analysis toolkit for webpages, right in your browser.
---

# Chrome Extension

Our Chrome extension, [Fair-ly](https://chromewebstore.google.com/detail/fair-ly/geoaacpcopfegimhbdemjkocekpncfcc), is a showcase of SOTA models. Anyone can run a bias analysis pipeline/dashboard on their webpage, no code required.

It was created to open-the-door for new people to bias detection technology, by demonstrating it's strengths and weaknesses. The tasks it's intended to preform are:

* [Binary bias classification](../research/sequence-classification/binary.md) (sentence -> biased/fair).
* [Bias aspect classification](../research/sequence-classification/multi-class.md) (sentence -> gender bias, racial bias, ...).
* [Token classification](../research/ner/token-classification.md) of generalizations, unfairness, and stereotypes.

Try this interactive demo for a quick look:

{% @arcade/embed flowId="Du67JkGTIgON60NwyJfU" url="https://app.arcade.software/share/Du67JkGTIgON60NwyJfU" %}

We'd love help on this, so join our [discord](https://discord.gg/Jn6TYxwRjy) and submit a PR on [github](https://github.com/Ethical-Spectacle/fair-ly/tree/main).
