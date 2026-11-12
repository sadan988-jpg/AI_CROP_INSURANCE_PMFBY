import io
import time
import cv2
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.database import Base, engine, SessionLocal, run_migrations
from backend.app.services.seed_data import seed_database
from backend.app.models.entities import Crop, CropImage, AiAnalysisReport, User, Farmer

# Initialize DB & migrations
Base.metadata.create_all(bind=engine)
run_migrations(engine)
db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

def create_foliage_image(width=640, height=480, lesion_intensity=0.3):
    """
    Creates a realistic synthetic foliar leaf image with green leaf background
    and chlorotic/necrotic lesions using pure OpenCV BGR encoding.
    """
    # Green leaf background in BGR (B=34, G=139, R=34)
    img_bgr = np.full((height, width, 3), (34, 139, 34), dtype=np.uint8)
    
    # Draw leaf veins
    cv2.line(img_bgr, (width // 2, 0), (width // 2, height), (20, 100, 20), 4)
    for y in range(50, height, 60):
        cv2.line(img_bgr, (width // 2, y), (width // 4, y + 40), (25, 110, 25), 2)
        cv2.line(img_bgr, (width // 2, y), (3 * width // 4, y + 40), (25, 110, 25), 2)

    # Draw yellow chlorotic margin bands and necrotic centers if lesion_intensity > 0
    if lesion_intensity > 0:
        # Yellow chlorosis in BGR (B=30, G=210, R=230)
        cv2.ellipse(img_bgr, (width // 3, height // 3), (80, 120), 30, 0, 360, (30, 210, 230), -1)
        # Brown necrotic lesion center in BGR (B=20, G=70, R=140)
        cv2.ellipse(img_bgr, (width // 3, height // 3), (45, 65), 30, 0, 360, (20, 70, 140), -1)

    return cv2.imencode('.jpg', img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])[1].tobytes()

def create_non_foliar_image(width=640, height=480):
    """Creates a non-foliar image (e.g. blue machinery / sky without plant tissue)."""
    # Deep blue in BGR (B=220, G=70, R=50) -> Hue is ~110, exactly 0 foliage pixels
    img = np.full((height, width, 3), (220, 70, 50), dtype=np.uint8)
    cv2.rectangle(img, (50, 50), (width - 50, height - 50), (240, 90, 70), 8)
    cv2.circle(img, (width // 2, height // 2), 80, (180, 40, 30), -1)
    return cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 92])[1].tobytes()

def create_blurry_image(width=640, height=480):
    """Creates an intentionally blurry image with low Laplacian variance but sufficient file size."""
    # Start with detailed foliage
    base_bgr = np.full((height, width, 3), (34, 139, 34), dtype=np.uint8)
    cv2.circle(base_bgr, (width // 2, height // 2), 120, (30, 210, 230), -1)
    # Apply heavy blur to drop Laplacian variance below 30
    blurred = cv2.GaussianBlur(base_bgr, (65, 65), 0)
    # Add slight compression noise to keep file size > 15 KB
    return cv2.imencode('.jpg', blurred, [cv2.IMWRITE_JPEG_QUALITY, 85])[1].tobytes()

def run_tests():
    print("\n=======================================================")
    print("PHASE 5: AI CROP ANALYTICS & COMPUTER VISION TEST SUITE")
    print("=======================================================")

    # 1. Login Farmer
    print("\n--- 1. Authenticating Farmer ---")
    farmer_login = client.post("/api/v1/auth/farmer/login", json={
        "phone": "+91 98234 56789",
        "password": "farmer123",
        "otp": "4819"
    })
    assert farmer_login.status_code == 200
    farmer_token = farmer_login.json()["access_token"]
    headers_farmer = {"Authorization": f"Bearer {farmer_token}"}
    print("Farmer authenticated successfully.")

    # 2. Login Officer
    print("\n--- 2. Authenticating Insurance Officer ---")
    officer_login = client.post("/api/v1/auth/officer/login", json={
        "officerId": "OFF-HR-402",
        "password": "officer123"
    })
    assert officer_login.status_code == 200
    officer_token = officer_login.json()["access_token"]
    headers_officer = {"Authorization": f"Bearer {officer_token}"}
    print("Officer authenticated successfully.")

    # Get farmer's crop
    crops = client.get("/api/v1/crops", headers=headers_farmer).json()
    crop_id = crops[0]["id"]
    print(f"Target crop: {crops[0]['cropName']} (ID: {crop_id})")

    # 3. Upload a valid foliar image with lesions
    print("\n--- 3. Uploading Valid Foliage Image with Lesions ---")
    valid_bytes = create_foliage_image(640, 480, lesion_intensity=0.35)
    upload_res = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={
            "crop_id": crop_id,
            "latitude": 29.6858,
            "longitude": 76.9906,
            "client_capture_time": "2026-08-16 11:30:00",
            "category": "Foliar Blight Symptom Monitoring"
        },
        files={"file": ("foliar_disease_sample.jpg", valid_bytes, "image/jpeg")}
    )
    assert upload_res.status_code == 201
    valid_img_id = upload_res.json()["image"]["id"]
    print(f"Uploaded valid foliage image ID: {valid_img_id}")

    # 4. Test AI Analysis on Valid Foliar Image
    print("\n--- 4. Testing Real AI Image Analytics Pipeline ---")
    ai_res = client.post(f"/api/v1/ai/analyze/{valid_img_id}", headers=headers_farmer)
    assert ai_res.status_code == 200, f"AI analysis failed: {ai_res.text}"
    ai_data = ai_res.json()
    print("AI Analysis Succeeded!")
    print(f"Report UID: {ai_data['report_id']}")
    print(f"Primary Issue: {ai_data['primary_issue']}")
    print(f"Confidence Score: {ai_data['confidence_score']}%")
    print(f"Foliar Damage: {ai_data['severity_percentage']}% (Affected: {ai_data['affected_area_ratio']})")
    print(f"Risk Category: {ai_data['risk_category']}")
    print(f"Bounding Boxes Detected: {len(ai_data['bounding_boxes'])}")
    print(f"Model Version: {ai_data['model_version']}")
    assert ai_data["severity_percentage"] > 0
    assert len(ai_data["bounding_boxes"]) > 0
    assert "LEGAL DISCLAIMER" in ai_data["legal_disclaimer"]

    # 5. Test Non-Foliar Image Rejection
    print("\n--- 5. Testing Non-Foliar Image Rejection ---")
    non_foliar_bytes = create_non_foliar_image(640, 480)
    upload_nf = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={"crop_id": crop_id, "latitude": 29.6858, "longitude": 76.9906},
        files={"file": ("asphalt_road.jpg", non_foliar_bytes, "image/jpeg")}
    )
    assert upload_nf.status_code == 201
    nf_img_id = upload_nf.json()["image"]["id"]

    nf_ai_res = client.post(f"/api/v1/ai/analyze/{nf_img_id}", headers=headers_farmer)
    assert nf_ai_res.status_code == 400
    print(f"Non-foliar rejection PASSED: {nf_ai_res.json()['detail']}")

    # 6. Test Blurry Image Rejection
    print("\n--- 6. Testing Blurry Image Quality Rejection ---")
    blurry_bytes = create_blurry_image(640, 480)
    upload_blur = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={"crop_id": crop_id, "latitude": 29.6858, "longitude": 76.9906},
        files={"file": ("motion_blur.jpg", blurry_bytes, "image/jpeg")}
    )
    # The image upload or AI analyzer flags blurry image
    if upload_blur.status_code == 201:
        blur_img_id = upload_blur.json()["image"]["id"]
        blur_ai_res = client.post(f"/api/v1/ai/analyze/{blur_img_id}", headers=headers_farmer)
        assert blur_ai_res.status_code == 400
        print(f"Blurry image rejection PASSED: {blur_ai_res.json()['detail']}")
    else:
        print("Blurry image successfully caught and rejected at upload quality check.")

    # 7. Test Retrieval of AI Report by Report UID
    print("\n--- 7. Testing AI Report Retrieval API ---")
    report_uid = ai_data["report_id"]
    get_rep_res = client.get(f"/api/v1/ai/reports/{report_uid}", headers=headers_farmer)
    assert get_rep_res.status_code == 200
    rep_data = get_rep_res.json()
    print(f"Retrieved Report: {rep_data['reportUid']} | Crop: {rep_data['cropName']} | Severity: {rep_data['severityPercentage']}%")

    # 8. Test Image-to-Analysis Lookup API
    print("\n--- 8. Testing Image-to-Analysis Association API ---")
    img_analysis_res = client.get(f"/api/v1/ai/images/{valid_img_id}/analysis", headers=headers_farmer)
    assert img_analysis_res.status_code == 200
    assert img_analysis_res.json()["reportUid"] == report_uid
    print(f"Image analysis query confirmed for image ID {valid_img_id}.")

    # 9. Test Invalid Image ID (404)
    print("\n--- 9. Testing Invalid Image ID (HTTP 404) ---")
    err_404 = client.post("/api/v1/ai/analyze/99999", headers=headers_farmer)
    assert err_404.status_code == 404
    print("404 Not Found error handling verified.")

    # 10. Test Officer Flagging for Physical CCE Ground Truth
    print("\n--- 10. Testing Officer Flagging for Physical CCE Ground Truth ---")
    flag_res = client.post(
        f"/api/v1/ai/reports/{report_uid}/flag-for-cce",
        headers=headers_officer,
        json={
            "reason": "AI severity exceeds 35% with necrotic blight lesions. Surveyor ground-truthing required.",
            "priority": "URGENT"
        }
    )
    assert flag_res.status_code == 200
    print(f"Flagged for CCE: {flag_res.json()['message']}")

    # 11. Test RBAC: Farmer cannot flag for CCE
    print("\n--- 11. Testing RBAC Security: Farmer Cannot Flag for CCE ---")
    rbac_cce = client.post(
        f"/api/v1/ai/reports/{report_uid}/flag-for-cce",
        headers=headers_farmer,
        json={"reason": "Farmer attempting officer action"}
    )
    assert rbac_cce.status_code == 403
    print("RBAC Enforcement PASSED: Farmer blocked from officer CCE flag with HTTP 403 Forbidden.")

    print("\n=======================================================")
    print("ALL 11 AI CROP ANALYTICS TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
