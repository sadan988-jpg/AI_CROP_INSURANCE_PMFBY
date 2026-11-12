import os
import cv2
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

def analyze_foliar_damage_opencv(
    image_input: Any, # file path str, bytes, or numpy array
    target_crop_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    OpenCV Foliar Color-Space Segmentation & Physical Damage Estimator:
    1. Converts image to HSV & LAB color spaces.
    2. Segments healthy vegetative tissue vs chlorotic & necrotic lesions.
    3. Calculates quantitative affected leaf percentage from actual pixel ratios.
    4. Extracts lesion contours and generates normalized bounding boxes.
    5. Analyzes physical crop lodging via line orientation analysis.
    """
    # 1. Load image into numpy BGR array
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            return {"success": False, "error": f"Image file not found: {image_input}"}
        img_bgr = cv2.imread(image_input)
    elif isinstance(image_input, bytes):
        np_arr = np.frombuffer(image_input, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    elif isinstance(image_input, np.ndarray):
        img_bgr = image_input
    else:
        return {"success": False, "error": "Invalid image format provided."}

    if img_bgr is None:
        return {"success": False, "error": "Unable to decode image bytes with OpenCV."}

    height, width = img_bgr.shape[:2]
    total_pixels = height * width

    # 2. Convert to HSV & LAB
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)

    # 3. Define vegetation color bounds
    # Green healthy foliage (Hue 32-85, Sat 35-255, Val 35-255)
    lower_green = np.array([32, 35, 35])
    upper_green = np.array([85, 255, 255])
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    # Chlorotic foliage (Yellow/Pale, Hue 18-32, Sat 35-255, Val 50-255)
    lower_yellow = np.array([18, 35, 50])
    upper_yellow = np.array([32, 255, 255])
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)

    # Necrotic/Rust/Blight foliage (Brown/Rust/Dark, Hue 5-18, Sat 35-255, Val 20-200)
    lower_brown = np.array([5, 35, 20])
    upper_brown = np.array([18, 255, 200])
    mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)

    # Combined vegetative canopy
    mask_foliage = cv2.bitwise_or(mask_green, cv2.bitwise_or(mask_yellow, mask_brown))
    mask_damaged = cv2.bitwise_or(mask_yellow, mask_brown)

    green_pixels = int(cv2.countNonZero(mask_green))
    yellow_pixels = int(cv2.countNonZero(mask_yellow))
    brown_pixels = int(cv2.countNonZero(mask_brown))
    total_foliage_pixels = int(cv2.countNonZero(mask_foliage))
    total_damaged_pixels = int(cv2.countNonZero(mask_damaged))

    # Foliar presence check (must contain at least 2.5% vegetative matter)
    foliar_ratio_in_image = total_foliage_pixels / max(total_pixels, 1)
    if foliar_ratio_in_image < 0.025:
        return {
            "success": False,
            "is_foliar": False,
            "error": "Unsupported non-crop or non-foliar image. The image lacks sufficient vegetative canopy for diagnostic analysis.",
            "foliar_ratio": round(foliar_ratio_in_image * 100, 2)
        }

    # Calculate actual damage ratios relative to total foliage
    damaged_pct = round((total_damaged_pixels / max(total_foliage_pixels, 1)) * 100, 2)
    healthy_pct = round((green_pixels / max(total_foliage_pixels, 1)) * 100, 2)
    chlorosis_pct = round((yellow_pixels / max(total_foliage_pixels, 1)) * 100, 2)
    necrosis_pct = round((brown_pixels / max(total_foliage_pixels, 1)) * 100, 2)

    # 4. Extract lesion contours and generate bounding boxes
    contours, _ = cv2.findContours(mask_damaged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bounding_boxes: List[Dict[str, Any]] = []

    # Sort contours by area descending, take top 6 prominent lesion clusters
    min_lesion_area = max(int(total_pixels * 0.0008), 80)
    sorted_contours = sorted(
        [c for c in contours if cv2.contourArea(c) > min_lesion_area],
        key=cv2.contourArea,
        reverse=True
    )[:6]

    for cnt in sorted_contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Normalized percentages for responsive frontend display
        x_pct = round((x / width) * 100, 1)
        y_pct = round((y / height) * 100, 1)
        w_pct = round((w / width) * 100, 1)
        h_pct = round((h / height) * 100, 1)

        # Determine if lesion is predominantly chlorosis or necrosis
        roi_yellow = cv2.countNonZero(mask_yellow[y:y+h, x:x+w])
        roi_brown = cv2.countNonZero(mask_brown[y:y+h, x:x+w])
        label = "Necrotic Blight Lesion" if roi_brown >= roi_yellow else "Chlorosis / Yellowing Band"
        confidence = round(0.85 + min(cv2.contourArea(cnt) / (total_pixels * 0.05), 0.12), 2)

        bounding_boxes.append({
            "label": label,
            "x": x_pct,
            "y": y_pct,
            "w": w_pct,
            "h": h_pct,
            "conf": confidence,
            "pixel_area": int(cv2.contourArea(cnt))
        })

    # 5. Detect Physical Damage: Horizontal Lodging & Stem Flattening
    # Uses Canny edge detection & Hough line transform to estimate dominant orientation
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=50, maxLineGap=10)

    is_lodging_detected = False
    lodging_confidence = 0.0
    horizontal_lines = 0
    vertical_lines = 0

    if lines is not None and len(lines) > 5:
        for line in lines:
            coords = line.flatten()
            if len(coords) >= 4:
                x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
                angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
                # Lines near 0 or 180 degrees are horizontal (lodged / flattened stems)
                if angle < 25 or angle > 155:
                    horizontal_lines += 1
                elif 65 < angle < 115:
                    vertical_lines += 1

        total_oriented_lines = horizontal_lines + vertical_lines
        if total_oriented_lines > 10:
            h_ratio = horizontal_lines / total_oriented_lines
            if h_ratio > 0.65 and damaged_pct > 25.0:
                is_lodging_detected = True
                lodging_confidence = round(min(0.70 + (h_ratio * 0.25), 0.94), 2)

    # 6. Risk categorization
    if damaged_pct >= 50.0 or is_lodging_detected:
        risk_category = "SEVERE"
    elif damaged_pct >= 25.0:
        risk_category = "HIGH"
    elif damaged_pct >= 10.0:
        risk_category = "MEDIUM"
    else:
        risk_category = "LOW"

    return {
        "success": True,
        "is_foliar": True,
        "total_foliage_ratio": round(foliar_ratio_in_image * 100, 2),
        "visible_affected_area_pct": damaged_pct,
        "healthy_green_pct": healthy_pct,
        "chlorosis_pct": chlorosis_pct,
        "necrosis_pct": necrosis_pct,
        "risk_category": risk_category,
        "bounding_boxes": bounding_boxes,
        "physical_damage": {
            "lodging_detected": is_lodging_detected,
            "lodging_confidence": lodging_confidence,
            "damage_description": (
                "Severe crop lodging and internode snapping detected; foliage flattened horizontally."
                if is_lodging_detected
                else "No severe horizontal crop lodging detected."
            )
        }
    }
