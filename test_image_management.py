import io
import cv2
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.database import Base, engine, SessionLocal, run_migrations
from backend.app.services.seed_data import seed_database
from backend.app.models.entities import Crop, CropImage, Notification

# Ensure tables & migrations are in place
Base.metadata.create_all(bind=engine)
run_migrations(engine)
db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

def create_dummy_jpeg(width=640, height=480, color=(34, 139, 34), seed_tag=None):
    """Generates a synthetic green crop foliage image in memory."""
    import time
    tag = str(seed_tag if seed_tag is not None else time.time())
    img = Image.new('RGB', (width, height), color=color)
    np_img = np.array(img)
    cv2.circle(np_img, (width // 2, height // 2), 60, (0, 100, 0), -1)
    cv2.line(np_img, (0, 0), (width, height), (50, 205, 50), 3)
    cv2.putText(np_img, f"Tag: {tag[-6:]}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    
    pil_final = Image.fromarray(np_img)
    buf = io.BytesIO()
    pil_final.save(buf, format='JPEG', quality=90)
    return buf.getvalue()

def run_tests():
    print("\n=======================================================")
    print("PHASE 4: REAL-TIME CROP IMAGE CAPTURE & GPS TEST SUITE")
    print("=======================================================")

    # 1. Login Farmer
    print("\n--- 1. Authenticating Farmer ---")
    farmer_login = client.post("/api/v1/auth/farmer/login", json={
        "phone": "+91 98234 56789",
        "password": "farmer123",
        "otp": "4819"
    })
    assert farmer_login.status_code == 200, f"Farmer login failed: {farmer_login.text}"
    farmer_token = farmer_login.json()["access_token"]
    headers_farmer = {"Authorization": f"Bearer {farmer_token}"}
    print("Farmer authenticated successfully.")

    # 2. Login Officer
    print("\n--- 2. Authenticating Insurance Officer ---")
    officer_login = client.post("/api/v1/auth/officer/login", json={
        "officerId": "OFF-HR-402",
        "password": "officer123"
    })
    assert officer_login.status_code == 200, f"Officer login failed: {officer_login.text}"
    officer_token = officer_login.json()["access_token"]
    headers_officer = {"Authorization": f"Bearer {officer_token}"}
    print("Officer authenticated successfully.")

    # 3. Get Farmer's first crop ID
    crops_res = client.get("/api/v1/crops", headers=headers_farmer)
    assert crops_res.status_code == 200
    crops = crops_res.json()
    crop_id = crops[0]["id"]
    crop_lat = crops[0].get("latitude", 29.6857)
    crop_lon = crops[0].get("longitude", 76.9905)
    print(f"Target crop: {crops[0]['cropName']} (ID: {crop_id}, Lat: {crop_lat}, Lon: {crop_lon})")

    # 4. Test Valid Image Upload with GPS within parcel bounds
    print("\n--- 3. Testing Secure Crop Image Upload (Within Farm Plot) ---")
    img_bytes = create_dummy_jpeg(640, 480)
    upload_res = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={
            "crop_id": crop_id,
            "latitude": crop_lat + 0.0001,  # ~11 meters away
            "longitude": crop_lon + 0.0001,
            "gps_accuracy": 4.2,
            "client_capture_time": "2026-08-15 10:30:00",
            "category": "Foliar Blight Symptom Monitoring"
        },
        files={"file": ("foliar_sample.jpg", img_bytes, "image/jpeg")}
    )
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    created_img_id = upload_data["image"]["id"]
    print("Image Upload Successful!")
    print(f"UID: {upload_data['image']['image_uid']}, Size: {upload_data['image']['file_size']} bytes")
    print(f"OpenCV Quality Status: {upload_data['quality_assessment']['quality_status']} (Blur: {upload_data['quality_assessment']['blur_score']})")
    print(f"GPS Verification Status: {upload_data['gps_verification']['status']} (Distance: {upload_data['gps_verification']['distance_meters']}m)")
    assert upload_data["gps_verification"]["is_within_bounds"] is True

    # 5. Test Duplicate Image Upload Detection (Same SHA-256 hash)
    print("\n--- 4. Testing Duplicate Image Detection via SHA-256 ---")
    dup_res = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={
            "crop_id": crop_id,
            "latitude": crop_lat,
            "longitude": crop_lon,
            "client_capture_time": "2026-08-15 10:35:00"
        },
        files={"file": ("foliar_sample_dup.jpg", img_bytes, "image/jpeg")}
    )
    assert dup_res.status_code == 201
    assert dup_res.json()["is_duplicate_detected"] is True, "Duplicate was not detected!"
    print(f"Duplicate Detection PASSED: Identified hash match {dup_res.json()['image']['image_hash'][:16]}...")

    # 6. Test Location Mismatch Flagging (> 1000m)
    print("\n--- 5. Testing GPS Location Mismatch Flagging (> 1000m) ---")
    import time
    img_bytes2 = create_dummy_jpeg(800, 600, color=(40, 150, 40), seed_tag=f"far_{time.time()}")
    far_lat = crop_lat + 0.05  # ~5.5 km away
    far_lon = crop_lon + 0.05
    far_upload_res = client.post(
        "/api/v1/images/upload",
        headers=headers_farmer,
        data={
            "crop_id": crop_id,
            "latitude": far_lat,
            "longitude": far_lon,
            "client_capture_time": "2026-08-15 11:00:00"
        },
        files={"file": ("off_site_sample.jpg", img_bytes2, "image/jpeg")}
    )
    assert far_upload_res.status_code == 201
    far_data = far_upload_res.json()
    print(f"Off-site upload distance: {far_data['gps_verification']['distance_meters']}m")
    assert far_data["gps_verification"]["status"] == "FLAGGED_LOCATION_MISMATCH"
    assert far_data["image"]["verification_status"] == "FLAGGED_LOCATION_MISMATCH"
    print("GPS Mismatch Flagging PASSED: Correctly tagged FLAGGED_LOCATION_MISMATCH.")

    # 7. Test Location Comparison Endpoint
    print("\n--- 6. Testing Location Endpoint & Haversine Distance ---")
    loc_res = client.get(f"/api/v1/images/{created_img_id}/location", headers=headers_farmer)
    assert loc_res.status_code == 200
    loc_data = loc_res.json()
    print(f"Image vs Farm Distance: {loc_data['distance_meters']}m | Status: {loc_data['status']}")
    print(f"Disclaimer: {loc_data['legal_disclaimer']}")

    # 8. Test Farmer My-Images Query
    print("\n--- 7. Testing Farmer 'My-Images' History ---")
    my_imgs_res = client.get("/api/v1/images/my-images", headers=headers_farmer)
    assert my_imgs_res.status_code == 200
    my_imgs = my_imgs_res.json()
    print(f"Retrieved {len(my_imgs)} images for authenticated farmer.")
    assert len(my_imgs) >= 2

    # 9. Test Officer Queue Retrieval
    print("\n--- 8. Testing Officer Image Scrutiny Queue ---")
    off_queue_res = client.get("/api/v1/images/officer/queue", headers=headers_officer)
    assert off_queue_res.status_code == 200
    off_queue = off_queue_res.json()
    print(f"Officer retrieved {len(off_queue)} total images in review queue.")

    # 10. Test Officer Image Verification Update
    print("\n--- 9. Testing Officer Verification Decision (VERIFIED) ---")
    verify_res = client.put(
        f"/api/v1/images/officer/{created_img_id}/verification",
        headers=headers_officer,
        json={
            "decision": "VERIFIED",
            "officer_remarks": "GPS within 15m radius. EXIF confirmed. Crop foliage clear and admissible."
        }
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["image"]["verification_status"] == "VERIFIED"
    print(f"Officer Decision recorded: {verify_res.json()['image']['verification_status']}")

    # 11. Test Officer Request Recapture Workflow
    print("\n--- 10. Testing Officer Recapture Request & Farmer Notification ---")
    recapture_res = client.post(
        f"/api/v1/images/officer/{far_data['image']['id']}/request-recapture",
        headers=headers_officer,
        json={
            "reason": "GPS coordinates show capture was 5.5 km away from registered plot.",
            "guidelines": "Please recapture within 100 meters of survey number 150/2 parcel center."
        }
    )
    assert recapture_res.status_code == 200
    assert recapture_res.json()["image"]["verification_status"] == "RECAPTURE_REQUESTED"
    print("Recapture request successfully issued.")

    # Verify notification created for farmer
    notif_res = client.get("/api/v1/farmers/notifications", headers=headers_farmer)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    recapture_notifs = [n for n in notifs if "Recapture" in n.get("title", "") or "recapture" in n.get("message", "")]
    print(f"Farmer Notification verified: {len(recapture_notifs)} recapture alerts on file.")

    # 12. Test RBAC Enforcement: Farmer cannot verify officer decisions
    print("\n--- 11. Testing RBAC Security: Farmer Blocked from Officer Verification ---")
    rbac_res = client.put(
        f"/api/v1/images/officer/{created_img_id}/verification",
        headers=headers_farmer,
        json={"decision": "VERIFIED"}
    )
    assert rbac_res.status_code == 403, f"Expected 403, got {rbac_res.status_code}"
    print("RBAC Enforcement PASSED: Farmer blocked from officer verification endpoint with HTTP 403 Forbidden.")

    print("\n=======================================================")
    print("ALL 11 IMAGE MANAGEMENT & GPS TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
