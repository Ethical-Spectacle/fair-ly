from fairly import FairlyAnalyzer

analyzer = FairlyAnalyzer(bias="ternary", classes=True, top_k_classes=3, ner="gus")
result = analyzer.analyze("Tall people are so clumsy.")

print(result)
