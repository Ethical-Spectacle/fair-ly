import torch
from transformers import BertTokenizerFast, BertForTokenClassification

class GUSNetModel:
    def __init__(self):
        self.tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
        self.model = BertForTokenClassification.from_pretrained('ethical-spectacle/social-bias-ner')
        self.model.eval()
        self.model.to('cuda' if torch.cuda.is_available() else 'cpu')

        self.id2label = {
            0: 'O', 
            1: 'B-STEREO', 
            2: 'I-STEREO', 
            3: 'B-GEN',
            4: 'I-GEN', 
            5: 'B-UNFAIR', 
            6: 'I-UNFAIR'
        }

    def classify(self, sentence):
        inputs = self.tokenizer(sentence, return_tensors="pt", padding=True, truncation=True, max_length=128)
        input_ids = inputs['input_ids'].to(self.model.device)
        attention_mask = inputs['attention_mask'].to(self.model.device)

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probabilities = torch.sigmoid(logits)
            predicted_labels = (probabilities > 0.5).int()

        tokens = self.tokenizer.convert_ids_to_tokens(input_ids[0])
        result = []
        for i, token in enumerate(tokens):
            if token not in self.tokenizer.all_special_tokens:
                label_indices = (predicted_labels[0][i] == 1).nonzero(as_tuple=False).squeeze(-1)
                labels = [self.id2label[idx.item()] for idx in label_indices] if label_indices.numel() > 0 else ['O']
                result.append({"token": token, "labels": labels})

        return result
