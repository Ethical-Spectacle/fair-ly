from transformers import pipeline

class FairlyAspectsModel:
    def __init__(self, top_k_classes=11):
        self.classifier = pipeline("text-classification", model="maximuspowers/bias-type-classifier", function_to_apply="sigmoid")
        self.top_k_classes = top_k_classes

    def classify(self, sentence):
        results = self.classifier(sentence, top_k=self.top_k_classes)
        aspects = {result['label']: result['score'] for result in results}
        return {"aspects": aspects}
