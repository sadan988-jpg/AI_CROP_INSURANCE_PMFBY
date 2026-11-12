import sys
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.services.seed_data import seed_database

# Ensure tables and seed exist
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Root & Health ---")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("GET / ->", res.json())

    res = client.get("/health")
    assert res.status_code == 200
    print("GET /health ->", res.json())

    print("\n--- 2. Testing Farmer Login ---")
    login_res = client.post("/api/v1/auth/farmer/login", json={
        "phone": "+91 98234 56789",
        "password": "farmer123",
        "otp": "4819"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    farmer_token_data = login_res.json()
    farmer_token = farmer_token_data["access_token"]
    print("Farmer Token issued:", farmer_token[:25] + "...", "Role:", farmer_token_data["role"])

    headers_farmer = {"Authorization": f"Bearer {farmer_token}"}

    print("\n--- 3. Testing Farmer Profile ---")
    prof_res = client.get("/api/v1/farmers/profile", headers=headers_farmer)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    print("Farmer Name:", prof["fullName"], "Aadhaar:", prof["aadhaarMasked"], "Land:", prof["landHoldingsTotalAcres"], "Acres")

    print("\n--- 4. Testing Farmer Crops List ---")
    crops_res = client.get("/api/v1/crops", headers=headers_farmer)
    assert crops_res.status_code == 200
    crops = crops_res.json()
    print(f"Retrieved {len(crops)} crops. First crop: {crops[0]['cropName']} ({crops[0]['id']})")

    print("\n--- 5. Testing Farmer Insurance Policies ---")
    policies_res = client.get("/api/v1/farmers/policies", headers=headers_farmer)
    assert policies_res.status_code == 200
    policies = policies_res.json()
    print(f"Retrieved {len(policies)} policies. Policy #1 Sum Insured: ₹{policies[0]['sumInsured']:,}")

    print("\n--- 6. Testing Officer Login ---")
    off_res = client.post("/api/v1/auth/officer/login", json={
        "officerId": "OFF-HR-402",
        "password": "officer123"
    })
    assert off_res.status_code == 200, f"Officer login failed: {off_res.text}"
    off_token_data = off_res.json()
    officer_token = off_token_data["access_token"]
    print("Officer Token issued:", officer_token[:25] + "...", "Role:", off_token_data["role"])

    headers_officer = {"Authorization": f"Bearer {officer_token}"}

    print("\n--- 7. Testing Officer Dashboard Stats ---")
    stats_res = client.get("/api/v1/officers/dashboard-stats", headers=headers_officer)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    print("Officer Dashboard Stats:", stats)

    print("\n--- 8. Testing RBAC Security: Farmer Cannot Access Officer Dashboard ---")
    forbidden_res = client.get("/api/v1/officers/dashboard-stats", headers=headers_farmer)
    assert forbidden_res.status_code == 403, f"Expected 403, got {forbidden_res.status_code}"
    print("RBAC Enforcement PASSED: Farmer blocked from officer API with 403 Forbidden.")

    print("\n--- 9. Testing Crop Registration API ---")
    new_crop_res = client.post("/api/v1/crops", headers=headers_farmer, json={
        "cropName": "Soybean (JS-335)",
        "season": "Kharif 2026",
        "sowingDate": "2026-07-02",
        "harvestExpectedDate": "2026-10-30",
        "areaAcres": 2.8,
        "surveyNumber": "150/3A",
        "khasraNumber": "KH-882-990",
        "soilType": "Clay Loam",
        "irrigationType": "Canal",
        "latitude": 29.6890,
        "longitude": 76.9930
    })
    assert new_crop_res.status_code == 200, f"Crop register failed: {new_crop_res.text}"
    print("New Crop Registered:", new_crop_res.json()["crop"]["id"], new_crop_res.json()["crop"]["cropName"])

    print("\n--- 10. Testing Claim Submission & Officer Verification ---")
    claim_res = client.post("/api/v1/claims", headers=headers_farmer, json={
        "cropName": "Soybean (JS-335)",
        "khasraNo": "KH-882-990",
        "incidentDate": "2026-08-14",
        "causeOfLoss": "UNSEASONAL_HAILSTORM_AND_INUNDATION",
        "causeLabel": "Severe Localized Hailstorm",
        "claimedAmount": 85000.0,
        "aiAssessedLossPct": 55.0,
        "officerNotes": "Hailstorm snapped foliage"
    })
    assert claim_res.status_code == 200, f"Claim failed: {claim_res.text}"
    claim_ticket = claim_res.json()["claim"]["id"]
    print("New Claim Intimated:", claim_ticket)

    # Officer approves the claim
    verify_res = client.post(f"/api/v1/officers/claims/{claim_ticket}/verify", headers=headers_officer, json={
        "decision": "APPROVED",
        "approvedAmount": 80750.0,
        "remarks": "Corroborated by IMD radar and AI damage score. Approved for PFMS DBT transfer."
    })
    assert verify_res.status_code == 200, f"Verify failed: {verify_res.text}"
    print("Officer Claim Verification Result:", verify_res.json())

    print("\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    run_tests()
