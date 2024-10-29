---
icon: network-wired
description: Bias analysis models on free hosted endpoints.
---

# Hosted APIs

{% hint style="info" %}
These models are intended for use in frontend applications. For Python data analysis and backends, you should try our [PyPI package](python-package/), which runs locally.
{% endhint %}

### [fairlyAspects](https://huggingface.co/maximuspowers/bias-type-classifier) (types-of bias)

Endpoint: [`https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud`](https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud)

{% embed url="https://huggingface.co/maximuspowers/bias-type-classifier" %}

{% tabs %}
{% tab title="JavaScript" %}
```javascript
async function query(data) {
	const response = await fetch(
		"https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud",
		{
			headers: { 
				"Accept" : "application/json",
				"Content-Type": "application/json" 
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({
    "inputs": "Your sentence for bias aspect classification",
    "parameters": {
        "top_k": 3,
        "function_to_apply": "sigmoid"
    }
}).then((response) => {
	console.log(JSON.stringify(response));
});
```

#### All parameters are optional

* `top_k`: Number of classes and scores to return. Defaults to return all 11 classes and their scores.
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}

{% tab title="Python" %}
```python
import requests

API_URL = "https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud"
headers = {
	"Accept" : "application/json",
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

output = query({
	"inputs": "Your sentence for bias aspect classification",
	"parameters": {
		"top_k": 3,
		"function_to_apply": "sigmoid"
	}
})
```

#### All parameters are optional

* `top_k`: Number of classes and scores to return. Defaults to return all 11 classes and their scores.
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}

{% tab title="cURL" %}
<pre class="language-bash"><code class="lang-bash"><strong>curl "https://t41xs75wejr14zht.us-east-1.aws.endpoints.huggingface.cloud" \
</strong>-X POST \
-H "Accept: application/json" \-H "Content-Type: application/json" \
-d '{
    "inputs": "Your sentence for bias aspect classification",
    "parameters": {
        "top_k": 3,
        "function_to_apply": "sigmoid"
    }
}'
</code></pre>

#### All parameters are optional

* `top_k`: Number of classes and scores to return. Defaults to return all 11 classes and their scores.
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}
{% endtabs %}

***

### [Binary Bias Classification](../research/sequence-classification/binary.md)

Endpoint: [`https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud`](https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud)

{% embed url="https://huggingface.co/valurank/distilroberta-bias" %}
Similar architecture to [Dbias](https://arxiv.org/abs/2208.05777).
{% endembed %}

{% tabs %}
{% tab title="JavaScript" %}
```javascript
async function query(data) {
	const response = await fetch(
		"https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud",
		{
			headers: { 
				"Accept" : "application/json",
				"Content-Type": "application/json" 
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({
    "inputs": "Your sentence for binary bias classification",
    "parameters": {
        "top_k": 2,
        "function_to_apply": "sigmoid"
    }
}).then((response) => {
	console.log(JSON.stringify(response));
});
```

#### All parameters are optional

* `top_k`: Can be `1` or `2`, defaults to `1`, meaning it just returns the highest probable class (Biased or Neutral).
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}

{% tab title="Python" %}
```python
import requests
```

#### All parameters are optional

* `top_k`: Can be `1` or `2`, defaults to `1`, meaning it just returns the highest probable class (Biased or Neutral).
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}

{% tab title="cURL" %}
```bash
curl "https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud" \
-X POST \
-H "Accept: application/json" \-H "Content-Type: application/json" \
-d '{
    "inputs": "Your sentence for binary bias classification",
    "parameters": {
        "top_k": 2,
        "function_to_apply": "sigmoid"
    }
}'
```

#### All parameters are optional

* `top_k`: Can be `1` or `2`, defaults to `1`, meaning it just returns the highest probable class (Biased or Neutral).
* `function_to_apply`: Activation function to use on the model outputs. Can be `"sigmoid"`(multi-label), `"softmax"` (mult-class), or `None` for raw logits. Defaults to `"softmax"`.
{% endtab %}
{% endtabs %}

***

### [Token Classification](../research/ner/token-classification.md) (of generalizations, unfairness, and stereotypes)

Endpoint: [`https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud`](https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud)

{% embed url="https://huggingface.co/ethical-spectacle/social-bias-ner" %}
[GUS-Net](https://arxiv.org/abs/2410.08388) Model
{% endembed %}

{% tabs %}
{% tab title="JavaScript" %}
```javascript
async function query(data) {
	const response = await fetch(
		"https://mo5fr3ll9qufbwuy.us-east-1.aws.endpoints.huggingface.cloud",
		{
			headers: { 
				"Accept" : "application/json",
				"Content-Type": "application/json" 
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({
    "inputs": "Hello world!",
    "parameters": {}
}).then((response) => {
	console.log(JSON.stringify(response));
});
```

\*_No params needed_\*
{% endtab %}

{% tab title="Python" %}
```python
import requests

API_URL = "https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud"
headers = {
	"Accept" : "application/json",
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

output = query({
	"inputs": "I like you. I love you",
	"parameters": {
		"top_k": 2,
		"function_to_apply": "sigmoid"
	}
})
```

\*_No params needed_\*
{% endtab %}

{% tab title="cURL" %}
```bash
curl "https://e29pozks7ptdl5gw.us-east-1.aws.endpoints.huggingface.cloud" \
-X POST \
-H "Accept: application/json" \-H "Content-Type: application/json" \
-d '{
    "inputs": "I like you. I love you",
    "parameters": {
        "top_k": 2,
        "function_to_apply": "sigmoid"
    }
}'
```

\*_No params needed_\*
{% endtab %}
{% endtabs %}

### Example Response:

```json
[
  {
    "token": "data",
    "labels": [
      "B-STEREO",
      "B-GEN"
    ]
  },
  {
    "token": "scientists",
    "labels": [
      "B-GEN",
      "I-GEN"
    ]
  },
  {
    "token": "are",
    "labels": [
      "I-STEREO"
    ]
  },
  {
    "token": "so",
    "labels": [
      "I-STEREO"
    ]
  },
  {
    "token": "smart",
    "labels": [
      "I-STEREO"
    ]
  }
]
```

