import torch
from torch import nn
from transformers import AutoModel
from huggingface_hub import hf_hub_download
from typing import Literal
import json

class FNDClip(nn.Module):
    def __init__(
            self,
            text_encoder_id_or_path: str,
            image_encoder_id_or_path: str,
            projection_dim: int,
            fusion_method: Literal["concat", "align", "cosine_similarity"] = "concat",
            proj_dropout: float = 0.1,
            fusion_dropout: float = 0.1,
            num_classes: int = 1,
        ) -> None:
        super().__init__()

        self.fusion_method = fusion_method
        self.projection_dim = projection_dim
        self.num_classes = num_classes

        ##### Text Encoder
        self.text_encoder = AutoModel.from_pretrained(text_encoder_id_or_path)
        self.text_projection = nn.Sequential(
            nn.Linear(self.text_encoder.config.hidden_size, self.projection_dim),
            nn.Dropout(proj_dropout),
        )

        ##### Image Encoder (using ResNet34 from AutoModel with timm)
        self.image_encoder = AutoModel.from_pretrained(image_encoder_id_or_path, trust_remote_code=True)
        self.image_encoder.classifier = nn.Identity()  # rm the classification head
        self.image_projection = nn.Sequential(
            nn.Linear(512, self.projection_dim),
            nn.Dropout(proj_dropout),
        )

        ##### Fusion Layer
        fusion_input_dim = self.projection_dim * 2 if fusion_method == "concat" else self.projection_dim
        self.fusion_layer = nn.Sequential(
            nn.Dropout(fusion_dropout),
            nn.Linear(fusion_input_dim, self.projection_dim),
            nn.GELU(),
            nn.Dropout(fusion_dropout),
        )

        ##### Classification Layer
        self.classifier = nn.Linear(self.projection_dim, self.num_classes)

    def forward(self, pixel_values: torch.Tensor, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        ##### Text Encoder Projection #####
        full_text_features = self.text_encoder(input_ids=input_ids, attention_mask=attention_mask, return_dict=True).last_hidden_state
        full_text_features = full_text_features[:, 0, :]  # using cls token
        full_text_features = self.text_projection(full_text_features)

        ##### Image Encoder Projection #####
        resnet_image_features = self.image_encoder(pixel_values=pixel_values).last_hidden_state
        
        # global average pooling for resent image features (bad idea? dim problems)
        resnet_image_features = resnet_image_features.mean(dim=[-2, -1])
        resnet_image_features = self.image_projection(resnet_image_features)

        ##### Fusion and Classification #####
        if self.fusion_method == "concat":
            fused_features = torch.cat([full_text_features, resnet_image_features], dim=-1)
        else:
            fused_features = full_text_features * resnet_image_features # don't think this works atm (should be dot prod)

        # fusion and classifier layers
        fused_features = self.fusion_layer(fused_features)
        classification_output = self.classifier(fused_features)

        # activate classification output
        classification_output = torch.sigmoid(classification_output)

        return classification_output

def load_fnd_clip():
    config_path = hf_hub_download(repo_id="maximuspowers/multimodal-bias-classifier", filename="config.json")
    with open(config_path, "r") as f:
        config = json.load(f)

    model = FNDClip(
        text_encoder_id_or_path=config["text_encoder_id_or_path"],
        image_encoder_id_or_path="microsoft/resnet-34",
        projection_dim=config["projection_dim"],
        fusion_method=config["fusion_method"],
        proj_dropout=config["proj_dropout"],
        fusion_dropout=config["fusion_dropout"],
        num_classes=config["num_classes"]
    )

    model_weights_path = hf_hub_download(repo_id="maximuspowers/multimodal-bias-classifier", filename="model_weights.pth")
    checkpoint = torch.load(model_weights_path, map_location=torch.device('cpu'))
    model.load_state_dict(checkpoint, strict=False)

    return model
