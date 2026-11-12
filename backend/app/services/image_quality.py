import io
import hashlib
from typing import Dict, Any, Tuple
from PIL import Image, ExifTags
import numpy as np
import cv2

def compute_image_hash(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of image bytes for duplicate detection."""
    return hashlib.sha256(file_bytes).hexdigest()

def extract_exif_metadata(pil_image: Image.Image) -> Dict[str, Any]:
    """Extracts available EXIF tags including camera info and client timestamps."""
    exif_data = {}
    try:
        raw_exif = pil_image._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                if tag_name not in ["MakerNote", "UserComment"]:  # Skip bulky binary tags
                    if isinstance(value, (bytes, bytearray)):
                        continue
                    exif_data[tag_name] = str(value)
    except Exception as e:
        exif_data["exif_error"] = str(e)
    return exif_data

def assess_image_quality(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Validates image file and performs quality assessment using OpenCV & PIL:
    - Verifies file integrity and format
    - Measures resolution (minimum 480x480)
    - Measures blur using Laplacian variance
    - Measures brightness / illumination
    - Extracts EXIF timestamps and device metadata
    """
    result = {
        "is_valid": True,
        "error": None,
        "filename": filename,
        "file_size": len(file_bytes),
        "file_type": "image/jpeg",
        "image_hash": compute_image_hash(file_bytes),
        "resolution": "Unknown",
        "width": 0,
        "height": 0,
        "blur_score": 0.0,
        "brightness_score": 0.0,
        "quality_status": "PASSED",
        "quality_warnings": [],
        "exif_metadata": {},
        "client_timestamp": None,
        "device_model": "Unknown Device"
    }

    # 1. Format check
    lower_name = filename.lower()
    if lower_name.endswith(('.jpg', '.jpeg')):
        result["file_type"] = "image/jpeg"
    elif lower_name.endswith('.png'):
        result["file_type"] = "image/png"
    elif lower_name.endswith('.webp'):
        result["file_type"] = "image/webp"
    else:
        result["is_valid"] = False
        result["error"] = "Unsupported file format. Please upload JPG, JPEG, or PNG."
        result["quality_status"] = "REJECTED_UNSUPPORTED_FORMAT"
        return result

    # 2. File size check (15 MB max, 10 KB min)
    if len(file_bytes) > 15 * 1024 * 1024:
        result["is_valid"] = False
        result["error"] = "File size exceeds 15 MB limit."
        result["quality_status"] = "REJECTED_OVERSIZED"
        return result
    if len(file_bytes) < 10 * 1024:
        result["is_valid"] = False
        result["error"] = "File size too small or empty (< 10 KB)."
        result["quality_status"] = "REJECTED_CORRUPT"
        return result

    # 3. PIL Image Integrity & Resolution Check
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        pil_img.verify()  # verify integrity
        # Re-open because verify() closes the stream
        pil_img = Image.open(io.BytesIO(file_bytes))
        width, height = pil_img.size
        result["width"] = width
        result["height"] = height
        result["resolution"] = f"{width}x{height}"

        # Extract EXIF
        exif = extract_exif_metadata(pil_img)
        result["exif_metadata"] = exif
        if "DateTimeOriginal" in exif:
            result["client_timestamp"] = exif["DateTimeOriginal"]
        elif "DateTime" in exif:
            result["client_timestamp"] = exif["DateTime"]
        
        if "Make" in exif or "Model" in exif:
            make = exif.get("Make", "").strip()
            model = exif.get("Model", "").strip()
            result["device_model"] = f"{make} {model}".strip()

        # Resolution validation
        if width < 300 or height < 300:
            result["quality_warnings"].append("Low resolution: Image may not contain sufficient foliar detail for AI analysis.")
            result["quality_status"] = "REJECTED_LOW_RESOLUTION"
            result["is_valid"] = False
            result["error"] = f"Image resolution {width}x{height} is too low. Minimum required is 300x300 pixels."
            return result
    except Exception as e:
        result["is_valid"] = False
        result["error"] = f"Corrupted or invalid image file: {str(e)}"
        result["quality_status"] = "REJECTED_CORRUPT"
        return result

    # 4. OpenCV Quality Checks (Blur & Brightness)
    try:
        np_arr = np.frombuffer(file_bytes, np.uint8)
        cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if cv_img is not None:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

            # Blur detection via Laplacian Variance
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            result["blur_score"] = round(laplacian_var, 2)

            # Brightness detection via Mean Gray Intensity
            brightness_val = float(np.mean(gray))
            result["brightness_score"] = round(brightness_val, 2)

            # Evaluation thresholds
            if laplacian_var < 35.0:
                result["quality_warnings"].append("High motion blur detected. Foliar symptoms may be indistinct.")
                result["quality_status"] = "WARNING_BLURRY"
            elif brightness_val < 35.0:
                result["quality_warnings"].append("Under-exposed / Dark lighting conditions detected.")
                result["quality_status"] = "WARNING_TOO_DARK"
            elif brightness_val > 225.0:
                result["quality_warnings"].append("Over-exposed / Glare detected on leaf canopy.")
                result["quality_status"] = "WARNING_TOO_BRIGHT"
            else:
                result["quality_status"] = "PASSED"
    except Exception as e:
        result["quality_warnings"].append(f"OpenCV analyzer note: {str(e)}")

    return result

