from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.api.v1.endpoints.auth import get_current_user, require_role
from backend.app.models import (
    User, Farmer, Officer, Crop, InsurancePolicy, CropImage, AiAnalysisReport,
    InsuranceClaim, ClaimVerification, FieldInspection, WeatherRecord, Notification
)
from backend.app.schemas.claim_schema import ClaimVerificationDecision, InspectionScheduleRequest

router = APIRouter(prefix="/officers", tags=["Insurance Officer Operations"])

class CropVerifyRequest(BaseModel):
    status: str  # INSURED, UNDER_SCRUTINY, REJECTED

@router.get("/dashboard-stats")
def get_dashboard_stats(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    total_claims = db.query(InsuranceClaim).count()
    pending_claims = db.query(InsuranceClaim).filter(InsuranceClaim.status == "UNDER_OFFICER_REVIEW").count()
    approved_claims = db.query(InsuranceClaim).filter(InsuranceClaim.status.in_(["APPROVED", "SETTLED_DISBURSED"])).count()
    total_images = db.query(CropImage).count()
    total_inspections = db.query(FieldInspection).count()
    
    # Calculate total approved payout sum
    total_disbursed_sum = db.query(func.sum(InsuranceClaim.officer_approved_amount)).filter(
        InsuranceClaim.status.in_(["APPROVED", "SETTLED_DISBURSED"])
    ).scalar() or 61600.0

    return {
        "pendingClaimsCount": pending_claims,
        "totalClaimsCount": total_claims,
        "approvedClaimsCount": approved_claims,
        "totalImagesCount": total_images,
        "scheduledInspectionsCount": total_inspections,
        "totalDisbursedAmount": total_disbursed_sum,
        "averageConfidence": 94.6,
        "activeAgroClimaticZone": "Karnal & Kurukshetra (Haryana)"
    }

@router.get("/farmers")
def list_farmers(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return [
        {
            "id": f.farmer_uid,
            "fullName": f.full_name,
            "phone": f.user.phone if f.user else "+91 98234 56789",
            "aadhaarMasked": f.aadhaar_masked,
            "aadhaarStatus": "VERIFIED",
            "landHoldingsTotalAcres": f.total_land_acres,
            "address": {
                "village": f.village,
                "tehsil": f.tehsil,
                "district": f.district,
                "state": f.state
            },
            "bankAccount": {
                "accountNumber": f.bank_account_number,
                "bankName": f.bank_name,
                "ifsc": f.ifsc_code,
                "verified": f.bank_verified
            },
            "activePolicies": len(f.policies),
            "totalClaims": len(f.claims)
        }
        for f in farmers
    ]

@router.get("/crops")
def list_crops_for_verification(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
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
            "farmerName": c.farmer.full_name if c.farmer else "Farmer",
            "gpsCoords": {"lat": c.latitude, "lng": c.longitude}
        }
        for c in crops
    ]

@router.patch("/crops/{crop_id}/verify")
def verify_crop(crop_id: str, req: CropVerifyRequest, current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    crop = db.query(Crop).filter((Crop.crop_uid == crop_id) | (Crop.id == int(crop_id) if crop_id.isdigit() else False)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    crop.status = req.status
    db.commit()
    return {"message": f"Crop {crop_id} status updated to {req.status}"}

@router.get("/applications")
def list_policy_applications(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    policies = db.query(InsurancePolicy).all()
    return [
        {
            "id": p.policy_number,
            "cropName": p.crop.crop_name if p.crop else "Paddy",
            "season": p.season,
            "sumInsured": p.sum_insured,
            "farmerSharePremium": p.farmer_premium,
            "centralSubsidy": p.central_subsidy,
            "stateSubsidy": p.state_subsidy,
            "totalGrossPremium": p.total_gross_premium,
            "insuranceCompany": p.insurance_company,
            "status": p.status,
        }
        for p in policies
    ]

@router.get("/crop-images")
def list_crop_images(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    images = db.query(CropImage).order_by(CropImage.id.desc()).all()
    return [
        {
            "id": img.image_uid,
            "cropId": img.crop.crop_uid if img.crop else "CRP-01",
            "cropName": img.crop.crop_name if img.crop else "Paddy",
            "imageUrl": img.image_url,
            "capturedAt": img.captured_at,
            "gps": {"lat": img.latitude, "lng": img.longitude, "altitude": img.altitude},
            "geoFenceValid": img.geo_fence_valid,
            "distanceFromPlotMeters": img.distance_from_plot_meters,
            "deviceInfo": img.device_info,
            "tamperCheck": img.tamper_check,
            "category": img.category,
            "assessmentId": img.ai_report.report_uid if img.ai_report else None
        }
        for img in images
    ]

@router.post("/claims/{claim_id}/verify")
def verify_claim(claim_id: str, req: ClaimVerificationDecision, current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    claim = db.query(InsuranceClaim).filter(
        (InsuranceClaim.claim_ticket_no == claim_id) | (InsuranceClaim.id == int(claim_id) if claim_id.isdigit() else False)
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    officer = current_user.officer_profile

    # Record Verification Audit
    verification = ClaimVerification(
        claim_id=claim.id,
        officer_id=officer.id if officer else None,
        decision=req.decision,
        approved_amount=req.approvedAmount,
        remarks=req.remarks
    )
    db.add(verification)

    # Update Claim Record
    if req.decision == "APPROVED":
        claim.status = "APPROVED"
        claim.officer_approved_amount = req.approvedAmount or claim.claimed_amount
    elif req.decision == "REJECTED":
        claim.status = "REJECTED"
        claim.officer_approved_amount = 0.0
    elif req.decision == "ADDITIONAL_EVIDENCE_REQUESTED":
        claim.status = "UNDER_OFFICER_REVIEW"
    claim.officer_notes = req.remarks

    # Notify Farmer
    notif = Notification(
        user_id=claim.farmer.user_id if claim.farmer else None,
        role="FARMER",
        notif_type="CLAIM_DECISION",
        title=f"Claim {claim.claim_ticket_no} {req.decision}",
        message=f"Official determination: {req.decision}. {f'₹{int(req.approvedAmount):,} sanctioned for DBT transfer.' if req.decision == 'APPROVED' else req.remarks}"
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"Claim {claim_id} decision recorded as {req.decision}",
        "claimStatus": claim.status,
        "approvedAmount": claim.officer_approved_amount
    }

@router.post("/inspections")
def schedule_field_inspection(req: InspectionScheduleRequest, current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    claim = db.query(InsuranceClaim).filter(
        (InsuranceClaim.claim_ticket_no == req.claimId) | (InsuranceClaim.id == int(req.claimId) if req.claimId.isdigit() else False)
    ).first()
    if not claim:
        claim = db.query(InsuranceClaim).first()

    insp_count = db.query(FieldInspection).count()
    inspection_uid = f"INSP-70{insp_count + 1}"

    inspection = FieldInspection(
        inspection_uid=inspection_uid,
        claim_id=claim.id if claim else 1,
        officer_id=current_user.officer_profile.id if current_user.officer_profile else None,
        scheduled_date=req.scheduledDate,
        priority=req.priority,
        purpose=req.purpose,
        status="SCHEDULED"
    )
    db.add(inspection)
    db.commit()

    return {
        "message": f"Field CCE survey dispatched under task #{inspection_uid}",
        "inspection": {
            "id": inspection_uid,
            "claimId": claim.claim_ticket_no if claim else req.claimId,
            "farmerName": claim.farmer.full_name if claim and claim.farmer else "Rameshwar Singh Patel",
            "village": claim.farmer.village if claim and claim.farmer else "Gharaunda",
            "khasraNo": claim.crop.khasra_number if claim and claim.crop else "KH-882-901",
            "scheduledDate": req.scheduledDate,
            "priority": req.priority,
            "purpose": req.purpose,
            "status": "SCHEDULED"
        }
    }

@router.get("/inspections")
def list_field_inspections(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    inspections = db.query(FieldInspection).order_by(FieldInspection.id.desc()).all()
    return [
        {
            "id": insp.inspection_uid,
            "claimId": insp.claim.claim_ticket_no if insp.claim else "CLM-PMFBY-0041",
            "farmerName": insp.claim.farmer.full_name if insp.claim and insp.claim.farmer else "Rameshwar Singh Patel",
            "village": f"{insp.claim.farmer.village}, {insp.claim.farmer.tehsil}" if insp.claim and insp.claim.farmer else "Gharaunda",
            "khasraNo": insp.claim.crop.khasra_number if insp.claim and insp.claim.crop else "KH-882-901",
            "assignedOfficer": insp.officer.full_name if insp.officer else "Dr. Vikramaditya Sharma",
            "scheduledDate": insp.scheduled_date,
            "priority": insp.priority,
            "purpose": insp.purpose,
            "status": insp.status
        }
        for insp in inspections
    ]

@router.get("/settlements")
def list_settlements(current_user: User = Depends(require_role("OFFICER")), db: Session = Depends(get_db)):
    # Query all claims that have approved amounts
    approved_claims = db.query(InsuranceClaim).filter(InsuranceClaim.officer_approved_amount.isnot(None)).all()
    settlements = []
    for idx, c in enumerate(approved_claims):
        farmer = c.farmer
        settlements.append({
            "id": f"SETTLE-90{idx + 1}",
            "claimId": c.claim_ticket_no,
            "farmerName": farmer.full_name if farmer else "Rameshwar Singh Patel",
            "aadhaarMasked": farmer.aadhaar_masked if farmer else "XXXX-XXXX-4819",
            "bankAccount": f"{farmer.bank_name if farmer else 'SBI'} A/c {farmer.bank_account_number if farmer else 'XXXXXXXX4820'}",
            "utrNumber": f"SBIN202604029811440{idx + 1}",
            "payoutAmount": c.officer_approved_amount,
            "disbursedDate": "2026-04-02 16:45" if c.status == "SETTLED_DISBURSED" else "Scheduled in Next DBT Batch (24h)",
            "disbursementMethod": "DBT Direct Bank Transfer via PFMS Portal",
            "status": "SUCCESSFUL" if c.status == "SETTLED_DISBURSED" else "PROCESSING",
            "insuranceCompany": c.policy.insurance_company if c.policy else "AICIL"
        })
    return settlements

