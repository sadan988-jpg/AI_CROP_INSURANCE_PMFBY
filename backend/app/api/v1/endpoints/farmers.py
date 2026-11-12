import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.api.v1.endpoints.auth import get_current_user, require_role
from backend.app.models import (
    User, Farmer, InsurancePolicy, TreatmentRecommendation, TreatmentHistory, Notification
)

router = APIRouter(prefix="/farmers", tags=["Farmer Portal Services"])

class ProfileUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    totalLandAcres: Optional[float] = None
    bankAccount: Optional[str] = None
    ifsc: Optional[str] = None

class TreatmentLogRequest(BaseModel):
    cropId: Optional[str] = None
    cropName: str
    issueTreated: str
    treatmentApplied: str
    dosageUsed: str
    notes: Optional[str] = None

@router.get("/profile")
def get_farmer_profile(current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    return {
        "id": farmer.farmer_uid,
        "fullName": farmer.full_name,
        "phone": current_user.phone,
        "aadhaarMasked": farmer.aadhaar_masked,
        "aadhaarStatus": "VERIFIED",
        "fatherName": farmer.father_name,
        "gender": farmer.gender,
        "dob": farmer.dob,
        "casteCategory": farmer.caste_category,
        "bankAccount": {
            "accountNumber": farmer.bank_account_number,
            "bankName": farmer.bank_name,
            "branch": f"{farmer.district} Agri-Branch, {farmer.state}",
            "ifsc": farmer.ifsc_code,
            "payoutMode": "Aadhaar Enabled Payment System (AEPS / DBT)",
            "verified": farmer.bank_verified,
        },
        "address": {
            "village": farmer.village,
            "tehsil": farmer.tehsil,
            "district": farmer.district,
            "state": farmer.state,
            "pincode": farmer.pincode,
        },
        "landHoldingsTotalAcres": farmer.total_land_acres,
    }

@router.put("/profile")
def update_farmer_profile(req: ProfileUpdateRequest, current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    if req.fullName:
        farmer.full_name = req.fullName
    if req.village:
        farmer.village = req.village
    if req.tehsil:
        farmer.tehsil = req.tehsil
    if req.district:
        farmer.district = req.district
    if req.totalLandAcres is not None:
        farmer.total_land_acres = req.totalLandAcres
    if req.bankAccount:
        farmer.bank_account_number = req.bankAccount
    if req.ifsc:
        farmer.ifsc_code = req.ifsc

    db.commit()
    return {"message": "Farmer profile updated successfully"}

@router.get("/policies")
def get_farmer_policies(current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    policies = db.query(InsurancePolicy).filter(InsurancePolicy.farmer_id == farmer.id).all()
    
    # Format to match frontend structure
    result = []
    for p in policies:
        result.append({
            "id": p.policy_number,
            "cropId": p.crop.crop_uid if p.crop else "CRP-01",
            "cropName": p.crop.crop_name if p.crop else "Paddy",
            "season": p.season,
            "sumInsured": p.sum_insured,
            "farmerSharePremium": p.farmer_premium,
            "centralSubsidy": p.central_subsidy,
            "stateSubsidy": p.state_subsidy,
            "totalGrossPremium": p.total_gross_premium,
            "insuranceCompany": p.insurance_company,
            "policyStartDate": p.policy_start_date,
            "policyEndDate": p.policy_end_date,
            "coverageType": p.coverage_type,
            "status": p.status,
            "certificateUrl": "#",
        })
    return result

@router.get("/treatment-recommendations")
def get_treatment_recommendations(db: Session = Depends(get_db)):
    recommendations = db.query(TreatmentRecommendation).all()
    result = []
    for r in recommendations:
        preventive = []
        if r.preventive_measures_json:
            try:
                preventive = json.loads(r.preventive_measures_json)
            except Exception:
                preventive = []

        result.append({
            "id": f"TRT-00{r.id}",
            "issueName": r.issue_name,
            "type": r.treatment_type,
            "chemicalTreatment": {
                "product": r.chemical_product,
                "dosage": r.chemical_dosage,
                "applicationMethod": r.chemical_method,
                "safetyPeriodWaiting": r.safety_period_days,
            },
            "organicTreatment": {
                "product": r.organic_product,
                "dosage": r.organic_dosage,
                "benefits": r.organic_benefits,
            },
            "preventiveGuidelines": preventive,
        })
    return result

@router.get("/treatment-history")
def get_treatment_history(current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    history = db.query(TreatmentHistory).filter(TreatmentHistory.farmer_id == farmer.id).order_by(TreatmentHistory.id.desc()).all()
    
    return [
        {
            "id": f"LOG-{h.id + 500}",
            "cropId": h.crop.crop_uid if h.crop else "CRP-01",
            "cropName": h.crop.crop_name if h.crop else "Paddy",
            "issueTreated": h.issue_treated,
            "treatmentApplied": h.treatment_applied,
            "dosageUsed": h.dosage_used,
            "dateApplied": h.date_applied,
            "status": h.status,
            "notes": h.notes,
        }
        for h in history
    ]

@router.post("/treatment-history")
def add_treatment_history(req: TreatmentLogRequest, current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    farmer = current_user.farmer_profile
    log = TreatmentHistory(
        farmer_id=farmer.id,
        issue_treated=req.issueTreated,
        treatment_applied=req.treatmentApplied,
        dosage_used=req.dosageUsed,
        notes=req.notes,
        status="APPLIED"
    )
    db.add(log)
    db.commit()
    return {"message": "Treatment log saved successfully", "id": f"LOG-{log.id + 500}"}

@router.get("/notifications")
def get_farmer_notifications(current_user: User = Depends(require_role("FARMER")), db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        (Notification.role == "FARMER") | (Notification.role == "ALL")
    ).order_by(Notification.id.desc()).all()

    return [
        {
            "id": f"NOTIF-{n.id}",
            "role": n.role,
            "type": n.notif_type,
            "title": n.title,
            "message": n.message,
            "timestamp": n.created_at.strftime("%Y-%m-%d %H:%M"),
            "read": n.read,
        }
        for n in notifs
    ]

@router.patch("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raw_id = int(notif_id.replace("NOTIF-", "")) if "NOTIF-" in notif_id else int(notif_id)
    notif = db.query(Notification).filter(Notification.id == raw_id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"message": "Marked read"}

