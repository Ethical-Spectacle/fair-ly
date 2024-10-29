from fairly.models.fnd_clip import FNDClip, load_fnd_clip
import torch
from transformers import AutoTokenizer
from torchvision import transforms
from PIL import Image

class MultimodalAnalyzer:
    def __init__(self):
        # Load the model and tokenizer
        self.model = load_fnd_clip()
        self.model.eval()
        self.text_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        
        # preprocess img
        self.image_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def analyze(self, sentence, image):
        # tokenize the text
        text_inputs = self.text_tokenizer(
            sentence, 
            return_tensors="pt", 
            padding="max_length", 
            truncation=True, 
            max_length=512
        )

        image_input = self.image_transform(image).unsqueeze(0) # add batch dim

        # run forward pass
        with torch.no_grad():
            prob = torch.sigmoid(self.model(
                pixel_values=image_input, 
                input_ids=text_inputs["input_ids"], 
                attention_mask=text_inputs["attention_mask"]
            ))

        result = prob.round().int().item()

        return {
            "text": sentence,
            "image": image,
            "prob": prob.item(),
            "label": "Biased" if result == 1 else "Unbiased"
        }
