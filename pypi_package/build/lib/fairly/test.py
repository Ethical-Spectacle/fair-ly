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
image_url = "https://via.placeholder.com/224"  # Example image URL
response = requests.get(image_url)
sample_image = Image.open(BytesIO(response.content)).convert("RGB")

# Ensure the image is resized to fit the model’s expected dimensions (e.g., 224x224)
sample_image = sample_image.resize((224, 224))

# Convert the image to a tensor
sample_image_tensor = torch.tensor([torchvision.transforms.ToTensor()(sample_image)])

# Run analysis
result = analyzer.analyze(sentence=sample_text, image=sample_image_tensor)

# Print the result
print("Analysis Result:", result)
