from transformers import pipeline

class UnbiasModel:
    def __init__(self):
        self.classifier = pipeline("text-classification", model="newsmediabias/UnBIAS-classifier")

    def classify(self, sentence):
        result = self.classifier(sentence)[0]
        return {"label": result['label'], "score": result['score']}
