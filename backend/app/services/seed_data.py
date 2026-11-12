import json
from sqlalchemy.orm import Session
from backend.app.core.security import get_password_hash
from backend.app.models import (
    User, Farmer, Officer, Crop, InsurancePolicy, CropImage,
    AiAnalysisReport, DiseaseDetection, PestDetection,
    TreatmentRecommendation, TreatmentHistory, InsuranceClaim,
    ClaimVerification, FieldInspection, WeatherRecord, Notification
)

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first():
        return

    # 1. Create Default Farmer User
    farmer_user = User(
        phone="+91 98234 56789",
        email="rameshwar.patel@pmfby-farmer.in",
        hashed_password=get_password_hash("farmer123"),
        role="FARMER",
        is_active=True
    )
    db.add(farmer_user)
    db.flush()

    farmer = Farmer(
        user_id=farmer_user.id,
        farmer_uid="FARM-2026-9042",
        full_name="Rameshwar Singh Patel",
        aadhaar_hash="sha256_hash_uidai_4819",
        aadhaar_masked="XXXX-XXXX-4819",
        father_name="Bhairon Singh Patel",
        gender="Male",
        dob="1982-06-14",
        caste_category="OBC / Small & Marginal",
        village="Sambhalkha",
        tehsil="Gharaunda",
        district="Karnal",
        state="Haryana",
        pincode="132001",
        total_land_acres=5.4,
        bank_name="State Bank of India",
        bank_account_number="XXXXXXXX4820",
        ifsc_code="SBIN0001248",
        bank_verified=True
    )
    db.add(farmer)
    db.flush()

    # 2. Create Default Officer User
    officer_user = User(
        phone="+91 94160 12890",
        email="v.sharma@pmfby-gov.in",
        hashed_password=get_password_hash("officer123"),
        role="OFFICER",
        is_active=True
    )
    db.add(officer_user)
    db.flush()

    officer = Officer(
        user_id=officer_user.id,
        officer_uid="OFF-HR-402",
        full_name="Dr. Vikramaditya Sharma",
        designation="District Insurance Scrutiny Officer (PMFBY)",
        department="Department of Agriculture & Farmers Welfare, Haryana",
        jurisdiction="Karnal & Kurukshetra Agro-Climatic Zone",
        phone="+91 94160 12890"
    )
    db.add(officer)
    db.flush()

    # 3. Create Crops
    crop1 = Crop(
        crop_uid="CRP-01",
        farmer_id=farmer.id,
        crop_name="Paddy (Basmati PB-1121)",
        season="Kharif 2026",
        sowing_date="2026-06-28",
        harvest_expected_date="2026-10-25",
        area_acres=3.2,
        survey_number="142/2A",
        khasra_number="KH-882-901",
        soil_type="Alluvial Clay Loam",
        irrigation_type="Canal & Tube-well",
        status="INSURED",
        health_status="AFFECTED",
        latitude=29.6857,
        longitude=76.9905
    )
    crop2 = Crop(
        crop_uid="CRP-02",
        farmer_id=farmer.id,
        crop_name="Cotton (Bt Cotton Bollgard II)",
        season="Kharif 2026",
        sowing_date="2026-05-15",
        harvest_expected_date="2026-11-20",
        area_acres=2.2,
        survey_number="142/3B",
        khasra_number="KH-882-902",
        soil_type="Sandy Loam",
        irrigation_type="Drip Irrigation",
        status="INSURED",
        health_status="HEALTHY",
        latitude=29.6865,
        longitude=76.9922
    )
    db.add_all([crop1, crop2])
    db.flush()

    # 4. Create Insurance Policies
    policy1 = InsurancePolicy(
        policy_number="POL-PMFBY-2026-8812",
        farmer_id=farmer.id,
        crop_id=crop1.id,
        season="Kharif 2026",
        sum_insured=176000.0,
        farmer_premium=3520.0,
        central_subsidy=8800.0,
        state_subsidy=8800.0,
        total_gross_premium=21120.0,
        insurance_company="Agriculture Insurance Company of India Ltd (AICIL)",
        policy_start_date="2026-06-01",
        policy_end_date="2026-11-30",
        coverage_type="Comprehensive PMFBY Yield Guarantee + Localized Calamities",
        status="ACTIVE"
    )
    policy2 = InsurancePolicy(
        policy_number="POL-PMFBY-2026-8813",
        farmer_id=farmer.id,
        crop_id=crop2.id,
        season="Kharif 2026",
        sum_insured=143000.0,
        farmer_premium=7150.0,
        central_subsidy=10725.0,
        state_subsidy=10725.0,
        total_gross_premium=28600.0,
        insurance_company="IFFCO Tokio General Insurance Co.",
        policy_start_date="2026-05-01",
        policy_end_date="2026-12-15",
        coverage_type="Comprehensive PMFBY Commercial Crop Cover",
        status="ACTIVE"
    )
    db.add_all([policy1, policy2])
    db.flush()

    # 5. Crop Images
    img1 = CropImage(
        image_uid="IMG-9011",
        crop_id=crop1.id,
        image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80",
        captured_at="2026-08-14 09:42:15",
        latitude=29.6857,
        longitude=76.9905,
        altitude="248m",
        device_info="Samsung Galaxy M33 5G - GNSS RTK",
        tamper_check="PASSED (EXIF Hash Signature Verified)",
        geo_fence_valid=True,
        distance_from_plot_meters=14.2,
        category="Standing Crop Disease Surveillance"
    )
    img2 = CropImage(
        image_uid="IMG-9012",
        crop_id=crop1.id,
        image_url="https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?auto=format&fit=crop&w=1200&q=80",
        captured_at="2026-08-14 09:44:02",
        latitude=29.6859,
        longitude=76.9908,
        altitude="247m",
        device_info="Samsung Galaxy M33 5G",
        tamper_check="PASSED",
        geo_fence_valid=True,
        distance_from_plot_meters=22.0,
        category="Hailstorm & Lodging Evidence"
    )
    db.add_all([img1, img2])
    db.flush()

    # 6. AI Analysis Reports
    report1 = AiAnalysisReport(
        report_uid="ASSESS-8812",
        crop_image_id=img1.id,
        diagnosis_type="DISEASE",
        primary_issue="Bacterial Leaf Blight (Xanthomonas oryzae)",
        confidence_score=94.6,
        severity_percentage=42.5,
        affected_area_ratio="1.36 Acres affected out of 3.2 Acres",
        risk_category="HIGH",
        recommendation="Immediate streptocycline + copper oxychloride spray required. Eligible for PMFBY Localized Disease Loss clause if uncontained.",
        bounding_boxes_json=json.dumps([
            {"label": "Bacterial Blight Lesion", "x": 22, "y": 18, "w": 34, "h": 45, "conf": 0.96},
            {"label": "Leaf Chlorosis Band", "x": 58, "y": 32, "w": 28, "h": 36, "conf": 0.92}
        ]),
        pixel_segmentation_json=json.dumps({
            "healthyGreenPct": 57.5,
            "necroticDamagedPct": 42.5,
            "chlorosisPct": 18.2
        })
    )
    report2 = AiAnalysisReport(
        report_uid="ASSESS-8813",
        crop_image_id=img2.id,
        diagnosis_type="DAMAGE",
        primary_issue="Crop Lodging & Hailstem Snapping",
        confidence_score=91.2,
        severity_percentage=68.0,
        affected_area_ratio="2.17 Acres affected out of 3.2 Acres",
        risk_category="SEVERE",
        recommendation="Severe physical damage qualifying for PMFBY Localized Calamity claim (Hailstorm/Inundation). Expedited officer verification recommended.",
        bounding_boxes_json=json.dumps([
            {"label": "Lodged Submerged Panicle", "x": 15, "y": 25, "w": 68, "h": 52, "conf": 0.93},
            {"label": "Stem Breakage Point", "x": 40, "y": 65, "w": 25, "h": 22, "conf": 0.88}
        ]),
        pixel_segmentation_json=json.dumps({
            "healthyGreenPct": 32.0,
            "necroticDamagedPct": 68.0,
            "chlorosisPct": 24.5
        })
    )
    db.add_all([report1, report2])
    db.flush()

    # 7. Disease & Pest Detections
    disease1 = DiseaseDetection(
        ai_report_id=report1.id,
        pathogen_name="Xanthomonas oryzae pv. oryzae",
        lesion_type="Marginal Wavy Chlorotic Blight",
        chlorosis_ratio=18.2,
        symptoms_json=json.dumps([
            "Water-soaked lesions on leaf margins turning translucent yellow-white",
            "Wavy brownish necrotic margins extending down leaf blade",
            "Milky bacterial ooze crust on early morning leaf tips"
        ]),
        recommended_fungicide="Copper Oxychloride 50% WP + Streptocycline"
    )
    db.add(disease1)

    # 8. Treatment Recommendations
    trt1 = TreatmentRecommendation(
        issue_name="Bacterial Leaf Blight (Paddy)",
        treatment_type="Chemical & Biological Integrated",
        chemical_product="Streptocycline (90% Streptomycin + 10% Tetracycline) + Copper Oxychloride 50% WP",
        chemical_dosage="6g Streptocycline + 500g Copper Oxychloride in 200 Litres of water per acre",
        chemical_method="Foliar spray in late afternoon when dew has dried",
        safety_period_days="14 days before harvest",
        organic_product="Panchagavya (3%) + Pseudomonas fluorescens liquid formulation",
        organic_dosage="2.5 Litres Pseudomonas fluorescens per acre mixed in 200 Litres of water",
        organic_benefits="Suppresses bacterial multiplication and stimulates systemic plant resistance (SAR)",
        preventive_measures_json=json.dumps([
            "Avoid excess nitrogenous urea top-dressing during humid rainy spells",
            "Ensure proper field drainage to avoid cross-field bacterial spread via stagnant water"
        ])
    )
    db.add(trt1)

    # 9. Treatment History
    log1 = TreatmentHistory(
        farmer_id=farmer.id,
        crop_id=crop1.id,
        issue_treated="Bacterial Leaf Blight Initial Onset",
        treatment_applied="Copper Oxychloride 50% WP + Streptocycline",
        dosage_used="500g COC + 6g Streptocycline / 200L water",
        date_applied="2026-08-16",
        status="RECOVERING",
        notes="Applied across parcel 142/2A. Lesion spread has arrested."
    )
    db.add(log1)

    # 10. Insurance Claims
    claim1 = InsuranceClaim(
        claim_ticket_no="CLM-PMFBY-2026-0041",
        policy_id=policy1.id,
        farmer_id=farmer.id,
        crop_id=crop1.id,
        incident_date="2026-08-13",
        cause_of_loss="UNSEASONAL_HAILSTORM_AND_INUNDATION",
        cause_label="Severe Localized Hailstorm & Torrential Waterlogging",
        claimed_amount=119680.0,
        ai_assessed_loss_pct=68.0,
        ai_recommended_amount=119680.0,
        officer_approved_amount=None,
        status="UNDER_OFFICER_REVIEW",
        officer_notes="AI assessment matches localized radar data. Physical CCE sample spot requested to confirm grain shattering percentage."
    )
    claim2 = InsuranceClaim(
        claim_ticket_no="CLM-PMFBY-2026-0038",
        policy_id=policy1.id,
        farmer_id=farmer.id,
        crop_id=crop1.id,
        incident_date="2026-03-24",
        cause_of_loss="UNSEASONAL_RAIN",
        cause_label="Terminal Heat & Unseasonal March Downpour",
        claimed_amount=64000.0,
        ai_assessed_loss_pct=35.0,
        ai_recommended_amount=61600.0,
        officer_approved_amount=61600.0,
        status="SETTLED_DISBURSED",
        officer_notes="Loss verified under Post-Harvest / Terminal Stage Calamity. Payout disbursed directly via DBT PFMS."
    )
    db.add_all([claim1, claim2])
    db.flush()

    # 11. Claim Verifications
    ver1 = ClaimVerification(
        claim_id=claim2.id,
        officer_id=officer.id,
        decision="APPROVED",
        approved_amount=61600.0,
        remarks="Approved based on localized post-harvest damage assessment.",
    )
    db.add(ver1)

    # 12. Field Inspections
    insp1 = FieldInspection(
        inspection_uid="INSP-701",
        claim_id=claim1.id,
        officer_id=officer.id,
        scheduled_date="2026-08-20",
        priority="URGENT",
        purpose="Physical CCE (Crop Cutting Experiment) validation of 68% hailstorm lodging loss",
        status="SCHEDULED"
    )
    db.add(insp1)

    # 13. Weather Records
    weather1 = WeatherRecord(
        claim_id=claim1.id,
        station_name="IMD Karnal Agro-Meteorological Observatory",
        latitude=29.6857,
        longitude=76.9905,
        record_date="2026-08-14",
        rainfall_mm=84.5,
        normal_rainfall_mm=12.0,
        precipitation_anomaly_pct=604.0,
        temperature_c=28.4,
        humidity_pct=84.0,
        hailstorm_detected=True,
        correlation_status="AUTHENTIC (Radar Verified +604% Precipitation Anomaly)"
    )
    db.add(weather1)

    # 14. Notifications
    notif1 = Notification(
        user_id=farmer_user.id,
        role="FARMER",
        notif_type="CRITICAL_WEATHER",
        title="IMD Weather Advisory: Heavy Downpour Expected",
        message="Thunderstorm with heavy showers (65-80mm) forecasted in Karnal agro-zone. Ensure parcel drainage channels are unblocked.",
        read=False
    )
    notif2 = Notification(
        user_id=officer_user.id,
        role="OFFICER",
        notif_type="AI_ALERT",
        title="New High Severity Claim Flagged: 68% Lodging",
        message="Claim #CLM-0041 submitted by Rameshwar Singh Patel has an AI damage score of 68.0%. Correlated with IMD radar precipitation anomaly (+604%).",
        read=False
    )
    db.add_all([notif1, notif2])

    db.commit()

