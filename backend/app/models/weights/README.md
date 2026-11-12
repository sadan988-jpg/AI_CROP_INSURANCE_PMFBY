# PMFBY Model Weights Directory

This directory stores trained deep learning model weights for production deployment.

## Expected Model Files:
1. `crop_disease_classifier.pt`:
   - Architecture: ResNet-50 / EfficientNet-B2 fine-tuned on PlantVillage & PlantDoc datasets.
   - Classes: 38 crop disease pathologies across Paddy, Cotton, Wheat, Soybean, Maize, Sugarcane.
   - Input: 224x224 RGB image tensor.

2. `pest_yolov8.pt`:
   - Architecture: Ultralytics YOLOv8n / YOLOv8s fine-tuned on IP102 insect pest dataset.
   - Classes: 102 insect pest species (Fall Armyworm, Pink Bollworm, Brown Planthopper, Stem Borer, Whitefly, Aphids).
   - Input: 640x640 RGB image tensor.

## Fallback Engine:
If `.pt` model files are not present in this folder, the PMFBY analytics engine automatically operates using the integrated **OpenCV Computer Vision Diagnostic Engine** (`damage_detection.py`), computing real foliar color-space segmentation (HSV/LAB), lesion contour extraction, chlorosis/necrosis ratios, and pathology classification on the actual pixel data of uploaded photos.

