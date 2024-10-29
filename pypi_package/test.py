import torch
import torchvision
from PIL import Image
import requests
from io import BytesIO
from fairly.multimodal_analyzer import MultimodalAnalyzer  # Replace with your package name

# Initialize MultimodalAnalyzer
analyzer = MultimodalAnalyzer()

# Sample text input
sample_text = "This is a test sentence that could have bias."

# Sample image input (replace URL with any valid image URL or use a local file path)
sample_image = Image.open('President_Barack_Obama.jpg')

# Run analysis
result = analyzer.analyze(sentence=sample_text, image=sample_image)

# Print the result
print("Analysis Result:", result)
