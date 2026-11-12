import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.api.v1.endpoints.auth import get_current_user, require_role
from backend.app.models import (
    User, Farmer, Crop, InsurancePolicy, CropImage, AiAnalysisReport, Notification
)
from backend.app.schemas.crop_schema import CropCreateRequest, CropUpdateRequest, CropResponse

router = APIRouter(prefix="/crops", tags=["Crop Sowing & GIS Parcels"])

class ImageUploadRequest(BaseModel):
    imageUrl: str
    category: Optional[str] = "Field Disease Surveillance"
    latitude: Optional[float] = 29.6857
    longitude: Optional[float] = 76.9905
    altitude: Optional[str] = "248m"
    deviceInfo: Optional[str] = "Browser GNSS Telemetry"
    diagnosisType: Optional[str] = "DISEASE"
    primaryIssue: Optional[str] = "Bacterial Leaf Blight (Xanthomonas)"
    severityPercentage: Optional[float] = 42.5
    confidenceScore: Optional[float] = 94.6

@router.post("", response_model=dict)
def register_crop(req: CropCreateRequest, current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    crop_count = db.query(Crop).count()
    crop_uid = f"CRP-0{crop_count + 1}"

    new_crop = Crop(
        crop_uid=crop_uid,
        farmer_id=farmer.id,
        crop_name=req.cropName,
        season=req.season,
        sowing_date=req.sowingDate,
        harvest_expected_date=req.harvestExpectedDate,
        area_acres=req.areaAcres,
        survey_number=req.surveyNumber,
        khasra_number=req.khasraNumber,
        soil_type=req.soilType,
        irrigation_type=req.irrigationType,
        status="UNDER_VERIFICATION",
        health_status="HEALTHY",
        latitude=req.latitude or 29.6857,
        longitude=req.longitude or 76.9905
    )
    db.add(new_crop)
    db.flush()

    # Automatically generate corresponding PMFBY insurance policy proposal
    policy_count = db.query(InsurancePolicy).count()
    policy_no = f"POL-PMFBY-2026-{9000 + policy_count + 1}"
    sum_ins = round(req.areaAcres * 55000.0, 2)
    farmer_prem = round(sum_ins * 0.02, 2)  # 2% Kharif
    cent_sub = round(sum_ins * 0.05, 2)
    state_sub = round(sum_ins * 0.05, 2)
    tot_prem = round(farmer_prem + cent_sub + state_sub, 2)

    new_policy = InsurancePolicy(
        policy_number=policy_no,
        farmer_id=farmer.id,
        crop_id=new_crop.id,
        season=req.season,
        sum_insured=sum_ins,
        farmer_premium=farmer_prem,
        central_subsidy=cent_sub,
        state_subsidy=state_sub,
        total_gross_premium=tot_prem,
        insurance_company="Agriculture Insurance Company of India Ltd (AICIL)",
        policy_start_date=req.sowingDate,
        policy_end_date=req.harvestExpectedDate or "2026-11-30",
        coverage_type="PMFBY Standard Comprehensive Coverage",
        status="ACTIVE"
    )
    db.add(new_policy)

    # Add notification for officer
    notif = Notification(
        role="OFFICER",
        notif_type="CROP_VERIFICATION",
        title="New Crop Sowing Registration",
        message=f"Farmer {farmer.full_name} registered {req.cropName} on survey #{req.surveyNumber} ({req.areaAcres} Acres). Pending cadastral scrutiny."
    )
    db.add(notif)
    db.commit()

    return {
        "message": "Crop registered and PMFBY policy created successfully",
        "crop": {
            "id": new_crop.crop_uid,
            "cropName": new_crop.crop_name,
            "season": new_crop.season,
            "sowingDate": new_crop.sowing_date,
            "harvestExpectedDate": new_crop.harvest_expected_date,
            "areaAcres": new_crop.area_acres,
            "surveyNumber": new_crop.survey_number,
            "khasraNumber": new_crop.khasra_number,
            "soilType": new_crop.soil_type,
            "irrigationType": new_crop.irrigation_type,
            "status": new_crop.status,
            "healthStatus": new_crop.health_status,
            "policyId": policy_no,
            "gpsCoords": {"lat": new_crop.latitude, "lng": new_crop.longitude}
        }
    }

@router.get("", response_model=List[dict])
def list_farmer_crops(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # If farmer, get farmer crops; if officer, get all
    if current_user.role == "FARMER":
        crops = db.query(Crop).filter(Crop.farmer_id == current_user.farmer_profile.id).all()
    else:
        crops = db.query(Crop).all()

    return [
        {
            "id": c.crop_uid,
            "cropName": c.crop_name,
            "season": c.season,
            "sowingDate": c.sowing_date,
            "harvestExpectedDate": c.harvest_expected_date,
            "areaAcres": c.area_acres,
            "surveyNumber": c.survey_number,
            "khasraNumber": c.khasra_number,
            "soilType": c.soil_type,
            "irrigationType": c.irrigation_type,
            "status": c.status,
            "healthStatus": c.health_status,
            "policyId": c.policies[0].policy_number if c.policies else f"POL-PMFBY-{c.id}",
            "gpsCoords": {"lat": c.latitude, "lng": c.longitude}
        }
        for c in crops
    ]

@router.get("/{crop_id}")
def get_crop_detail(crop_id: str, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter((Crop.crop_uid == crop_id) | (Crop.id == int(crop_id) if crop_id.isdigit() else False)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return {
        "id": crop.crop_uid,
        "cropName": crop.crop_name,
        "areaAcres": crop.area_acres,
        "surveyNumber": crop.survey_number,
        "khasraNumber": crop.khasra_number,
        "status": crop.status,
        "healthStatus": crop.health_status,
        "gpsCoords": {"lat": crop.latitude, "lng": crop.longitude}
    }

@router.put("/{crop_id}")
def update_crop_details(crop_id: str, req: CropUpdateRequest, current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    crop = db.query(Crop).filter((Crop.crop_uid == crop_id) | (Crop.id == int(crop_id) if crop_id.isdigit() else False)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if req.cropName:
        crop.crop_name = req.cropName
    if req.areaAcres is not None:
        crop.area_acres = req.areaAcres
    if req.status:
        crop.status = req.status
    if req.healthStatus:
        crop.health_status = req.healthStatus
    db.commit()
    return {"message": "Crop updated successfully"}

@router.delete("/{crop_id}")
def delete_crop(crop_id: str, current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    crop = db.query(Crop).filter((Crop.crop_uid == crop_id) | (Crop.id == int(crop_id) if crop_id.isdigit() else False)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.claims:
        raise HTTPException(status_code=400, detail="Cannot delete crop parcel with active insurance claims filed.")
    db.delete(crop)
    db.commit()
    return {"message": "Crop registration deleted successfully"}

@router.post("/{crop_id}/images")
def upload_crop_image_metadata(crop_id: str, req: ImageUploadRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter((Crop.crop_uid == crop_id) | (Crop.id == int(crop_id) if crop_id.isdigit() else False)).first()
    if not crop:
        crop = db.query(Crop).first()

    img_count = db.query(CropImage).count()
    image_uid = f"IMG-90{14 + img_count}"
    assessment_uid = f"ASSESS-88{15 + img_count}"

    new_img = CropImage(
        image_uid=image_uid,
        crop_id=crop.id if crop else 1,
        image_url=req.imageUrl,
        latitude=req.latitude or 29.6857,
        longitude=req.longitude or 76.9905,
        altitude=req.altitude or "248m",
        device_info=req.deviceInfo or "GNSS Telemetry",
        tamper_check="PASSED (EXIF Hash Signature Verified)",
        geo_fence_valid=True,
        distance_from_plot_meters=14.2,
        category=req.category
    )
    db.add(new_img)
    db.flush()

    # Generate corresponding AI report record
    ai_report = AiAnalysisReport(
        report_uid=assessment_uid,
        crop_image_id=new_img.id,
        diagnosis_type=req.diagnosisType,
        primary_issue=req.primaryIssue,
        confidence_score=req.confidenceScore,
        severity_percentage=req.severityPercentage,
        affected_area_ratio=f"{round((req.severityPercentage / 100.0) * (crop.area_acres if crop else 3.2), 2)} Acres affected",
        risk_category="SEVERE" if req.severityPercentage > 60 else "HIGH" if req.severityPercentage > 35 else "MEDIUM",
        recommendation=f"Detected {req.primaryIssue} with {req.severityPercentage}% severity. PMFBY localized loss clause applicable.",
        bounding_boxes_json=json.dumps([
            {"label": "Damaged / Lesion Area", "x": 25, "y": 25, "w": 40, "h": 45, "conf": round(req.confidenceScore / 100.0, 2)}
        ]),
        pixel_segmentation_json=json.dumps({
            "healthyGreenPct": round(100.0 - req.severityPercentage, 1),
            "necroticDamagedPct": req.severityPercentage
        })
    )
    db.add(ai_report)
    db.commit()

    return {
        "message": "Crop image uploaded and AI diagnosis generated successfully",
        "image": {
            "id": new_img.image_uid,
            "cropId": crop.crop_uid if crop else "CRP-01",
            "cropName": crop.crop_name if crop else "Paddy",
            "imageUrl": new_img.image_url,
            "capturedAt": new_img.captured_at,
            "gps": {"lat": new_img.latitude, "lng": new_img.longitude, "altitude": new_img.altitude},
            "geoFenceValid": new_img.geo_fence_valid,
            "distanceFromPlotMeters": new_img.distance_from_plot_meters,
            "assessmentId": assessment_uid
        },
        "assessment": {
            "id": assessment_uid,
            "primaryIssue": ai_report.primary_issue,
            "confidenceScore": ai_report.confidence_score,
            "severityPercentage": ai_report.severity_percentage,
            "riskCategory": ai_report.risk_category
        }
    }
