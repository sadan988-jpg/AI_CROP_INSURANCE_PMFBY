from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=True)
    phone = Column(String(30), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="FARMER", index=True)  # FARMER, OFFICER, ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer_profile = relationship("Farmer", back_populates="user", uselist=False)
    officer_profile = relationship("Officer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


# 2. farmers
class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    farmer_uid = Column(String(40), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    aadhaar_hash = Column(String(64), nullable=True)
    aadhaar_masked = Column(String(24), default="XXXX-XXXX-4819")
    father_name = Column(String(120), default="Bhairon Singh Patel")
    gender = Column(String(10), default="Male")
    dob = Column(String(20), default="1982-06-14")
    caste_category = Column(String(50), default="OBC / Small & Marginal")
    village = Column(String(80), default="Sambhalkha")
    tehsil = Column(String(80), default="Gharaunda")
    district = Column(String(80), default="Karnal")
    state = Column(String(80), default="Haryana")
    pincode = Column(String(10), default="132001")
    total_land_acres = Column(Float, default=5.4)
    bank_name = Column(String(120), default="State Bank of India")
    bank_account_number = Column(String(40), default="XXXXXXXX4820")
    ifsc_code = Column(String(20), default="SBIN0001248")
    bank_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    policies = relationship("InsurancePolicy", back_populates="farmer")
    claims = relationship("InsuranceClaim", back_populates="farmer")
    treatment_history = relationship("TreatmentHistory", back_populates="farmer")
    images = relationship("CropImage", back_populates="farmer")


# 3. officers
class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    officer_uid = Column(String(40), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    designation = Column(String(120), default="District Insurance Scrutiny Officer (PMFBY)")
    department = Column(String(150), default="Department of Agriculture & Farmers Welfare, Haryana")
    jurisdiction = Column(String(150), default="Karnal & Kurukshetra Agro-Climatic Zone")
    phone = Column(String(30), default="+91 94160 12890")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="officer_profile")
    verifications = relationship("ClaimVerification", back_populates="officer")
    inspections = relationship("FieldInspection", back_populates="officer")


# 4. crops
class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    crop_uid = Column(String(30), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"))
    crop_name = Column(String(100), nullable=False)
    season = Column(String(40), default="Kharif 2026")
    sowing_date = Column(String(20), default="2026-06-28")
    harvest_expected_date = Column(String(20), default="2026-10-25")
    area_acres = Column(Float, default=3.2)
    survey_number = Column(String(40), nullable=False)
    khasra_number = Column(String(40), nullable=False)
    soil_type = Column(String(80), default="Alluvial Clay Loam")
    irrigation_type = Column(String(80), default="Canal & Tube-well")
    status = Column(String(30), default="INSURED")  # INSURED, UNDER_VERIFICATION, REJECTED
    health_status = Column(String(30), default="HEALTHY")  # HEALTHY, AFFECTED
    latitude = Column(Float, default=29.6857)
    longitude = Column(Float, default=76.9905)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="crops")
    policies = relationship("InsurancePolicy", back_populates="crop")
    images = relationship("CropImage", back_populates="crop", cascade="all, delete-orphan")
    claims = relationship("InsuranceClaim", back_populates="crop")
    treatments = relationship("TreatmentHistory", back_populates="crop")


# 5. insurance_policies
class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    season = Column(String(40), default="Kharif 2026")
    sum_insured = Column(Float, default=176000.0)
    farmer_premium = Column(Float, default=3520.0)  # 2% for Kharif
    central_subsidy = Column(Float, default=8800.0)
    state_subsidy = Column(Float, default=8800.0)
    total_gross_premium = Column(Float, default=21120.0)
    insurance_company = Column(String(150), default="Agriculture Insurance Company of India Ltd (AICIL)")
    policy_start_date = Column(String(20), default="2026-06-01")
    policy_end_date = Column(String(20), default="2026-11-30")
    coverage_type = Column(String(150), default="PMFBY Comprehensive Standing & Localized Calamity Coverage")
    status = Column(String(30), default="ACTIVE")  # ACTIVE, EXPIRED, CLAIMED
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="policies")
    crop = relationship("Crop", back_populates="policies")
    claims = relationship("InsuranceClaim", back_populates="policy")


# 6. crop_images
class CropImage(Base):
    __tablename__ = "crop_images"

    id = Column(Integer, primary_key=True, index=True)
    image_uid = Column(String(50), unique=True, index=True, nullable=False)
    image_id = Column(String(50), index=True, nullable=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True, index=True)
    image_url = Column(Text, nullable=True)
    image_path = Column(String(255), nullable=True)
    original_filename = Column(String(255), nullable=True)
    file_type = Column(String(50), default="image/jpeg")
    file_size = Column(Integer, default=0)
    image_hash = Column(String(64), index=True, nullable=True)
    latitude = Column(Float, nullable=True, default=29.6857)
    longitude = Column(Float, nullable=True, default=76.9905)
    gps_accuracy = Column(Float, nullable=True, default=5.0)
    altitude = Column(String(20), default="248m")
    device_info = Column(String(120), default="Mobile GNSS Telemetry")
    client_capture_time = Column(String(40), nullable=True)
    server_upload_time = Column(DateTime, default=datetime.utcnow)
    tamper_check = Column(String(50), default="PASSED (EXIF Hash Verified)")
    geo_fence_valid = Column(Boolean, default=True)
    distance_from_plot_meters = Column(Float, default=14.2)
    image_quality_status = Column(String(50), default="PASSED")
    blur_score = Column(Float, default=125.0)
    brightness_score = Column(Float, default=140.0)
    resolution = Column(String(40), default="1920x1080")
    verification_status = Column(String(50), default="PENDING_REVIEW")
    ai_analysis_status = Column(String(50), default="PENDING")
    officer_remarks = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    category = Column(String(80), default="Field Disease Surveillance")
    captured_at = Column(String(30), default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="images")
    crop = relationship("Crop", back_populates="images")
    ai_report = relationship("AiAnalysisReport", back_populates="crop_image", uselist=False, cascade="all, delete-orphan")


# 7. ai_analysis_reports
class AiAnalysisReport(Base):
    __tablename__ = "ai_analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_uid = Column(String(30), unique=True, index=True, nullable=False)
    crop_image_id = Column(Integer, ForeignKey("crop_images.id", ondelete="CASCADE"), unique=True)
    diagnosis_type = Column(String(30), default="DISEASE")  # DISEASE, DAMAGE, PEST
    primary_issue = Column(String(120), default="Bacterial Leaf Blight (Xanthomonas oryzae)")
    confidence_score = Column(Float, default=94.6)
    severity_percentage = Column(Float, default=42.5)
    affected_area_ratio = Column(String(80), default="1.36 Acres affected out of 3.2 Acres")
    risk_category = Column(String(30), default="HIGH")  # LOW, MEDIUM, HIGH, SEVERE
    recommendation = Column(Text, nullable=True)
    bounding_boxes_json = Column(Text, nullable=True)
    pixel_segmentation_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    crop_image = relationship("CropImage", back_populates="ai_report")
    disease_detection = relationship("DiseaseDetection", back_populates="ai_report", uselist=False)
    pest_detection = relationship("PestDetection", back_populates="ai_report", uselist=False)


# 8. disease_detections
class DiseaseDetection(Base):
    __tablename__ = "disease_detections"

    id = Column(Integer, primary_key=True, index=True)
    ai_report_id = Column(Integer, ForeignKey("ai_analysis_reports.id", ondelete="CASCADE"), unique=True)
    pathogen_name = Column(String(120), default="Xanthomonas oryzae pv. oryzae")
    lesion_type = Column(String(80), default="Marginal Wavy Chlorotic Blight")
    chlorosis_ratio = Column(Float, default=18.2)
    symptoms_json = Column(Text, nullable=True)
    recommended_fungicide = Column(String(150), default="Copper Oxychloride 50% WP + Streptocycline")

    ai_report = relationship("AiAnalysisReport", back_populates="disease_detection")


# 9. pest_detections
class PestDetection(Base):
    __tablename__ = "pest_detections"

    id = Column(Integer, primary_key=True, index=True)
    ai_report_id = Column(Integer, ForeignKey("ai_analysis_reports.id", ondelete="CASCADE"), unique=True)
    pest_specie = Column(String(120), default="Spotted Bollworm & Whitefly")
    infestation_stage = Column(String(80), default="Larval Square Boring")
    etl_breached = Column(Boolean, default=True)
    affected_plant_parts = Column(String(100), default="Young squares and foliage")
    bio_control_method = Column(String(150), default="Neem Seed Kernel Extract (NSKE 5%) + Sticky Traps")

    ai_report = relationship("AiAnalysisReport", back_populates="pest_detection")


# 10. treatment_recommendations
class TreatmentRecommendation(Base):
    __tablename__ = "treatment_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    issue_name = Column(String(120), nullable=False)
    treatment_type = Column(String(80), default="Chemical & Biological Integrated")
    chemical_product = Column(String(200), nullable=False)
    chemical_dosage = Column(String(150), nullable=False)
    chemical_method = Column(String(150), nullable=False)
    safety_period_days = Column(String(50), default="14 days")
    organic_product = Column(String(200), nullable=False)
    organic_dosage = Column(String(150), nullable=False)
    organic_benefits = Column(Text, nullable=False)
    preventive_measures_json = Column(Text, nullable=True)


# 11. treatment_history
class TreatmentHistory(Base):
    __tablename__ = "treatment_history"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    issue_treated = Column(String(120), nullable=False)
    treatment_applied = Column(String(200), nullable=False)
    dosage_used = Column(String(100), nullable=False)
    date_applied = Column(String(20), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    status = Column(String(30), default="APPLIED")  # APPLIED, RECOVERING, RESOLVED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="treatment_history")
    crop = relationship("Crop", back_populates="treatments")


# 12. insurance_claims
class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_ticket_no = Column(String(50), unique=True, index=True, nullable=False)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id"))
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    incident_date = Column(String(20), nullable=False)
    cause_of_loss = Column(String(80), default="HAILSTORM_AND_INUNDATION")
    cause_label = Column(String(150), default="Severe Localized Hailstorm & Torrential Inundation")
    claimed_amount = Column(Float, nullable=False)
    ai_assessed_loss_pct = Column(Float, default=68.0)
    ai_recommended_amount = Column(Float, default=119680.0)
    officer_approved_amount = Column(Float, nullable=True)
    status = Column(String(40), default="UNDER_OFFICER_REVIEW")  # SUBMITTED, UNDER_OFFICER_REVIEW, APPROVED, REJECTED, SETTLED_DISBURSED
    officer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("InsurancePolicy", back_populates="claims")
    farmer = relationship("Farmer", back_populates="claims")
    crop = relationship("Crop", back_populates="claims")
    verifications = relationship("ClaimVerification", back_populates="claim")
    inspections = relationship("FieldInspection", back_populates="claim")
    weather_records = relationship("WeatherRecord", back_populates="claim")


# 13. claim_verifications
class ClaimVerification(Base):
    __tablename__ = "claim_verifications"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("insurance_claims.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    decision = Column(String(40), default="APPROVED")  # APPROVED, REJECTED, ADDITIONAL_EVIDENCE_REQUESTED
    approved_amount = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("InsuranceClaim", back_populates="verifications")
    officer = relationship("Officer", back_populates="verifications")


# 14. field_inspections
class FieldInspection(Base):
    __tablename__ = "field_inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_uid = Column(String(40), unique=True, index=True, nullable=False)
    claim_id = Column(Integer, ForeignKey("insurance_claims.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    scheduled_date = Column(String(20), nullable=False)
    priority = Column(String(30), default="URGENT")  # URGENT, MEDIUM, ROUTINE
    purpose = Column(Text, nullable=False)
    status = Column(String(30), default="SCHEDULED")  # SCHEDULED, PENDING_DISPATCH, COMPLETED
    findings_report = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("InsuranceClaim", back_populates="inspections")
    officer = relationship("Officer", back_populates="inspections")


# 15. weather_records
class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("insurance_claims.id", ondelete="SET NULL"), nullable=True)
    station_name = Column(String(100), default="IMD Karnal Agro-Meteorological Observatory")
    latitude = Column(Float, default=29.6857)
    longitude = Column(Float, default=76.9905)
    record_date = Column(String(20), default="2026-08-14")
    rainfall_mm = Column(Float, default=84.5)
    normal_rainfall_mm = Column(Float, default=12.0)
    precipitation_anomaly_pct = Column(Float, default=604.0)
    temperature_c = Column(Float, default=28.4)
    humidity_pct = Column(Float, default=84.0)
    hailstorm_detected = Column(Boolean, default=True)
    correlation_status = Column(String(50), default="AUTHENTIC (High Correlation)")

    claim = relationship("InsuranceClaim", back_populates="weather_records")


# 16. notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    role = Column(String(20), default="FARMER")  # FARMER, OFFICER, ALL
    notif_type = Column(String(50), default="CLAIM_STATUS")
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

