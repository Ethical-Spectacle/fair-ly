from fairly.models.unbias import UnbiasModel
from fairly.models.fairly_aspects import FairlyAspectsModel
from fairly.models.gus_net import GUSNetModel

class TextAnalyzer:
    def __init__(self, bias=None, classes=False, top_k_classes=3, ner=None):
        self.bias = bias
        self.classes = classes
        self.top_k_classes = top_k_classes
        self.ner = ner

        ### init models if they're gonna be used (install happens here) ##

        # make a fairlyBinary model soon (probably with BEADs, favoring unbiased)
        # if self.bias == "binary": self.fairly_binary = #doesn't exist yet

        # UnBIAS, ternary seq classifier
        if self.bias == "ternary": self.unbias_model = UnbiasModel()

        # fairlyAspects, multi-label type of bias classifier
        if self.classes: self.fairly_aspects_model = FairlyAspectsModel(top_k_classes=self.top_k_classes)

        # generalizations unfairness and stereotypes NER
        if self.ner == "gus": self.gus_net_model = GUSNetModel()

        # nbias for biased word classificaion (check w Raza, I think she has a newer model)
        # if self.ner == "words": self.nbias_model = #doesn't exist yet

    def analyze(self, sentence):
        # return obj
        result = {"text": {"text": sentence}}

        # add handling for binary instead of ternary

        # use UnBIAS to classify the sentence as neutral, slightly biased, or highly biased
        if self.bias == "ternary":
            bias_result = self.unbias_model.classify(sentence)
            result['text'].update(bias_result)

        # use fairlyAspects to classify the sentence into different types of bias
        if self.classes:
            aspects_result = self.fairly_aspects_model.classify(sentence)
            result['text'].update(aspects_result)

        # use GUSNet to classify the sentence for generalizations, unfairness, and stereotypes
        if self.ner == "gus":
            ner_result = self.gus_net_model.classify(sentence)
            result['ner'] = ner_result

        # add handling for biased words instead of gus

        return result




# ---------------------------- Example analyze() output ---------------------------- #
#
# analyzer = FairlyAnalyzer(bias="ternary", classes=True, top_k_classes=3, ner="gus")
# result = analyzer.analyze("Tall people are so clumsy.")
#
# {
# 'text': {
#     'text': 'Tall people are so clumsy.', 
#     'label': 'Slightly Biased', 
#     'score': 0.6829080581665039, 
#     'aspects': {
#       'physical': 0.9650779366493225, 
#       'gender': 0.024978743866086006, 
#       'socioeconomic': 0.023334791883826256
#     }
# }, 
# 'ner': [
#     {'token': 'tall', 'labels': ['B-STEREO', 'B-GEN', 'B-UNFAIR']}, 
#     {'token': 'people', 'labels': ['I-STEREO', 'I-GEN', 'I-UNFAIR']}, 
#     {'token': 'are', 'labels': ['I-STEREO']}, 
#     {'token': 'so', 'labels': ['I-STEREO']}, 
#     {'token': 'clumsy', 'labels': ['I-STEREO', 'B-UNFAIR', 'I-UNFAIR']},
#     {'token': '.', 'labels': ['I-STEREO', 'I-UNFAIR']}
#     ]
# }